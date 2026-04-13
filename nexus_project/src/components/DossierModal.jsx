import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'

// Slide images served from /public — no bundler step needed
const PLANET_SLIDES = {
  mercury: '/slide-mercury.jpg',
  venus:   '/slide-venus.jpg',
  earth:   '/slide-earth.jpg',
  mars:    '/slide-mars.jpg',
  jupiter: '/slide-jupiter.jpg',
  saturn:  '/slide-saturn.jpg',
  uranus:  '/slide-uranus.jpg',
  neptune: '/slide-neptune.jpg',
}

const PLANET_GRADIENTS = {
  mercury: 'radial-gradient(circle at 35% 30%, #b0b0b0 0%, #606060 55%, #252525 100%)',
  venus:   'radial-gradient(circle at 35% 30%, #f0b040 0%, #a07010 55%, #3a2000 100%)',
  earth:   'radial-gradient(circle at 30% 28%, #4488cc 0%, #2a6030 40%, #1a3060 70%, #0a1028 100%)',
  mars:    'radial-gradient(circle at 35% 30%, #dd5530 0%, #882010 55%, #280800 100%)',
  jupiter: 'radial-gradient(circle at 35% 30%, #e0b060 0%, #a07030 55%, #302010 100%)',
  saturn:  'radial-gradient(circle at 35% 30%, #d8c070 0%, #a09040 55%, #302800 100%)',
  uranus:  'radial-gradient(circle at 35% 30%, #70dff0 0%, #2090a0 55%, #003040 100%)',
  neptune: 'radial-gradient(circle at 35% 30%, #4466ee 0%, #2030aa 55%, #080828 100%)',
}

const PLANET_LINKS = {
  mercury: {
    wiki: 'https://en.wikipedia.org/wiki/Mercury_(planet)',
    youtube: 'https://www.youtube.com/watch?v=0fONene3OIA',
    youtubeLabel: 'Performance & Speed',
  },
  venus: {
    wiki: 'https://en.wikipedia.org/wiki/Venus',
    youtube: 'https://www.youtube.com/watch?v=_Hp_dI0DzY4',
    youtubeLabel: 'UI/UX & Design Systems',
  },
  earth: {
    wiki: 'https://en.wikipedia.org/wiki/Earth',
    youtube: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    youtubeLabel: 'Full Stack Development',
  },
  mars: {
    wiki: 'https://en.wikipedia.org/wiki/Mars',
    youtube: 'https://www.youtube.com/watch?v=UzLMhqg3_Wc',
    youtubeLabel: 'Backend & System Design',
  },
  jupiter: {
    wiki: 'https://en.wikipedia.org/wiki/Jupiter',
    youtube: 'https://www.youtube.com/watch?v=GwIo3gDZCVQ',
    youtubeLabel: 'AI / ML Systems',
  },
  saturn: {
    wiki: 'https://en.wikipedia.org/wiki/Saturn',
    youtube: 'https://www.youtube.com/watch?v=9zUHg7xjIqQ',
    youtubeLabel: 'DevOps & Cloud',
  },
  uranus: {
    wiki: 'https://en.wikipedia.org/wiki/Uranus',
    youtube: 'https://www.youtube.com/watch?v=gyMwXuJrbJQ',
    youtubeLabel: 'Web3 & Blockchain',
  },
  neptune: {
    wiki: 'https://en.wikipedia.org/wiki/Neptune',
    youtube: 'https://www.youtube.com/watch?v=gbb9Gx9fC9c',
    youtubeLabel: 'Research & Open Source',
  },
}

function useTypewriter(text, speed = 30) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)
  const indexRef = useRef(0)

  const skip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayed(text)
    setDone(true)
  }, [text])

  useEffect(() => {
    if (!text) return
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(intervalRef.current)
  }, [text, speed])

  return { displayed, done, skip }
}

// ── Blinking cursor ────────────────────────────────────────────────────────────
function Cursor({ color, visible }) {
  const [on, setOn] = useState(true)
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => setOn(v => !v), 530)
    return () => clearInterval(id)
  }, [visible])
  if (!visible) return null
  return (
    <span style={{
      display: 'inline-block',
      width: '8px',
      height: '1em',
      background: on ? color : 'transparent',
      verticalAlign: 'text-bottom',
      marginLeft: '2px',
      transition: 'background 0.08s',
    }} />
  )
}

// ── TypewriterBlock ────────────────────────────────────────────────────────────
function TypewriterBlock({ text, color, textStyle }) {
  const { displayed, done, skip } = useTypewriter(text, 30)

  return (
    <div style={{ position: 'relative' }}>
      <p style={{ ...textStyle, margin: 0 }}>
        {displayed}
        <Cursor color={color} visible={!done} />
      </p>
      {!done && (
        <button
          onClick={skip}
          style={{
            position: 'absolute', top: 0, right: 0,
            background: `${color}18`,
            border: `1px solid ${color}55`,
            color: color,
            fontSize: '9px', fontFamily: "'Orbitron', monospace",
            letterSpacing: '0.15em', padding: '3px 10px',
            borderRadius: '3px', cursor: 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${color}33`
            e.currentTarget.style.borderColor = color
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${color}18`
            e.currentTarget.style.borderColor = `${color}55`
          }}
        >
          SKIP &#9658;&#9658;
        </button>
      )}
    </div>
  )
}

function Tab({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}18` : 'transparent',
        border: 'none',
        borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
        color: active ? color : 'rgba(255,255,255,0.3)',
        fontSize: '10px', fontFamily: "'Orbitron', monospace",
        letterSpacing: '0.12em', padding: '8px 16px',
        cursor: 'none', transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  )
}

function MiniPlanetVisual({ planet }) {
  return (
    <div style={{
      width: '80px', height: '80px', borderRadius: '50%',
      background: PLANET_GRADIENTS[planet.id] || PLANET_GRADIENTS.earth,
      border: `3px solid ${planet.color}`,
      boxShadow: `0 0 30px ${planet.color}88, 0 0 60px ${planet.color}44, inset 0 -6px 20px rgba(0,0,0,0.6)`,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '9px', left: '11px',
        width: '20px', height: '13px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.35)', filter: 'blur(3px)',
      }} />
      {[0.35, 0.5, 0.65].map((y, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, top: `${y * 100}%`, height: '1px',
          background: `rgba(255,255,255,${0.05 + i * 0.04})`,
        }} />
      ))}
    </div>
  )
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: "'Share Tech Mono'" }}>{label}</span>
      <span style={{ color: color, fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.06em' }}>{value}</span>
    </div>
  )
}

export default function DossierModal({ planet, onClose }) {
  const modalRef   = useRef()
  const overlayRef = useRef()
  const [activeTab, setActiveTab] = useState('overview')
  // Bump these keys to remount TypewriterBlock (re-triggers typewriter) when tab changes
  const [overviewKey, setOverviewKey] = useState(0)
  const [storyKey, setStoryKey]       = useState(0)

  useEffect(() => {
    if (!planet) return
    setActiveTab('overview')
    setOverviewKey(k => k + 1)
    setStoryKey(k => k + 1)
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.88, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
    )
  }, [planet])

  const handleTabChange = (tab) => {
    if (tab === 'overview') setOverviewKey(k => k + 1)
    if (tab === 'story')    setStoryKey(k => k + 1)
    setActiveTab(tab)
  }

  const handleClose = () => {
    gsap.to(modalRef.current, { opacity: 0, scale: 0.92, y: 16, duration: 0.25, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, onComplete: onClose })
  }

  if (!planet) return null

  const tabs = ['overview', 'slide', 'story', 'missions', 'data', 'intel']

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      style={{ background: 'rgba(1,1,12,0.82)' }}
      onClick={e => { if (e.target === overlayRef.current) handleClose() }}
    >
      <div
        ref={modalRef}
        style={{
          width: 'min(720px, 96vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(4,4,28,0.97)',
          border: `1px solid ${planet.color}33`,
          borderTop: `2px solid ${planet.color}`,
          borderRadius: '12px',
          position: 'relative',
          fontFamily: "'Inter', sans-serif",
          scrollbarWidth: 'thin',
        }}
      >
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />

        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <div style={{
          position: 'relative', height: '130px', overflow: 'hidden',
          borderRadius: '10px 10px 0 0',
          background: `linear-gradient(135deg, rgba(2,2,20,1) 0%, ${planet.color}22 50%, rgba(2,2,20,0.8) 100%)`,
        }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
              borderRadius: '50%', background: planet.color,
              opacity: Math.random() * 0.4 + 0.1,
            }} />
          ))}
          <div style={{
            position: 'absolute', right: '24px', bottom: '8px',
            fontSize: '80px', fontFamily: "'Orbitron', monospace",
            fontWeight: 900, color: planet.color, opacity: 0.06, letterSpacing: '0.05em',
            lineHeight: 1,
          }}>{planet.name.toUpperCase()}</div>
          <div style={{ position: 'absolute', top: '16px', left: '28px', display: 'flex', gap: '8px' }}>
            <div style={{
              background: `${planet.color}22`, border: `1px solid ${planet.color}66`,
              color: planet.color, fontSize: '9px', fontFamily: "'Orbitron', monospace",
              fontWeight: 700, letterSpacing: '0.15em', padding: '3px 10px', borderRadius: '3px',
              backdropFilter: 'blur(4px)',
            }}>PLANET DOSSIER</div>
            <div style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
              color: '#4ade80', fontSize: '9px', fontFamily: "'Orbitron', monospace",
              padding: '3px 8px', borderRadius: '3px', backdropFilter: 'blur(4px)',
            }}>&#9679; ACTIVE</div>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
            background: 'linear-gradient(to bottom, transparent, rgba(4,4,28,0.97))',
          }} />
        </div>

        {/* ── Planet header ─────────────────────────────────────────────── */}
        <div style={{ padding: '18px 28px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <MiniPlanetVisual planet={planet} />
          <div style={{ flex: 1 }}>
            <h2 style={{
              color: '#fff', fontSize: '28px', fontWeight: 900,
              fontFamily: "'Orbitron', monospace", letterSpacing: '0.08em', lineHeight: 1,
              background: `linear-gradient(135deg, #fff 40%, ${planet.color} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '4px',
            }}>{planet.name.toUpperCase()}</h2>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.1em', fontFamily: "'Share Tech Mono'" }}>
              {planet.subtitle}
            </div>
            <div style={{ marginTop: '6px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{
                background: `${planet.color}18`, border: `1px solid ${planet.color}33`,
                color: planet.color, fontSize: '9px', fontFamily: "'Orbitron', monospace",
                padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.08em',
              }}>{planet.level}</span>
              <span style={{ color: planet.color, fontSize: '16px', fontFamily: "'Orbitron', monospace", fontWeight: 900 }}>
                +{planet.xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ padding: '10px 28px 0' }}>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(planet.xp / 300) * 100}%`,
              background: `linear-gradient(90deg, ${planet.color}88, ${planet.color})`,
              borderRadius: '2px', transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', padding: '12px 28px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {tabs.map(t => (
            <Tab key={t} label={t.toUpperCase()} active={activeTab === t} onClick={() => handleTabChange(t)} color={planet.color} />
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────────────────────── */}
        <div style={{ padding: '22px 28px 28px' }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <div style={{
                background: `linear-gradient(135deg, ${planet.color}0d 0%, rgba(4,4,28,0) 100%)`,
                border: `1px solid ${planet.color}22`, borderLeft: `3px solid ${planet.color}`,
                borderRadius: '0 8px 8px 0', padding: '16px 18px', marginBottom: '22px',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', marginBottom: '8px' }}>
                  DOMAIN OVERVIEW
                </div>
                <TypewriterBlock
                  key={`overview-${planet.id}-${overviewKey}`}
                  text={planet.featureDesc}
                  color={planet.color}
                  textStyle={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.7, fontFamily: "'Share Tech Mono'" }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', marginBottom: '10px' }}>
                  SKILL MODULES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {planet.skills.map(skill => (
                    <span key={skill} style={{
                      background: `${planet.color}11`, border: `1px solid ${planet.color}33`,
                      color: planet.color2 || planet.color, fontSize: '11px',
                      fontFamily: "'Share Tech Mono'", padding: '4px 11px', borderRadius: '3px',
                    }}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE TAB */}
          {activeTab === 'slide' && (
            <div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', marginBottom: '14px' }}>
                DOMAIN OVERVIEW — VISUAL BRIEF
              </div>
              <div style={{
                borderRadius: '10px', overflow: 'hidden',
                border: `1px solid ${planet.color}33`,
                boxShadow: `0 0 30px ${planet.color}22`,
              }}>
                <img
                  src={PLANET_SLIDES[planet.id]}
                  alt={`${planet.name} domain slide`}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
              <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: "'Share Tech Mono'", lineHeight: 1.6 }}>
                Visual domain brief for <span style={{ color: planet.color }}>{planet.subtitle}</span> — mapped to {planet.realName} in the Nexus mission control system.
              </div>
            </div>
          )}

          {/* BUILD STORY TAB */}
          {activeTab === 'story' && (
            <div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', marginBottom: '14px' }}>
                HOW I BUILT THIS
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '20px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
                  paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${planet.color}22`, border: `1px solid ${planet.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: planet.color, fontSize: '14px', fontFamily: "'Orbitron'" }}>
                    {planet.icon}
                  </div>
                  <div>
                    <div style={{ color: planet.color, fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.1em' }}>{planet.featureTitle}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontFamily: "'Share Tech Mono'" }}>Build philosophy & engineering decisions</div>
                  </div>
                </div>
                <TypewriterBlock
                  key={`story-${planet.id}-${storyKey}`}
                  text={planet.buildStory}
                  color={planet.color}
                  textStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.8, fontFamily: "'Share Tech Mono'" }}
                />
              </div>
            </div>
          )}

          {/* MISSIONS TAB */}
          {activeTab === 'missions' && (
            <div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', marginBottom: '14px' }}>
                COMPLETED MISSIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {planet.projects.map((proj, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `3px solid ${planet.color}`, borderRadius: '0 8px 8px 0', padding: '16px 18px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{proj.name}</div>
                      <div style={{
                        flexShrink: 0, fontSize: '8px', fontFamily: "'Orbitron', monospace",
                        letterSpacing: '0.1em', padding: '3px 9px', borderRadius: '3px',
                        ...(proj.status === 'DEPLOYED'
                          ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }
                          : { background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' })
                      }}>
                        {proj.status === 'DEPLOYED' ? '✓ ' : '◌ '}{proj.status}
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.6, marginBottom: '10px' }}>
                      {proj.desc}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {proj.tech.map(t => (
                        <span key={t} style={{
                          fontSize: '10px', color: 'rgba(255,255,255,0.35)',
                          fontFamily: "'Share Tech Mono'", border: '1px solid rgba(255,255,255,0.08)',
                          padding: '2px 8px', borderRadius: '2px',
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLANETARY DATA TAB */}
          {activeTab === 'data' && (
            <div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', marginBottom: '14px' }}>
                PLANETARY TELEMETRY
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px 18px' }}>
                <StatRow label="MASS"           value={planet.mass}      color={planet.color} />
                <StatRow label="ORBITAL DIST."  value={planet.distance}  color={planet.color} />
                <StatRow label="DAY LENGTH"     value={planet.dayLength} color={planet.color} />
                <StatRow label="TEMPERATURE"    value={planet.temp}      color={planet.color} />
                <StatRow label="MOONS"          value={`${planet.moons}`} color={planet.color} />
                <StatRow label="RING SYSTEM"    value={planet.rings ? 'YES' : 'NONE'} color={planet.color} />
                <StatRow label="DOMAIN"         value={planet.featureTitle} color={planet.color} />
              </div>
              <div style={{ marginTop: '14px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontFamily: "'Share Tech Mono'", lineHeight: 1.6 }}>
                Real solar system data for <span style={{ color: planet.color }}>{planet.realName}</span>, metaphorically mapped to development skills. Each planet's properties reflect domain characteristics.
              </div>
            </div>
          )}

          {/* INTEL TAB */}
          {activeTab === 'intel' && (() => {
            const links = PLANET_LINKS[planet.id]
            if (!links) return null
            const linkBtn = (href, icon, label, sublabel, accent) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '18px',
                  background: `${accent}0d`,
                  border: `1px solid ${accent}33`,
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: '0 10px 10px 0',
                  padding: '18px 20px',
                  textDecoration: 'none',
                  transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
                  cursor: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${accent}1e`
                  e.currentTarget.style.boxShadow = `0 0 28px ${accent}33`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${accent}0d`
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                  background: `${accent}18`, border: `1px solid ${accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                }}>
                  {icon}
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: accent, fontSize: '12px',
                    fontFamily: "'Orbitron', monospace", fontWeight: 700,
                    letterSpacing: '0.1em', marginBottom: '4px',
                  }}>{label}</div>
                  <div style={{
                    color: 'rgba(255,255,255,0.45)', fontSize: '11px',
                    fontFamily: "'Share Tech Mono'", letterSpacing: '0.04em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{sublabel}</div>
                </div>
                {/* Arrow */}
                <div style={{
                  color: `${accent}88`, fontSize: '18px', flexShrink: 0,
                  fontFamily: 'monospace', lineHeight: 1,
                }}>↗</div>
              </a>
            )

            return (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', marginBottom: '18px' }}>
                  INTEL LINKS — {planet.name.toUpperCase()}
                </div>

                {/* Section: Planet Knowledge */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.2em', whiteSpace: 'nowrap' }}>
                      PLANET KNOWLEDGE BASE
                    </span>
                    <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  {linkBtn(
                    links.wiki,
                    '🪐',
                    `${planet.name.toUpperCase()} — WIKIPEDIA`,
                    links.wiki,
                    planet.color,
                  )}
                </div>

                {/* Section: Tech Knowledge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.2em', whiteSpace: 'nowrap' }}>
                      TECH KNOWLEDGE BASE
                    </span>
                    <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  {linkBtn(
                    links.youtube,
                    '▶',
                    links.youtubeLabel.toUpperCase(),
                    links.youtube,
                    '#ff4444',
                  )}
                </div>

                <div style={{ marginTop: '20px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontFamily: "'Share Tech Mono'", lineHeight: 1.7 }}>
                    Links open in a new tab. The planet article covers real astronomy for{' '}
                    <span style={{ color: planet.color }}>{planet.realName || planet.name}</span>,
                    while the tutorial covers the <span style={{ color: '#ff4444' }}>{links.youtubeLabel}</span> domain this planet represents in the Nexus.
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Close button */}
        <button onClick={handleClose} style={{
          position: 'absolute', top: '16px', right: '20px',
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.6)', width: '30px', height: '30px',
          borderRadius: '50%', cursor: 'none', fontSize: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', zIndex: 10, backdropFilter: 'blur(4px)',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
        >✕</button>
      </div>
    </div>
  )
}
