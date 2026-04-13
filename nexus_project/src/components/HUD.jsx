import { useState, useEffect } from 'react'
import { TOTAL_XP } from '../data/planets'

export default function HUD({ xp, visitedCount, totalPlanets }) {
  const pct = Math.round((xp / TOTAL_XP) * 100)
  const level = xp < 200 ? 'CADET' : xp < 400 ? 'PILOT' : xp < 700 ? 'NAVIGATOR' : xp < 1000 ? 'COMMANDER' : 'ADMIRAL'
  const [displayXp, setDisplayXp] = useState(0)
  const [glow, setGlow] = useState(false)

  useEffect(() => {
    if (xp > displayXp) {
      setGlow(true)
      setTimeout(() => setGlow(false), 800)
      let start = displayXp
      const step = Math.max(1, Math.floor((xp - start) / 20))
      const iv = setInterval(() => {
        start = Math.min(start + step, xp)
        setDisplayXp(start)
        if (start >= xp) clearInterval(iv)
      }, 30)
      return () => clearInterval(iv)
    }
  }, [xp])

  return (
    <>
      {/* XP Panel */}
      <div style={{
        position:'fixed', top:'16px', right:'16px', zIndex:40, pointerEvents:'none', userSelect:'none',
        fontFamily:"'Orbitron', monospace",
      }}>
        <div style={{
          background:'rgba(2,2,20,0.88)',
          border: glow ? '1px solid rgba(99,102,241,0.9)' : '1px solid rgba(99,102,241,0.3)',
          borderRadius:'8px', padding:'14px 18px',
          backdropFilter:'blur(16px)',
          minWidth:'210px', position:'relative',
          boxShadow: glow ? '0 0 30px rgba(99,102,241,0.5), inset 0 0 20px rgba(99,102,241,0.08)' : '0 0 20px rgba(99,102,241,0.15)',
          transition:'border 0.3s ease, box-shadow 0.3s ease',
        }}>
          {/* Corner brackets */}
          {[['tl','0','0','1px','0'],['tr','0',null,'1px','0','right'],['bl',null,'0','1px','0'],['br',null,'0','1px','0','right']].map(([k,t,b,bw,bl,r]) => (
            <div key={k} style={{
              position:'absolute', width:'8px', height:'8px',
              top:t==='0'?'6px':undefined, bottom:b==='0'?'6px':undefined,
              left:r?undefined:'6px', right:r?'6px':undefined,
              borderTop:t==='0'?`1px solid rgba(129,140,248,0.6)`:undefined,
              borderBottom:b==='0'?`1px solid rgba(129,140,248,0.6)`:undefined,
              borderLeft:r?undefined:'1px solid rgba(129,140,248,0.6)',
              borderRight:r?'1px solid rgba(129,140,248,0.6)':undefined,
            }} />
          ))}

          {/* Rank */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'8px', letterSpacing:'0.15em' }}>CLEARANCE RANK</span>
            <span style={{ color:'#818cf8', fontSize:'9px', fontWeight:700, letterSpacing:'0.12em', textShadow:'0 0 10px rgba(129,140,248,0.8)' }}>{level}</span>
          </div>

          {/* XP */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'10px' }}>
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'8px', letterSpacing:'0.15em' }}>EXPERIENCE</span>
            <span style={{ color:'#fff', fontSize:'20px', fontWeight:900, letterSpacing:'-0.02em', textShadow: glow ? '0 0 20px rgba(99,102,241,1)' : 'none', transition:'text-shadow 0.3s' }}>
              {displayXp}<span style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', fontWeight:400 }}> / {TOTAL_XP}</span>
            </span>
          </div>

          {/* XP Bar */}
          <div style={{ height:'4px', background:'rgba(255,255,255,0.05)', borderRadius:'2px', overflow:'hidden', marginBottom:'10px', position:'relative' }}>
            <div style={{
              height:'100%', width:`${pct}%`,
              background:'linear-gradient(90deg, #6366f1, #818cf8, #22d3ee)',
              borderRadius:'2px', transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 0 8px rgba(129,140,248,0.8)',
            }} />
            {/* Shimmer */}
            <div style={{
              position:'absolute', top:0, left:0, right:0, bottom:0,
              background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              animation:'shimmer 2s ease-in-out infinite',
              width:'60%',
            }} />
          </div>

          {/* Missions */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:'4px' }}>
              {Array.from({length:totalPlanets}, (_, i) => (
                <div key={i} style={{
                  width:'6px', height:'6px', borderRadius:'50%',
                  background: i < visitedCount ? '#22d3ee' : 'rgba(255,255,255,0.1)',
                  boxShadow: i < visitedCount ? '0 0 6px rgba(34,211,238,0.8)' : 'none',
                  transition:'all 0.3s ease',
                }} />
              ))}
            </div>
            <span style={{ color:'#22d3ee', fontSize:'8px', letterSpacing:'0.12em' }}>{pct}% COMPLETE</span>
          </div>
        </div>
      </div>

      {/* Title Panel */}
      <div style={{ position:'fixed', top:'16px', left:'16px', zIndex:40, pointerEvents:'none', userSelect:'none', fontFamily:"'Orbitron', monospace" }}>
        <div style={{
          background:'rgba(2,2,20,0.75)', border:'1px solid rgba(99,102,241,0.2)',
          borderLeft:'3px solid #6366f1', borderRadius:'0 8px 8px 0',
          padding:'12px 18px', backdropFilter:'blur(12px)',
        }}>
          <div style={{ color:'#fff', fontSize:'20px', fontWeight:900, letterSpacing:'0.2em', textShadow:'0 0 20px rgba(99,102,241,0.8)' }}>NEXUS</div>
          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'7px', letterSpacing:'0.25em', marginTop:'2px' }}>MISSION CONTROL v2.1.00</div>
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{
        position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
        zIndex:40, pointerEvents:'none', userSelect:'none',
        fontFamily:"'Share Tech Mono', monospace",
        color:'rgba(255,255,255,0.2)', fontSize:'9px', letterSpacing:'0.18em', textAlign:'center',
      }}>
        CLICK PLANETS TO EXPLORE MISSIONS <span style={{ animation:'blink 1.2s step-end infinite', color:'#6366f1' }}>_</span>
      </div>

      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </>
  )
}
