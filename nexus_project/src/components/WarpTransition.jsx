import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WarpCanvas = forwardRef(function WarpCanvas({ scrollContainerRef }, ref) {
  const canvasRef    = useRef(null)
  const starsRef     = useRef([])
  const progressRef  = useRef(0)
  const rafRef       = useRef(null)
  const vignetteRef  = useRef(null)
  const sectionRef   = useRef(null)
  const tlRef        = useRef(null)

  useImperativeHandle(ref, () => ({
    getCanvas:   () => canvasRef.current,
    getVignette: () => vignetteRef.current,
    getSection:  () => sectionRef.current,
  }))

  // ── Build star field (deep-space colors only — no white) ─────────────────
  const buildStars = (w, h) => {
    const cx = w / 2, cy = h / 2
    const stars = []
    const COUNT = 380
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist  = 30 + Math.random() * Math.max(w, h) * 0.58
      const x = cx + Math.cos(angle) * dist
      const y = cy + Math.sin(angle) * dist
      const size = 0.3 + Math.random() * 1.2

      // Deep-space palette: indigo / cyan / violet / gold — never plain white
      const palette = [
        { hue: 220 + Math.random() * 30, sat: 65 + Math.random() * 25 },  // indigo-blue
        { hue: 185 + Math.random() * 20, sat: 70 + Math.random() * 25 },  // cyan
        { hue: 270 + Math.random() * 30, sat: 55 + Math.random() * 30 },  // violet
        { hue: 42  + Math.random() * 12, sat: 70 + Math.random() * 20 },  // warm gold
      ]
      const pick = palette[Math.floor(Math.random() * palette.length)]

      stars.push({
        x, y, angle, dist, size,
        hue: pick.hue, sat: pick.sat,
        baseAlpha: 0.35 + Math.random() * 0.45,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 2,
      })
    }
    starsRef.current = stars
  }

  // ── Draw loop ─────────────────────────────────────────────────────────────
  let frameCount = 0
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    const p = progressRef.current
    const cx = w / 2, cy = h / 2
    frameCount++

    ctx.clearRect(0, 0, w, h)
    if (p >= 0.98) { rafRef.current = requestAnimationFrame(draw); return }

    const stars = starsRef.current
    const t = frameCount * 0.016   // synthetic time

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]

      // Gentle twinkle at rest
      const twinkleAlpha = p < 0.08
        ? s.baseAlpha * (0.7 + 0.3 * Math.sin(t * s.twinkleSpeed + s.twinkle))
        : s.baseAlpha

      const dx = s.x - cx
      const dy = s.y - cy
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const ux = dx / len, uy = dy / len

      // Streak grows quadratically with scroll
      const streakLen = p < 0.05
        ? s.size
        : s.size + p * p * 700

      const tailX = s.x - ux * streakLen * 0.3
      const tailY = s.y - uy * streakLen * 0.3
      const headX = s.x + ux * streakLen * 0.7
      const headY = s.y + uy * streakLen * 0.7

      // Keep colors in deep-space range — shift toward cyan/blue at speed
      const hue  = s.hue - p * 20          // slight blue shift, stays away from white
      const sat  = Math.min(100, s.sat + p * 30)
      const ligh = 50 + p * 20             // max ~70, never 95+
      const alpha = Math.min(0.95, twinkleAlpha + p * 0.4)
      const width = s.size * (1 + p * 3)

      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
      grad.addColorStop(0,   `hsla(${hue},${sat}%,${ligh}%,0)`)
      grad.addColorStop(0.35,`hsla(${hue},${sat}%,${ligh}%,${alpha * 0.3})`)
      grad.addColorStop(1,   `hsla(${hue},${sat}%,${Math.min(ligh + 15, 75)}%,${alpha})`)

      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(headX, headY)
      ctx.strokeStyle = grad
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.stroke()

      // Head glow dot
      if (p > 0.08) {
        ctx.beginPath()
        ctx.arc(headX, headY, width * 0.9, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue},${Math.min(100, sat + 15)}%,${Math.min(ligh + 10, 72)}%,${alpha * p})`
        ctx.fill()
      }
    }

    rafRef.current = requestAnimationFrame(draw)
  }

  const resize = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    buildStars(canvas.width, canvas.height)
  }

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ── ScrollTrigger: smooth scroll → warp progress ─────────────────────────
  useEffect(() => {
    const container = scrollContainerRef?.current
    if (!container) return

    const proxy = { value: 0 }

    // Warp streaks — covers first 80% of scroll
    const st = ScrollTrigger.create({
      scroller: container,
      trigger:  container,
      start: 'top top',
      end:   '+=80%',
      scrub: 0.8,                          // slightly more viscous for cinematic feel
      onUpdate: (self) => {
        gsap.to(proxy, {
          value: self.progress,
          duration: 0.3,
          ease: 'power1.out',
          overwrite: true,
          onUpdate: () => { progressRef.current = proxy.value },
        })
      },
    })

    // Vignette — deep-space dark flash (no white)
    // Fades to a dark-indigo/void color so second page never gets whited out
    const tl = gsap.timeline({
      scrollTrigger: {
        scroller: container,
        trigger:  container,
        start: 'top top',
        end:   '+=100%',
        scrub: 0.5,
      },
    })

    tl
      .set(vignetteRef.current, { opacity: 0 }, 0)
      // 55–80%: dark hyperspace vignette blazes in (deep space, no white)
      .to(vignetteRef.current, { opacity: 1, duration: 0.25, ease: 'power2.in' }, 0.55)
      // 80–88%: vignette fades back out so nebula is visible
      .to(vignetteRef.current, { opacity: 0, duration: 0.08, ease: 'power1.out' }, 0.80)
      // 85–100%: skills section slides up from below
      .fromTo(
        sectionRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.18, ease: 'power3.out' },
        0.85
      )

    tlRef.current = tl

    return () => {
      st.kill()
      tl.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [scrollContainerRef])

  return (
    <>
      {/* Warp streak canvas — above Three.js, below HUD */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 20,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      {/* Dark hyperspace vignette — deep indigo, NOT white */}
      <div
        ref={vignetteRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 21,
          pointerEvents: 'none', opacity: 0,
          background: `
            radial-gradient(ellipse at center,
              rgba(10,5,40,0.98)   0%,
              rgba(20,10,70,0.92) 30%,
              rgba(30,20,100,0.7) 60%,
              rgba(15,15,60,0.3)  80%,
              rgba(2,2,9,0)      100%
            )
          `,
        }}
      />

      {/* After-warp section anchor */}
      <div ref={sectionRef} id="warp-section" style={{ opacity: 0 }} />
    </>
  )
})

export default WarpCanvas
