import { useEffect, useRef, useState, useCallback } from 'react'
import { PLANETS } from '../data/planets'
import slideMercury  from '../assets/slide-mercury.jpg'
import slideVenus    from '../assets/slide-venus.jpg'
import slideEarth    from '../assets/slide-earth.jpg'
import slideMars     from '../assets/slide-mars.jpg'
import slideJupiter  from '../assets/slide-jupiter.jpg'
import slideSaturn   from '../assets/slide-saturn.jpg'
import slideUranus   from '../assets/slide-uranus.jpg'
import slideNeptune  from '../assets/slide-neptune.jpg'
import slideCredits  from '../assets/slide-credits.jpg'

const SLIDE_IMAGES = {
  mercury: slideMercury, venus: slideVenus, earth: slideEarth, mars: slideMars,
  jupiter: slideJupiter, saturn: slideSaturn, uranus: slideUranus, neptune: slideNeptune
}

const ALL_SLIDES = [
  { id:'solar-system', label:'SOLAR SYSTEM', isSolarSystem:true },
  ...PLANETS.map(p => ({ id:p.id, label:p.name.toUpperCase(), planet:p })),
  { id:'credits', label:'END CREDITS', isCredits:true },
]

// Animated skill tag
function SkillTag({ skill, color, index }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 500 + index * 80)
    return () => clearTimeout(t)
  }, [index])
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'5px',
      background:`${color}18`, border:`1px solid ${color}50`,
      borderRadius:'5px', padding:'5px 12px',
      fontFamily:"'Share Tech Mono'", fontSize:'11px', letterSpacing:'0.1em',
      color:`${color}ee`, whiteSpace:'nowrap',
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(10px)',
      transition:`opacity 0.4s ease, transform 0.4s ease`,
    }}>
      <span style={{ width:'4px', height:'4px', borderRadius:'50%', background:color, flexShrink:0 }} />
      {skill}
    </span>
  )
}

// Animated XP bar
function XPBar({ value, max, color, delay }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), delay)
    return () => clearTimeout(t)
  }, [value, max, delay])
  return (
    <div style={{ height:'3px', background:'rgba(255,255,255,0.08)', borderRadius:'2px', overflow:'hidden', marginBottom:'14px' }}>
      <div style={{
        height:'100%', width:`${w}%`,
        background:`linear-gradient(90deg, ${color}88, ${color})`,
        borderRadius:'2px',
        transition:`width 1.2s cubic-bezier(0.16,1,0.3,1) ${delay * 0.001}s`,
        boxShadow:`0 0 8px ${color}88`,
      }} />
    </div>
  )
}

// Full planet content overlay
function PlanetOverlay({ planet, isActive }) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => setEntered(true), 200)
      return () => clearTimeout(t)
    } else {
      setEntered(false)
    }
  }, [isActive])

  return (
    <div style={{
      position:'absolute', inset:0, zIndex:5,
      display:'flex', alignItems:'center',
      // Strong gradient: solid left panel + fade to transparent right
      background:`linear-gradient(100deg,
        rgba(2,2,16,0.97) 0%,
        rgba(2,2,16,0.92) 35%,
        rgba(2,2,16,0.70) 55%,
        rgba(2,2,16,0.20) 75%,
        transparent 100%)`,
    }}>
      {/* LEFT CONTENT PANEL */}
      <div style={{ padding:'0 5vw', maxWidth:'520px', width:'100%' }}>

        {/* Planet number */}
        <div style={{
          fontFamily:"'Orbitron', monospace",
          fontSize:'clamp(64px,9vw,110px)', fontWeight:900, lineHeight:1,
          color:`${planet.color}22`, userSelect:'none',
          marginBottom:'-8px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateX(0)' : 'translateX(-20px)',
          transition:'opacity 0.5s ease 0s, transform 0.5s ease 0s',
        }}>
          {String(PLANETS.findIndex(p => p.id === planet.id) + 1).padStart(2, '0')}
        </div>

        {/* Planet name */}
        <div style={{
          fontFamily:"'Orbitron', monospace",
          fontSize:'clamp(30px,5vw,58px)', fontWeight:900, letterSpacing:'0.06em',
          color:'#ffffff', lineHeight:1.1,
          textShadow:`0 0 40px ${planet.color}88, 0 0 80px ${planet.color}44`,
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateX(0)' : 'translateX(-30px)',
          transition:'opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s',
        }}>
          {planet.name.toUpperCase()}
        </div>

        {/* Subtitle + level row */}
        <div style={{
          display:'flex', alignItems:'center', gap:'12px', marginTop:'8px', marginBottom:'16px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateX(0)' : 'translateX(-20px)',
          transition:'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
        }}>
          <span style={{
            fontFamily:"'Share Tech Mono'", fontSize:'12px', letterSpacing:'0.18em',
            color:planet.color, textTransform:'uppercase',
          }}>◈ {planet.subtitle}</span>
          <span style={{
            background:`${planet.color}15`, border:`1px solid ${planet.color}40`,
            borderRadius:'4px', padding:'3px 9px',
            fontFamily:"'Orbitron', monospace", fontSize:'8px', letterSpacing:'0.14em',
            color:planet.color,
          }}>{planet.level}</span>
        </div>

        {/* Divider line */}
        <div style={{
          height:'1px', marginBottom:'16px',
          background:`linear-gradient(90deg, ${planet.color}cc, ${planet.color}44, transparent)`,
          opacity: entered ? 1 : 0,
          transform: entered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin:'left',
          transition:'opacity 0.5s ease 0.22s, transform 0.6s ease 0.22s',
        }} />

        {/* Feature description */}
        <p style={{
          fontFamily:"'Share Tech Mono'", fontSize:'clamp(11px,1.2vw,13px)',
          lineHeight:1.75, letterSpacing:'0.02em',
          color:'rgba(220,225,255,0.75)', marginBottom:'20px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(12px)',
          transition:'opacity 0.5s ease 0.28s, transform 0.5s ease 0.28s',
        }}>
          {planet.featureDesc}
        </p>

        {/* XP bar */}
        <div style={{
          opacity: entered ? 1 : 0,
          transition:'opacity 0.4s ease 0.35s',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
            <span style={{ fontFamily:"'Share Tech Mono'", fontSize:'9px', letterSpacing:'0.12em', color:'rgba(255,255,255,0.35)' }}>XP EARNED</span>
            <span style={{ fontFamily:"'Orbitron', monospace", fontSize:'9px', color:planet.color }}>{planet.xp} XP</span>
          </div>
          <XPBar value={planet.xp} max={300} color={planet.color} delay={400} />
        </div>

        {/* Skills grid */}
        <div style={{
          display:'flex', flexWrap:'wrap', gap:'7px',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(10px)',
          transition:'opacity 0.5s ease 0.42s, transform 0.5s ease 0.42s',
        }}>
          {planet.skills.map((s, i) => (
            <SkillTag key={s} skill={s} color={planet.color} index={i} />
          ))}
        </div>

        {/* Projects teaser */}
        <div style={{
          marginTop:'20px', display:'flex', gap:'10px', flexDirection:'column',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(10px)',
          transition:'opacity 0.5s ease 0.55s, transform 0.5s ease 0.55s',
        }}>
          {planet.projects.slice(0, 2).map((proj, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:'10px',
              background:`${planet.color}08`, border:`1px solid ${planet.color}25`,
              borderLeft:`2px solid ${planet.color}`, borderRadius:'0 6px 6px 0',
              padding:'8px 12px',
            }}>
              <span style={{
                flexShrink:0, width:'7px', height:'7px', borderRadius:'50%',
                background: proj.status === 'DEPLOYED' ? '#22d3ee' : '#fb923c',
                boxShadow: proj.status === 'DEPLOYED' ? '0 0 6px #22d3ee' : '0 0 6px #fb923c',
              }} />
              <div>
                <div style={{ fontFamily:"'Share Tech Mono'", fontSize:'10px', color:'rgba(255,255,255,0.8)', letterSpacing:'0.05em' }}>{proj.name}</div>
                <div style={{ fontFamily:"'Share Tech Mono'", fontSize:'9px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>{proj.tech.join(' · ')}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Planet Description */}
        {planet.planetDesc && (
          <div style={{
            marginTop:'22px',
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(10px)',
            transition:'opacity 0.5s ease 0.65s, transform 0.5s ease 0.65s',
          }}>
            <div style={{
              display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px',
            }}>
              <div style={{ width:'14px', height:'1px', background:`${planet.color}88` }} />
              <span style={{
                fontFamily:"'Orbitron', monospace", fontSize:'8px', letterSpacing:'0.22em',
                color:`${planet.color}99`, textTransform:'uppercase',
              }}>PLANET BRIEF</span>
            </div>
            <p style={{
              fontFamily:"'Share Tech Mono'", fontSize:'10.5px', lineHeight:1.7,
              color:'rgba(200,215,255,0.55)', letterSpacing:'0.02em', margin:0,
              borderLeft:`1px solid ${planet.color}33`, paddingLeft:'10px',
            }}>
              {planet.planetDesc}
            </p>
          </div>
        )}

        {/* Did You Know */}
        {planet.didYouKnow && (
          <div style={{
            marginTop:'14px',
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(10px)',
            transition:'opacity 0.5s ease 0.75s, transform 0.5s ease 0.75s',
          }}>
            <div style={{
              display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px',
            }}>
              <div style={{ width:'14px', height:'1px', background:`${planet.color}88` }} />
              <span style={{
                fontFamily:"'Orbitron', monospace", fontSize:'8px', letterSpacing:'0.22em',
                color:`${planet.color}99`, textTransform:'uppercase',
              }}>DID YOU KNOW</span>
            </div>
            <div style={{
              background:`${planet.color}07`,
              border:`1px solid ${planet.color}20`,
              borderLeft:`2px solid ${planet.color}60`,
              borderRadius:'0 6px 6px 0',
              padding:'10px 12px',
            }}>
              <p style={{
                fontFamily:"'Share Tech Mono'", fontSize:'10.5px', lineHeight:1.7,
                color:'rgba(200,215,255,0.5)', letterSpacing:'0.02em', margin:0,
              }}>
                {planet.didYouKnow}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: slide number indicator */}
      <div style={{
        position:'absolute', top:'24px', right:'24px',
        fontFamily:"'Orbitron', monospace", fontSize:'10px', letterSpacing:'0.2em',
        color:`${planet.color}70`,
        opacity: entered ? 1 : 0,
        transition:'opacity 0.4s ease 0.6s',
      }}>
        {String(PLANETS.findIndex(p => p.id === planet.id) + 1).padStart(2,'0')} / {String(PLANETS.length).padStart(2,'0')}
      </div>
    </div>
  )
}

// Credits slide
function CreditsOverlay({ isActive }) {
  const [entered, setEntered] = useState(false)
  const [showSupernova, setShowSupernova] = useState(false)
  const [supernovaFading, setSupernovaFading] = useState(false)

  useEffect(() => {
    if (isActive) { const t = setTimeout(() => setEntered(true), 300); return () => clearTimeout(t) }
    else { setEntered(false) }
  }, [isActive])

  const handleEndIt = () => {
    setSupernovaFading(false)
    setShowSupernova(true)
    window.dispatchEvent(new CustomEvent('supernova-open'))
  }

  return (
    <>
      <div style={{
        position:'absolute', inset:0, zIndex:5,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'linear-gradient(180deg, rgba(2,2,16,0.88) 0%, rgba(2,2,16,0.75) 50%, rgba(2,2,16,0.92) 100%)',
      }}>
        <div style={{ textAlign:'center', maxWidth:'580px', padding:'0 24px' }}>
          <div style={{ fontFamily:"'Orbitron', monospace", fontSize:'clamp(10px,1.4vw,13px)', letterSpacing:'0.3em', color:'rgba(244,114,182,0.65)', marginBottom:'16px', opacity:entered?1:0, transition:'opacity 0.6s ease' }}>
            END OF MISSION DOSSIER
          </div>
          <div style={{
            fontFamily:"'Orbitron', monospace", fontSize:'clamp(38px,7vw,72px)', fontWeight:900,
            letterSpacing:'0.12em', color:'#fff',
            textShadow:'0 0 60px rgba(244,114,182,0.6), 0 0 120px rgba(99,102,241,0.4)',
            opacity:entered?1:0, transform:entered?'scale(1)':'scale(0.88)',
            transition:'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}>NEXUS</div>
          <div style={{
            height:'2px', width:'160px', margin:'20px auto',
            background:'linear-gradient(90deg, transparent, #f472b6, #818cf8, transparent)',
            opacity:entered?1:0, transform:entered?'scaleX(1)':'scaleX(0)',
            transition:'opacity 0.5s ease 0.4s, transform 0.6s ease 0.4s',
          }} />
          <p style={{ fontFamily:"'Share Tech Mono'", fontSize:'13px', lineHeight:1.9, color:'rgba(200,210,255,0.5)', letterSpacing:'0.07em', opacity:entered?1:0, transition:'opacity 0.5s ease 0.6s' }}>
            Built with React · Three.js · GSAP · WebGL<br/>
            Every planet. Every orbit. Every line of code.<br/>
            Crafted in the void between 0 and 1.
          </p>
          <div style={{ marginTop:'28px', display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', opacity:entered?1:0, transition:'opacity 0.5s ease 0.8s' }}>
            {['React 19','Three.js r183','GSAP 3','Vite 8','R3F 9'].map(t => (
              <span key={t} style={{ background:'rgba(244,114,182,0.08)', border:'1px solid rgba(244,114,182,0.28)', borderRadius:'4px', padding:'5px 12px', fontFamily:"'Share Tech Mono'", fontSize:'10px', letterSpacing:'0.12em', color:'rgba(244,114,182,0.75)' }}>{t}</span>
            ))}
          </div>

          {/* ── Let's End It button ── */}
          <div style={{
            marginTop:'36px',
            opacity: entered ? 1 : 0,
            transition: 'opacity 0.6s ease 1.1s',
          }}>
            <button
              onClick={handleEndIt}
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(136,0,0,0.55) 0%, rgba(204,34,0,0.45) 100%)',
                border: '1.5px solid rgba(255,80,0,0.65)',
                borderRadius: '6px',
                padding: '12px 32px',
                fontFamily: "'Orbitron', monospace",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: '#ff9977',
                cursor: 'none',
                pointerEvents: 'auto',
                boxShadow: '0 0 28px rgba(255,60,0,0.35), inset 0 0 16px rgba(255,40,0,0.08)',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 55px rgba(255,60,0,0.7), inset 0 0 24px rgba(255,40,0,0.18)'
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(180,0,0,0.75) 0%, rgba(240,60,0,0.65) 100%)'
                e.currentTarget.style.color = '#ffccaa'
                e.currentTarget.style.borderColor = 'rgba(255,120,0,0.9)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 0 28px rgba(255,60,0,0.35), inset 0 0 16px rgba(255,40,0,0.08)'
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(136,0,0,0.55) 0%, rgba(204,34,0,0.45) 100%)'
                e.currentTarget.style.color = '#ff9977'
                e.currentTarget.style.borderColor = 'rgba(255,80,0,0.65)'
              }}
            >
              ☄ &nbsp;LET'S END IT
            </button>
          </div>
        </div>
      </div>

      {/* ── Supernova fullscreen overlay ── */}
      {showSupernova && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          opacity: supernovaFading ? 0 : 1,
          transition: supernovaFading ? 'opacity 1s ease' : 'opacity 0.4s ease',
          background: '#000',
        }}>
          <iframe
            src="/supernova.html"
            style={{ width:'100%', height:'100%', border:'none', display:'block' }}
            title="Supernova"
          />
          {/* Close button */}
          <button
            onClick={() => { setSupernovaFading(true); setTimeout(() => { setShowSupernova(false); window.dispatchEvent(new CustomEvent('supernova-close')) }, 1050) }}
            style={{
              position: 'absolute', top: '18px', right: '22px', zIndex: 10,
              background: 'rgba(10,0,20,0.7)', border: '1px solid rgba(255,60,0,0.4)',
              borderRadius: '50%', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,120,80,0.8)', fontSize: '18px', cursor: 'none',
              backdropFilter: 'blur(8px)', pointerEvents: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,40,0,0.3)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(10,0,20,0.7)'; e.currentTarget.style.color='rgba(255,120,80,0.8)' }}
          >✕</button>
        </div>
      )}
    </>
  )
}

export default function SkillsSection() {
  const slideRefs   = useRef([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [hovered, setHovered]     = useState(null)
  const [mouseX, setMouseX]       = useState(0)
  const [mouseY, setMouseY]       = useState(0)

  // Block wheel inside scroll section (same as before)
  useEffect(() => {
    const container = document.querySelector('[data-scroll-container]')
    if (!container) return
    const blockWheel = (e) => {
      if (container.scrollTop > window.innerHeight * 0.5) { e.preventDefault(); e.stopPropagation() }
    }
    container.addEventListener('wheel', blockWheel, { passive:false })
    container.addEventListener('touchmove', blockWheel, { passive:false })
    return () => { container.removeEventListener('wheel', blockWheel); container.removeEventListener('touchmove', blockWheel) }
  }, [])

  // IntersectionObserver
  useEffect(() => {
    const observers = slideRefs.current.map((el, idx) => {
      if (!el) return null
      const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActiveIdx(idx) }, { threshold:0.52 })
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  // Mouse parallax
  useEffect(() => {
    const onMove = (e) => { setMouseX(e.clientX / window.innerWidth - 0.5); setMouseY(e.clientY / window.innerHeight - 0.5) }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const scrollToSlide = useCallback((idx) => {
    const container = document.querySelector('[data-scroll-container]')
    if (!container) return
    if (idx === 0) container.scrollTo({ top:0, behavior:'smooth' })
    else slideRefs.current[idx]?.scrollIntoView({ behavior:'smooth', block:'start' })
  }, [])

  return (
    <>
      {/* Sentinel for hero slide */}
      <div ref={el => slideRefs.current[0] = el} data-slide-sentinel="0"
        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100vh', pointerEvents:'none' }} />

      <section style={{ width:'100%', display:'flex', flexDirection:'column', background:'transparent' }}>

        {/* Planet slides 1–8 */}
        {PLANETS.map((planet, i) => {
          const idx = i + 1
          const isActive = activeIdx === idx
          const px = mouseX * 12
          const py = mouseY * 8

          return (
            <div key={planet.id} ref={el => slideRefs.current[idx] = el}
              style={{ width:'100%', height:'100vh', position:'relative', overflow:'hidden', flexShrink:0 }}>

              {/* Parallax background image */}
              <div style={{
                position:'absolute', inset:'-5%',
                backgroundImage:`url(${SLIDE_IMAGES[planet.id]})`,
                backgroundSize:'cover', backgroundPosition:'center',
                transform: isActive ? `translate(${px}px,${py}px) scale(1.1)` : 'scale(1.1)',
                transition: isActive ? 'transform 0.15s linear' : 'transform 1.2s ease',
                filter: isActive ? 'brightness(0.55) saturate(1.1)' : 'brightness(0.25) saturate(0.8)',
              }} />

              {/* Bottom gradient for slide separation */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'25%', background:'linear-gradient(0deg, rgba(2,2,16,0.85) 0%, transparent 100%)', zIndex:3 }} />

              {/* Planet content overlay — ALWAYS rendered, transitions on isActive */}
              <PlanetOverlay planet={planet} isActive={isActive} />
            </div>
          )
        })}

        {/* Credits slide */}
        <div ref={el => slideRefs.current[9] = el}
          style={{ width:'100%', height:'100vh', position:'relative', overflow:'hidden', flexShrink:0 }}>
          <div style={{ position:'absolute', inset:'-5%', backgroundImage:`url(${slideCredits})`, backgroundSize:'cover', backgroundPosition:'center', filter:'brightness(0.35)' }} />
          <CreditsOverlay isActive={activeIdx === 9} />
        </div>
      </section>

      {/* Dot navigation sidebar */}
      <div style={{
        position:'fixed', right:'20px', top:'50%', transform:'translateY(-50%)',
        zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', gap:'9px',
      }}>
        {/* Track line */}
        <div style={{ position:'absolute', top:0, bottom:0, left:'50%', transform:'translateX(-50%)', width:'1px', background:'rgba(129,140,248,0.12)', borderRadius:'1px', zIndex:0 }} />

        {ALL_SLIDES.map((slide, idx) => {
          const isActive = idx === activeIdx
          const isHov    = idx === hovered
          const dotColor = slide.isCredits ? '#f472b6' : (slide.planet?.color || '#818cf8')

          return (
            <div key={slide.id}
              onClick={() => scrollToSlide(idx)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position:'relative', zIndex:1,
                width:  isActive ? '12px' : isHov ? '9px' : '6px',
                height: isActive ? '12px' : isHov ? '9px' : '6px',
                borderRadius:'50%',
                background: isActive
                  ? `radial-gradient(circle, #fff 10%, ${dotColor} 70%)`
                  : isHov ? dotColor : `${dotColor}40`,
                border: `1px solid ${isActive || isHov ? dotColor : dotColor+'30'}`,
                boxShadow: isActive ? `0 0 12px ${dotColor}, 0 0 24px ${dotColor}55` : isHov ? `0 0 8px ${dotColor}` : 'none',
                cursor:'pointer', transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)', flexShrink:0,
              }}
            />
          )
        })}

        {/* Hover label */}
        {hovered !== null && (
          <div style={{
            position:'absolute',
            right:'22px',
            top:`${(hovered / (ALL_SLIDES.length - 1)) * 100}%`,
            transform:'translateY(-50%)',
            background:'rgba(4,4,28,0.92)', border:`1px solid ${ALL_SLIDES[hovered]?.planet?.color || '#818cf8'}44`,
            borderRadius:'6px', padding:'4px 12px',
            color: ALL_SLIDES[hovered]?.isCredits ? '#f472b6' : (ALL_SLIDES[hovered]?.planet?.color || '#818cf8'),
            fontFamily:"'Orbitron', monospace", fontSize:'9px', letterSpacing:'0.15em',
            whiteSpace:'nowrap', pointerEvents:'none', backdropFilter:'blur(10px)',
          }}>
            {ALL_SLIDES[hovered]?.label}
          </div>
        )}
      </div>
    </>
  )
}
