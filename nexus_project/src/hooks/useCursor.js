import { useEffect, useRef } from 'react'

export function useCursor() {
  const dotRef    = useRef(null)
  const ringRef   = useRef(null)
  const canvasRef = useRef(null)
  const ripplesRef = useRef([])
  const rafRef    = useRef(null)
  const mouseRef  = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  // Lagged ring position — start at center
  const ringPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  // Comet tail trail points
  const trailRef = useRef([])
  const TRAIL_LENGTH = 28

  useEffect(() => {
    const dot    = dotRef.current
    const ring   = ringRef.current
    const canvas = canvasRef.current
    if (!dot || !ring || !canvas) return

    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialise ring position off-screen so it doesn't flash at 0,0
    ring.style.transform = `translate(${ringPosRef.current.x - 15}px, ${ringPosRef.current.y - 15}px)`

    const onMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      mouseRef.current = { x, y }

      // Dot follows exactly — use transform for GPU compositing
      dot.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`

      // Add to trail
      trailRef.current.push({ x, y, age: 0 })
      if (trailRef.current.length > TRAIL_LENGTH) {
        trailRef.current.shift()
      }
    }

    const onClick = (e) => {
      // Large multi-ring ripple burst
      const colors = [
        `hsl(${220 + Math.random() * 40}, 80%, 70%)`,
        `hsl(${180 + Math.random() * 30}, 90%, 65%)`,
        `hsl(${260 + Math.random() * 30}, 75%, 72%)`,
      ]
      colors.forEach((color, i) => {
        ripplesRef.current.push({
          x: e.clientX, y: e.clientY,
          radius: i * 8,
          alpha: 1 - i * 0.2,
          color,
          speed: 5 + i * 2,
          lineWidth: 2 - i * 0.4,
        })
      })
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth lagged ring — higher lerp = less lag, feels snappier
      const rp = ringPosRef.current
      const mp = mouseRef.current
      rp.x += (mp.x - rp.x) * 0.20
      rp.y += (mp.y - rp.y) * 0.20
      // Use transform for GPU-composited, jank-free movement
      ring.style.transform = `translate(${rp.x - 15}px, ${rp.y - 15}px)`

      // Comet tail
      const trail = trailRef.current
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const t      = i / trail.length
          const alpha  = t * t * 0.75
          const width  = t * 4.5
          const hue    = 220 + (1 - t) * 60
          const sat    = 80 + t * 15
          const lum    = 65 + t * 20

          ctx.beginPath()
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
          ctx.lineTo(trail[i].x, trail[i].y)
          ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${lum}%, ${alpha})`
          ctx.lineWidth   = width
          ctx.lineCap     = 'round'
          ctx.lineJoin    = 'round'
          ctx.stroke()
        }

        // Glowing sparks drifting off the tail
        if (trail.length > 5) {
          const sparkSrc = trail[trail.length - 3]
          for (let s = 0; s < 2; s++) {
            const sx = sparkSrc.x + (Math.random() - 0.5) * 12
            const sy = sparkSrc.y + (Math.random() - 0.5) * 12
            ctx.beginPath()
            ctx.arc(sx, sy, Math.random() * 1.5 + 0.5, 0, Math.PI * 2)
            ctx.fillStyle = `hsla(${200 + Math.random() * 60}, 90%, 80%, ${Math.random() * 0.5})`
            ctx.fill()
          }
        }
      }

      // Advance trail ages
      trailRef.current.forEach(p => p.age++)
      trailRef.current = trailRef.current.filter(p => p.age < TRAIL_LENGTH * 2)

      // Ripples
      ripplesRef.current = ripplesRef.current.filter(r => r.alpha > 0.01)
      ripplesRef.current.forEach(r => {
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        const col = r.color.replace(')', `, ${r.alpha})`).replace('hsl', 'hsla')
        ctx.strokeStyle = col
        ctx.lineWidth   = r.lineWidth ?? 1.5
        ctx.stroke()

        if (r.radius > 20) {
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius * 0.55, 0, Math.PI * 2)
          ctx.strokeStyle = r.color.replace(')', `, ${r.alpha * 0.35})`).replace('hsl', 'hsla')
          ctx.lineWidth   = (r.lineWidth ?? 1.5) * 0.6
          ctx.stroke()
        }

        if (r.radius < 30) {
          const grd = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.radius)
          grd.addColorStop(0, r.color.replace(')', `, ${r.alpha * 0.15})`).replace('hsl', 'hsla'))
          grd.addColorStop(1, 'transparent')
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
          ctx.fill()
        }

        r.radius += (r.speed ?? 3.5)
        r.alpha  *= 0.91
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return { dotRef, ringRef, canvasRef }
}
