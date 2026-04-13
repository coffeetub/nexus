import { useEffect, useRef } from 'react'

export default function Tooltip({ planet, screenPos }) {
  const ref = useRef()

  useEffect(() => {
    if (ref.current) {
      ref.current.style.left = screenPos.x + 'px'
      ref.current.style.top = (screenPos.y - 80) + 'px'
    }
  }, [screenPos])

  if (!planet) return null

  return (
    <div
      ref={ref}
      className="tooltip-anim fixed z-50 pointer-events-none select-none"
      style={{
        left: screenPos.x,
        top: screenPos.y - 80,
        transform: 'translateX(-50%)',
        fontFamily: "'Orbitron', monospace",
      }}
    >
      {/* Main card */}
      <div
        style={{
          background: 'rgba(2, 2, 20, 0.85)',
          border: `1px solid ${planet.color}55`,
          borderTop: `2px solid ${planet.color}`,
          borderRadius: '6px',
          padding: '8px 14px',
          backdropFilter: 'blur(12px)',
          minWidth: '140px',
          textAlign: 'center',
        }}
      >
        <div style={{ color: planet.color, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em' }}>
          {planet.name.toUpperCase()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '0.08em', marginTop: '2px' }}>
          {planet.subtitle}
        </div>
        <div style={{
          marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
        }}>
          <div style={{ height: '3px', flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(planet.xp / 300) * 100}%`,
              background: `linear-gradient(90deg, ${planet.color}, ${planet.color2})`,
              borderRadius: '2px'
            }} />
          </div>
          <span style={{ color: planet.color, fontSize: '9px' }}>{planet.xp}XP</span>
        </div>
      </div>
      {/* Arrow */}
      <div style={{
        width: 0, height: 0, margin: '0 auto',
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: `5px solid ${planet.color}55`,
      }} />
    </div>
  )
}
