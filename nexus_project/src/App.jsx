import { useState, useCallback, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from './components/Scene'
import HUD from './components/HUD'
import DossierModal from './components/DossierModal'
import Tooltip from './components/Tooltip'
import BootLoader from './components/BootLoader'
import WarpTransition from './components/WarpTransition'
import SkillsSection from './components/SkillsSection'
import { useCursor } from './hooks/useCursor'
import { PLANETS } from './data/planets'
import nebulaBg from './assets/nebula-bg.jpg'
import rocketImg from './assets/rocket-launch.png'
import astronautImg from './assets/astronaut.jpg'
import audioSrc from './assets/Silent_Orbits.mp3'
import BigBangIntro from './components/BigBangIntro'

gsap.registerPlugin(ScrollTrigger)

const STORY_LINES = [
  { id: 0, delay: 0.5,  type: 'mono',  text: '> SYSTEM BOOT COMPLETE...' },
  { id: 1, delay: 1.8,  type: 'mono',  text: '> SOLAR SYSTEM INITIALIZED — 8 PLANETS DETECTED' },
  { id: 2, delay: 3.4,  type: 'gap' },
  { id: 3, delay: 4.0,  type: 'mono',  text: '> Long before the first line of code was written,' },
  { id: 4, delay: 5.6,  type: 'mono',  text: '> there was curiosity. A desire to build things that last.' },
  { id: 5, delay: 7.2,  type: 'gap' },
  { id: 6, delay: 7.8,  type: 'mono',  text: '> What you\'re orbiting now is not just a portfolio.' },
  { id: 7, delay: 9.2,  type: 'mono',  text: '> It\'s a solar system of skills — each planet forged in production.' },
  { id: 8, delay: 11.0, type: 'gap' },
  { id: 9, delay: 11.5, type: 'mono',  text: '> Mercury: pure speed. Venus: visual craft. Earth: the foundation.' },
  { id:10, delay: 13.0, type: 'mono',  text: '> Mars: backend systems. Jupiter: artificial intelligence.' },
  { id:11, delay: 14.5, type: 'mono',  text: '> Saturn: cloud infrastructure. Uranus: Web3. Neptune: the frontier.' },
  { id:12, delay: 16.2, type: 'gap' },
  { id:13, delay: 16.8, type: 'title', text: 'WELCOME TO THE NEXUS' },
  { id:14, delay: 18.2, type: 'sub',   text: 'Click any planet · Scroll to explore the system' },
]

// ── Planet click particle burst (HTML overlay) ────────────────────────────────
function ClickBurst({ x, y, color }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    angle: (i / 16) * Math.PI * 2,
    dist: 30 + Math.random() * 50,
    size: 3 + Math.random() * 5,
  }))
  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9000 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 ${p.size * 2}px ${color}`,
          animation: `particleBurst${i} 0.6s ease-out forwards`,
          transform: 'translate(-50%,-50%)',
        }} />
      ))}
      <style>{particles.map((p, i) => `
        @keyframes particleBurst${i} {
          0%   { transform: translate(-50%,-50%) translate(0,0); opacity: 1; }
          100% { transform: translate(-50%,-50%) translate(${Math.cos(p.angle)*p.dist}px,${Math.sin(p.angle)*p.dist}px); opacity: 0; }
        }
      `).join('')}</style>
    </div>
  )
}

// ── Welcome animation ─────────────────────────────────────────────────────────
function WelcomeAnimation({ onDismiss }) {
  const [phase, setPhase] = useState('rocket')
  const [rocketLaunched, setRocketLaunched] = useState(false)
  const [astroVisible, setAstroVisible] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    // Slight delay then launch the rocket diagonally
    const t1 = setTimeout(() => setRocketLaunched(true), 300)
    // After rocket crosses screen (~1.4s travel), switch to astronaut
    const t2 = setTimeout(() => {
      setPhase('astronaut')
      setTimeout(() => setAstroVisible(true), 100)
    }, 1900)
    // Astronaut stays 3s then fade out
    const t3 = setTimeout(() => {
      setFadingOut(true)
      setTimeout(() => onDismiss(), 900)
    }, 5200)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [onDismiss])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      pointerEvents: 'none',
      opacity: fadingOut ? 0 : 1,
      transition: fadingOut ? 'opacity 0.9s ease' : 'none',
    }}>
      {/* ── Rocket: flies diagonally from bottom-left to top-right ── */}
      {phase === 'rocket' && (
        <div style={{
          position: 'absolute',
          // Start: bottom-left corner; End: beyond top-right corner
          bottom: rocketLaunched ? '110%' : '-20%',
          left:   rocketLaunched ? '110%' : '-18%',
          transition: 'bottom 1.4s cubic-bezier(0.2,0,0.6,1), left 1.4s cubic-bezier(0.2,0,0.6,1)',
          zIndex: 60,
          // Rotate the image to aim top-right: 45° counter-clockwise
          transform: 'rotate(0deg)',
          filter: 'drop-shadow(0 0 24px rgba(255,140,40,0.95)) drop-shadow(0 0 8px #fff)',
        }}>
          <img
            src={rocketImg}
            alt="rocket"
            style={{
              width: '340px',
              height: 'auto',
              display: 'block',
              borderRadius: '8px',
            }}
          />
          {/* Exhaust flames below rocket */}
          <div style={{
            position: 'absolute',
            bottom: '-28px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          }}>
            {['🔥','🔥','✨'].map((e,i) => (
              <span key={i} style={{
                fontSize: `${28-i*6}px`,
                opacity: 0.9-i*0.2,
                animation: `exhaustFlame 0.25s ease-in-out ${i*0.08}s infinite alternate`,
              }}>{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Astronaut: appears centered with slow wobble, stays 3s ── */}
      {phase === 'astronaut' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '20px',
        }}>
          <div style={{
            opacity: astroVisible ? 1 : 0,
            transform: astroVisible ? 'scale(1)' : 'scale(0.6)',
            transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Big glowing astronaut photo */}
            <div style={{
              position: 'relative',
              animation: astroVisible ? 'slowWobble 3s ease-in-out infinite' : 'none',
            }}>
              {/* Outer glow ring */}
              <div style={{
                position: 'absolute', inset: '-16px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 70%)',
                animation: 'pulseGlow 2.5s ease-in-out infinite',
              }} />
              <img
                src={astronautImg}
                alt="astronaut"
                style={{
                  width: '460px',
                  height: '460px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid rgba(129,140,248,0.6)',
                  boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2), inset 0 0 30px rgba(129,140,248,0.1)',
                  display: 'block',
                  position: 'relative',
                  zIndex: 2,
                }}
              />
            </div>
          </div>

          {/* Text badge below */}
          <div style={{
            opacity: astroVisible ? 1 : 0,
            transform: astroVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s',
            textAlign: 'center',
            background: 'rgba(2,2,16,0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: '12px',
            padding: '14px 32px',
          }}>
            <div style={{
              color: '#818cf8',
              fontFamily: "'Orbitron', monospace",
              fontSize: '18px',
              fontWeight: 900,
              letterSpacing: '0.28em',
              textShadow: '0 0 30px rgba(129,140,248,1), 0 0 60px rgba(99,102,241,0.5)',
            }}>WELCOME TO THE NEXUS 👋</div>
            <div style={{
              color: 'rgba(200,210,255,0.45)',
              fontFamily: "'Share Tech Mono'",
              fontSize: '10px',
              letterSpacing: '0.15em',
              marginTop: '6px',
            }}>SYSTEMS ONLINE — MISSION CONTROL READY</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes exhaustFlame {
          0%   { opacity: 0.9; transform: scaleY(1); }
          100% { opacity: 0.4; transform: scaleY(0.6); }
        }
        @keyframes slowWobble {
          0%   { transform: rotate(0deg)   translateY(0px);   }
          25%  { transform: rotate(1.5deg) translateY(-8px);  }
          50%  { transform: rotate(0deg)   translateY(0px);   }
          75%  { transform: rotate(-1.5deg) translateY(8px);  }
          100% { transform: rotate(0deg)   translateY(0px);   }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1);    }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}

function StoryOverlay({ visible, onWelcomeClick, welcomeAnimating, onAnimDismiss }) {
  const [shownIds, setShownIds] = useState(new Set())
  useEffect(() => {
    if (!visible) return
    const timers = STORY_LINES.map(({ id, delay }) => setTimeout(() => setShownIds(prev => new Set([...prev, id])), delay * 1000))
    return () => timers.forEach(clearTimeout)
  }, [visible])

  if (!visible) return null
  if (welcomeAnimating) return <WelcomeAnimation onDismiss={onAnimDismiss} />

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none', gap:'4px', padding:'0 24px' }}>
      <div style={{ background:'rgba(2,2,16,0.75)', backdropFilter:'blur(14px)', border:'1px solid rgba(99,102,241,0.22)', borderRadius:'12px', padding:'32px 40px', maxWidth:'560px', width:'100%' }}>
        {STORY_LINES.map(({ id, text, type }) => {
          if (type === 'gap') return <div key={id} style={{ height:'10px' }} />
          const shown = shownIds.has(id)
          if (type === 'title') return (
            <div key={id} style={{ marginTop:'12px', textAlign:'center' }}>
              <button onClick={shown ? onWelcomeClick : undefined} style={{ background:shown?'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(34,211,238,0.1) 100%)':'transparent', border:shown?'1.5px solid rgba(129,140,248,0.55)':'1.5px solid transparent', borderRadius:'10px', padding:shown?'10px 24px':'0', cursor:shown?'none':'default', pointerEvents:shown?'auto':'none', color:'#818cf8', fontFamily:"'Orbitron', monospace", fontSize:'clamp(14px,2.5vw,20px)', fontWeight:900, letterSpacing:'0.25em', textShadow:'0 0 40px rgba(99,102,241,0.9), 0 0 80px rgba(99,102,241,0.4)', opacity:shown?1:0, transform:shown?'translateY(0) scale(1)':'translateY(10px) scale(0.98)', transition:'opacity 1.2s ease, transform 1.2s ease', outline:'none', display:'inline-flex', alignItems:'center', gap:'10px' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 50px rgba(99,102,241,0.5), 0 0 100px rgba(99,102,241,0.2)'; e.currentTarget.style.background='linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(34,211,238,0.14) 100%)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.background='linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(34,211,238,0.1) 100%)' }}>
                <span style={{ fontSize:'18px' }}>🚀</span>{text}
              </button>
            </div>
          )
          if (type === 'sub') return <div key={id} style={{ color:'rgba(255,255,255,0.3)', fontFamily:"'Share Tech Mono'", fontSize:'10px', letterSpacing:'0.15em', textAlign:'center', marginTop:'8px', opacity:shown?1:0, transition:'opacity 1s ease' }}>{text}</div>
          return <div key={id} style={{ color:'rgba(200,210,255,0.6)', fontFamily:"'Share Tech Mono', monospace", fontSize:'clamp(9px,1.2vw,11px)', letterSpacing:'0.04em', lineHeight:1.6, opacity:shown?1:0, transition:'opacity 0.8s ease' }}>{text}</div>
        })}
      </div>
    </div>
  )
}

function CameraController({ scrollRef }) {
  const { camera } = useThree()
  const targetFovRef = useRef(65)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => { const ratio = Math.min(1, el.scrollTop / window.innerHeight); targetFovRef.current = 65 - ratio * 28 }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef])
  useFrame(() => {
    if (Math.abs(camera.fov - targetFovRef.current) > 0.04) { camera.fov += (targetFovRef.current - camera.fov) * 0.06; camera.updateProjectionMatrix() }
  })
  return null
}

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

function triggerClassifiedSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime

    // Glitchy static burst
    const bufLen = ctx.sampleRate * 0.18
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen)
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const nGain = ctx.createGain()
    nGain.gain.setValueAtTime(0.35, now)
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    noise.connect(nGain); nGain.connect(ctx.destination)
    noise.start(now)

    // Dramatic bass thud
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5)
    const oGain = ctx.createGain()
    oGain.gain.setValueAtTime(0.6, now)
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    osc.connect(oGain); oGain.connect(ctx.destination)
    osc.start(now); osc.stop(now + 0.5)

    // High-pitched alert beep
    const beep = ctx.createOscillator()
    beep.type = 'square'
    beep.frequency.setValueAtTime(1200, now + 0.1)
    beep.frequency.setValueAtTime(900, now + 0.22)
    beep.frequency.setValueAtTime(1200, now + 0.34)
    const bGain = ctx.createGain()
    bGain.gain.setValueAtTime(0, now)
    bGain.gain.setValueAtTime(0.25, now + 0.1)
    bGain.gain.setValueAtTime(0, now + 0.45)
    beep.connect(bGain); bGain.connect(ctx.destination)
    beep.start(now); beep.stop(now + 0.5)
  } catch (e) { /* silently fail if audio ctx blocked */ }
}

export default function App() {
  const [booted, setBooted]     = useState(false)
  const [bigBangDone, setBigBangDone] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [welcomeAnimating, setWelcomeAnimating] = useState(false)
  const [hoveredPlanet, setHoveredPlanet] = useState(null)
  const [tooltipScreen, setTooltipScreen] = useState({ x: 0, y: 0 })
  const [activePlanet, setActivePlanet] = useState(null)
  const [visitedIds, setVisitedIds] = useState(new Set())
  const [totalXP, setTotalXP] = useState(0)
  const [muted, setMuted] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [showAudioPrompt, setShowAudioPrompt] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [clickBurst, setClickBurst] = useState(null)
  const [supernovaOpen, setSupernovaOpen] = useState(false)
  const [classifiedMode, setClassifiedMode] = useState(false)
  const [showClassifiedBanner, setShowClassifiedBanner] = useState(false)
  const konamiRef = useRef([])

  const scrollRef = useRef(null)
  const warpRef   = useRef(null)
  const audioRef  = useRef(null)
  const nebulaRef = useRef(null)
  const { dotRef, ringRef, canvasRef: rippleRef } = useCursor()

  // ── Konami code listener ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-KONAMI.length)
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        konamiRef.current = []
        setClassifiedMode(prev => !prev)
        setShowClassifiedBanner(true)
        triggerClassifiedSound()
        setTimeout(() => setShowClassifiedBanner(false), 3200)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const open  = () => setSupernovaOpen(true)
    const close = () => setSupernovaOpen(false)
    window.addEventListener('supernova-open',  open)
    window.addEventListener('supernova-close', close)
    return () => {
      window.removeEventListener('supernova-open',  open)
      window.removeEventListener('supernova-close', close)
    }
  }, [])

  const startAudio = () => {
    const audio = audioRef.current
    if (!audio || audioReady) return
    audio.volume = 0; audio.loop = true
    audio.play().then(() => {
      setAudioReady(true); setShowAudioPrompt(false)
      let vol = 0
      const id = setInterval(() => { vol = Math.min(0.45, vol + 0.01); audio.volume = vol; if (vol >= 0.45) clearInterval(id) }, 90)
    }).catch(() => setShowAudioPrompt(true))
  }

  useEffect(() => {
    if (!booted) return
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0; audio.loop = true
    audio.play().then(() => {
      setAudioReady(true)
      let vol = 0
      const id = setInterval(() => { vol = Math.min(0.45, vol + 0.01); audio.volume = vol; if (vol >= 0.45) clearInterval(id) }, 90)
    }).catch(() => setShowAudioPrompt(true))
  }, [booted])

  useEffect(() => { if (audioRef.current) audioRef.current.muted = muted }, [muted])

  useEffect(() => {
    if (!booted) return
    const t = setTimeout(() => setShowStory(true), 400)
    return () => clearTimeout(t)
  }, [booted])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const fn = () => { if (el.scrollTop > 10) setShowStory(false) }
    el.addEventListener('scroll', fn)
    return () => el.removeEventListener('scroll', fn)
  }, [booted])

  useEffect(() => {
    if (booted) {
      const t = setTimeout(() => setShowScrollHint(true), 20500)
      return () => clearTimeout(t)
    }
  }, [booted])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const fn = () => { if (el.scrollTop > 20) setShowScrollHint(false) }
    el.addEventListener('scroll', fn)
    return () => el.removeEventListener('scroll', fn)
  }, [booted])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !booted) return
    const blockWheel = (e) => {
      if (el.scrollTop > window.innerHeight * 0.5) { e.preventDefault(); e.stopPropagation() }
    }
    el.addEventListener('wheel', blockWheel, { passive: false })
    el.addEventListener('touchmove', blockWheel, { passive: false })
    return () => { el.removeEventListener('wheel', blockWheel); el.removeEventListener('touchmove', blockWheel) }
  }, [booted])

  useEffect(() => {
    const el = nebulaRef.current
    if (!el) return
    gsap.to(el, { backgroundPosition: '55% 52%', duration: 20, ease: 'sine.inOut', repeat: -1, yoyo: true })
    gsap.to(el, { opacity: 0.44, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true })
  }, [])

  const handleHoverPlanet = useCallback((planet, worldPos) => {
    setHoveredPlanet(planet)
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2
    const scale = window.innerHeight / 28
    const sx = cx + worldPos.x * scale * 0.55
    const sy = cy - worldPos.y * scale * 0.55
    setTooltipScreen({ x: Math.max(80, Math.min(window.innerWidth - 80, sx)), y: Math.max(80, sy) })
  }, [])

  const handleUnhoverPlanet = useCallback(() => setHoveredPlanet(null), [])

  const handleClickPlanet = useCallback((planet) => {
    setActivePlanet(planet)
    // Particle burst at center of screen
    setClickBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2, color: planet.color, key: Date.now() })
    setTimeout(() => setClickBurst(null), 700)
    if (!visitedIds.has(planet.id)) {
      setVisitedIds(prev => new Set([...prev, planet.id]))
      setTotalXP(prev => prev + planet.xp)
    }
  }, [visitedIds])

  const handleCloseModal = useCallback(() => setActivePlanet(null), [])

  const scrollToSkills = () => scrollRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })

  return (
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden', position:'relative', background:'#020209' }}>
      {showAudioPrompt && (
        <div onClick={startAudio} style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(2,2,9,0.75)', backdropFilter:'blur(10px)', cursor:'none' }}>
          <div style={{ border:'1px solid rgba(99,102,241,0.45)', background:'rgba(4,4,28,0.95)', borderRadius:'14px', padding:'36px 48px', textAlign:'center', boxShadow:'0 0 80px rgba(99,102,241,0.25)' }}>
            <div style={{ fontSize:'32px', marginBottom:'16px' }}>🔊</div>
            <div style={{ color:'#818cf8', fontFamily:"'Orbitron', monospace", fontSize:'13px', letterSpacing:'0.15em', marginBottom:'8px' }}>ENABLE AUDIO</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontFamily:"'Share Tech Mono'", fontSize:'11px' }}>Click to enable ambient soundtrack</div>
          </div>
        </div>
      )}

      <audio ref={audioRef} src={audioSrc} preload="auto" />

      {/* Nebula background */}
      <div ref={nebulaRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:`url(${nebulaBg})`, backgroundSize:'115%', backgroundPosition:'50% 50%', opacity: classifiedMode ? 0.7 : 0.34, filter: classifiedMode ? 'hue-rotate(220deg) saturate(2.5) brightness(0.7)' : 'none', transition:'opacity 1.2s ease, filter 1.2s ease' }} />

      {/* Chromatic nebula tint */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background: classifiedMode ? `radial-gradient(ellipse 80% 60% at 30% 40%, rgba(160,0,255,0.28) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 70% 60%, rgba(80,0,200,0.2) 0%, transparent 70%)` : `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(99,60,200,0.12) 0%, transparent 70%),radial-gradient(ellipse 60% 50% at 80% 70%, rgba(30,180,200,0.08) 0%, transparent 70%)`, transition:'background 1.2s ease' }} />

      {/* CLASSIFIED banner */}
      {showClassifiedBanner && (
        <div style={{ position:'fixed', inset:0, zIndex:9500, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ animation:'classifiedSweep 3.2s ease forwards', transformOrigin:'center' }}>
            <div style={{ position:'relative', padding:'18px 60px', border:'4px solid #ff0000', background:'rgba(0,0,0,0.88)', boxShadow:'0 0 80px rgba(255,0,0,0.7), inset 0 0 40px rgba(255,0,0,0.15)', animation:'classifiedGlitch 0.08s infinite' }}>
              <div style={{ color:'#ff0000', fontFamily:"'Orbitron', monospace", fontSize:'clamp(28px, 6vw, 64px)', fontWeight:900, letterSpacing:'0.3em', textShadow:'0 0 20px #ff0000, 0 0 50px #ff0000, 2px 2px 0 #880000', animation:'classifiedFlicker 0.15s infinite' }}>⚠ CLASSIFIED ⚠</div>
              <div style={{ color:'rgba(255,80,80,0.7)', fontFamily:"'Share Tech Mono'", fontSize:'11px', letterSpacing:'0.25em', textAlign:'center', marginTop:'8px' }}>UNAUTHORIZED ACCESS DETECTED — NEXUS PROTOCOL ALPHA-7</div>
              <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.04) 2px, rgba(255,0,0,0.04) 4px)', pointerEvents:'none' }} />
            </div>
          </div>
          <style>{`
            @keyframes classifiedSweep {
              0%   { opacity:0; transform: translateX(-120%) skewX(-8deg) scaleY(0.4); }
              12%  { opacity:1; transform: translateX(0%)    skewX(0deg)  scaleY(1); }
              75%  { opacity:1; transform: translateX(0%)    skewX(0deg)  scaleY(1); }
              88%  { opacity:1; transform: translateX(0%)    skewX(3deg)  scaleY(0.98); }
              100% { opacity:0; transform: translateX(120%)  skewX(8deg)  scaleY(0.4); }
            }
            @keyframes classifiedGlitch {
              0%   { transform: translate(0,0);   }
              20%  { transform: translate(-2px,1px); }
              40%  { transform: translate(2px,-1px); }
              60%  { transform: translate(-1px,2px); }
              80%  { transform: translate(1px,-2px); }
              100% { transform: translate(0,0);   }
            }
            @keyframes classifiedFlicker {
              0%,92%,96%,100% { opacity: 1; }
              93%             { opacity: 0.2; }
              97%             { opacity: 0.6; }
            }
          `}</style>
        </div>
      )}

      {/* Vignette */}
      <div style={{ position:'fixed', inset:0, zIndex:2, pointerEvents:'none', background:'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(2,2,9,0.55) 100%)' }} />

      <div className="scanlines" />
      <div ref={dotRef} className="cursor-dot" style={{ opacity: (bigBangDone && !supernovaOpen) ? undefined : 0 }} />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: (bigBangDone && !supernovaOpen) ? undefined : 0 }} />
      <canvas ref={rippleRef} id="ripple-canvas" style={{ opacity: (bigBangDone && !supernovaOpen) ? undefined : 0 }} />
      <WarpTransition ref={warpRef} scrollContainerRef={scrollRef} />

      {!booted && <BootLoader onComplete={() => setBooted(true)} />}
      {booted && !bigBangDone && <BigBangIntro onComplete={() => setBigBangDone(true)} />}
      <StoryOverlay
        visible={booted && bigBangDone && showStory}
        onWelcomeClick={() => setWelcomeAnimating(true)}
        welcomeAnimating={welcomeAnimating}
        onAnimDismiss={() => { setShowStory(false); setWelcomeAnimating(false) }}
      />

      {bigBangDone && <HUD xp={totalXP} visitedCount={visitedIds.size} totalPlanets={PLANETS.length} />}
      {hoveredPlanet && !activePlanet && <Tooltip planet={hoveredPlanet} screenPos={tooltipScreen} />}
      {activePlanet  && <DossierModal planet={activePlanet} onClose={handleCloseModal} />}
      {clickBurst && <ClickBurst key={clickBurst.key} x={clickBurst.x} y={clickBurst.y} color={clickBurst.color} />}

      {/* Mute toggle */}
      {bigBangDone && (
        <button onClick={() => { if (!audioReady) { startAudio(); return; } setMuted(m => !m) }}
          style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:9000, width:'40px', height:'40px', borderRadius:'50%', background:'rgba(4,4,28,0.8)', border:'1px solid rgba(99,102,241,0.4)', color:muted?'rgba(255,255,255,0.25)':'#818cf8', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'none', backdropFilter:'blur(10px)', boxShadow:muted?'none':'0 0 15px rgba(99,102,241,0.4)', transition:'all 0.2s ease' }}>
          {!audioReady ? '▶' : muted ? '🔇' : '🔊'}
        </button>
      )}

      {/* Three.js Canvas */}
      <div style={{ position:'fixed', inset:0, zIndex:1 }}>
        <Canvas camera={{ position:[0,0,18], fov:65, near:0.1, far:400 }}
          gl={{ antialias:true, alpha:false, powerPreference:'high-performance', toneMapping:1 }}
          dpr={[1, 2]} style={{ width:'100%', height:'100%' }}>
          <CameraController scrollRef={scrollRef} />
          <Scene
            onHoverPlanet={handleHoverPlanet}
            onUnhoverPlanet={handleUnhoverPlanet}
            onClickPlanet={handleClickPlanet}
            visitedIds={visitedIds}
            classifiedMode={classifiedMode}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={!hoveredPlanet && !activePlanet}
            enableRotate={!hoveredPlanet && !activePlanet}
            minDistance={6} maxDistance={60}
            zoomSpeed={0.5} rotateSpeed={0.35}
            autoRotate={!hoveredPlanet && !activePlanet}
            autoRotateSpeed={0.22}
          />
        </Canvas>
      </div>

      {/* Scroll container */}
      <div ref={scrollRef} data-scroll-container style={{ position:'absolute', inset:0, overflowY:booted?'scroll':'hidden', overflowX:'hidden', scrollbarWidth:'none', msOverflowStyle:'none', zIndex:10, background:'transparent', pointerEvents:'none' }}>
        <div style={{ height:'100vh', width:'100%', background:'transparent', position:'relative', pointerEvents:'none' }}>
          {showScrollHint && (
            <button onClick={scrollToSkills} style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', pointerEvents:'auto', background:'transparent', border:'none', cursor:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', animation:'scrollHintFade 0.6s ease forwards' }}>
              <span style={{ color:'rgba(255,255,255,0.22)', fontSize:'9px', fontFamily:"'Orbitron', monospace", letterSpacing:'0.2em' }}>SCROLL</span>
              {[0,1,2].map(i => (
                <svg key={i} width="18" height="10" viewBox="0 0 18 10" fill="none" style={{ opacity:0, animation:`chevronPulse 1.4s ease-in-out ${i*0.18}s infinite`, marginTop:i===0?0:'-4px' }}>
                  <path d="M1 1L9 9L17 1" stroke="rgba(99,102,241,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ))}
            </button>
          )}
        </div>
        <div style={{ minHeight:'100vh', width:'100%', background:'transparent', position:'relative', zIndex:5, pointerEvents:'auto' }}>
          <SkillsSection />
        </div>
      </div>

      <style>{`
        @keyframes scrollHintFade{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes chevronPulse{0%{opacity:0;transform:translateY(-4px)}40%{opacity:0.8;transform:translateY(0)}80%{opacity:0;transform:translateY(4px)}100%{opacity:0;transform:translateY(4px)}}
        div::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  )
}
