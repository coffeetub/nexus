import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

// ─── Phase definitions ────────────────────────────────────────────────────────
const PHASE_INIT    = 'init'     // typing "NEXUS INTERFACE v2.1.00 — INITIALIZING..."
const PHASE_LOAD    = 'load'     // progress bar filling (2.5s)
const PHASE_NOMINAL = 'nominal'  // typing "ALL SYSTEMS NOMINAL. LAUNCHING MISSION CONTROL."
const PHASE_WIPE    = 'wipe'     // blast-shield slides up

const LINE1 = 'NEXUS INTERFACE v2.1.00 — INITIALIZING...'
const LINE2 = 'ALL SYSTEMS NOMINAL. LAUNCHING MISSION CONTROL.'

// Typing speed constants
const CHAR_INTERVAL_FAST = 38   // ms per char for line 1
const CHAR_INTERVAL_SLOW = 44   // ms per char for line 2 (slight pause for drama)
const BAR_DURATION       = 2500 // ms for progress bar to reach 100%
const PAUSE_AFTER_LINE1  = 240  // ms to wait between line1 done and bar start
const PAUSE_AFTER_BAR    = 320  // ms to wait between bar done and line2 start
const PAUSE_AFTER_LINE2  = 600  // ms to wait before wipe begins

export default function BootLoader({ onComplete }) {
  const panelRef       = useRef(null)
  const progressBarRef = useRef(null)
  const rafRef         = useRef(null)

  // Displayed text state
  const [displayedLine1, setDisplayedLine1] = useState('')
  const [displayedLine2, setDisplayedLine2] = useState('')
  const [phase,          setPhase]          = useState(PHASE_INIT)
  const [progressPct,    setProgressPct]    = useState(0)
  const [showCursor,     setShowCursor]     = useState(true)
  const [cursorLine,     setCursorLine]     = useState(1)  // which line the cursor is on

  // ── Cursor blink via setInterval ────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(id)
  }, [])

  // ── Main boot sequence ───────────────────────────────────────────────────
  useEffect(() => {
    let destroyed = false
    const timers  = []
    const intervals = []

    // Helper: type a string character by character
    function typeString(str, intervalMs, setter, onDone) {
      let i = 0
      const id = setInterval(() => {
        if (destroyed) { clearInterval(id); return }
        i++
        setter(str.slice(0, i))
        if (i >= str.length) {
          clearInterval(id)
          if (onDone) onDone()
        }
      }, intervalMs)
      intervals.push(id)
    }

    // ── PHASE 1: Type LINE1 ────────────────────────────────────────────────
    setCursorLine(1)
    setPhase(PHASE_INIT)
    typeString(LINE1, CHAR_INTERVAL_FAST, setDisplayedLine1, () => {
      if (destroyed) return
      // ── PHASE 2: Progress bar after short pause ──────────────────────────
      timers.push(setTimeout(() => {
        if (destroyed) return
        setShowCursor(false)   // hide cursor during bar fill
        setPhase(PHASE_LOAD)

        const startTime = performance.now()
        function tick(now) {
          if (destroyed) return
          const elapsed = now - startTime
          const pct     = Math.min(100, (elapsed / BAR_DURATION) * 100)
          setProgressPct(pct)
          if (pct < 100) {
            rafRef.current = requestAnimationFrame(tick)
          } else {
            // ── PHASE 3: Type LINE2 after short pause ─────────────────────
            timers.push(setTimeout(() => {
              if (destroyed) return
              setShowCursor(true)
              setCursorLine(2)
              setPhase(PHASE_NOMINAL)
              typeString(LINE2, CHAR_INTERVAL_SLOW, setDisplayedLine2, () => {
                if (destroyed) return
                // ── PHASE 4: Blast-shield wipe ──────────────────────────────
                timers.push(setTimeout(() => {
                  if (destroyed) return
                  setShowCursor(false)
                  setPhase(PHASE_WIPE)
                  gsap.to(panelRef.current, {
                    yPercent: -102,
                    duration: 1.0,
                    ease: 'power3.inOut',
                    onComplete: () => { if (!destroyed) onComplete() },
                  })
                }, PAUSE_AFTER_LINE2))
              })
            }, PAUSE_AFTER_BAR))
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }, PAUSE_AFTER_LINE1))
    })

    return () => {
      destroyed = true
      timers.forEach(clearTimeout)
      intervals.forEach(clearInterval)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [onComplete])

  // ── Cursor character component ───────────────────────────────────────────
  const Cursor = ({ active }) =>
    active && showCursor ? (
      <span style={{
        display: 'inline-block',
        width: '9px', height: '1.15em',
        background: '#818cf8',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
        boxShadow: '0 0 8px #818cf8',
      }} />
    ) : null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: '#050510',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        overflow: 'hidden',
      }}
    >
      {/* ── Subtle grid lines ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)
        `,
        backgroundSize: '44px 44px',
      }} />

      {/* ── Corner accents ─────────────────────────────────────────────────── */}
      {[
        { top: '20px',    left: '20px',    borderWidth: '2px 0 0 2px' },
        { top: '20px',    right: '20px',   borderWidth: '2px 2px 0 0' },
        { bottom: '20px', left: '20px',    borderWidth: '0 0 2px 2px' },
        { bottom: '20px', right: '20px',   borderWidth: '0 2px 2px 0' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: '40px', height: '40px',
          borderStyle: 'solid', borderColor: 'rgba(99,102,241,0.35)',
          ...s,
        }} />
      ))}

      {/* ── Center content ─────────────────────────────────────────────────── */}
      <div style={{ width: 'min(580px, 88vw)', position: 'relative' }}>

        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '44px', userSelect: 'none' }}>
          {/* Logo image */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '100px', height: '100px',
            borderRadius: '50%',
            marginBottom: '18px',
            overflow: 'hidden',
            border: '2px solid rgba(99,102,241,0.5)',
            boxShadow: '0 0 32px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.1)',
          }}>
            <img src="/nexus-logo.jpg" alt="Nexus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{
            color: '#818cf8',
            fontSize: '26px',
            fontWeight: 900,
            fontFamily: "'Orbitron', monospace",
            letterSpacing: '0.35em',
            textShadow: '0 0 20px rgba(129,140,248,0.6)',
            marginBottom: '6px',
          }}>
            NEXUS
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '10px',
            letterSpacing: '0.3em',
            fontFamily: "'Share Tech Mono', monospace",
          }}>
            MISSION CONTROL SYSTEM
          </div>
        </div>

        {/* ── Terminal output box ─────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(0,0,8,0.7)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '8px',
          padding: '22px 24px',
          marginBottom: '22px',
          minHeight: '100px',
          backdropFilter: 'blur(8px)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Scanline effect inside terminal */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
          }} />

          {/* Line 1 */}
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.04em',
            lineHeight: '1.7',
            color: '#818cf8',
            position: 'relative',
          }}>
            <span style={{ color: 'rgba(99,102,241,0.5)', marginRight: '10px' }}>›</span>
            {displayedLine1}
            <Cursor active={cursorLine === 1} />
          </div>

          {/* Line 2 — only visible in PHASE_NOMINAL / PHASE_WIPE */}
          {(phase === PHASE_NOMINAL || phase === PHASE_WIPE) && (
            <div style={{
              fontSize: '13px',
              letterSpacing: '0.04em',
              lineHeight: '1.7',
              color: '#e0e7ff',
              position: 'relative',
              marginTop: '4px',
            }}>
              <span style={{ color: 'rgba(99,102,241,0.5)', marginRight: '10px' }}>›</span>
              {displayedLine2}
              <Cursor active={cursorLine === 2} />
            </div>
          )}
        </div>

        {/* ── Progress bar ───────────────────────────────────────────────── */}
        <div>
          {/* Track */}
          <div style={{
            height: '3px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '99px',
            overflow: 'visible',
            position: 'relative',
          }}>
            {/* Fill */}
            <div
              ref={progressBarRef}
              style={{
                height: '100%',
                width: `${progressPct}%`,
                borderRadius: '99px',
                background: 'linear-gradient(90deg, #3730a3 0%, #6366f1 55%, #22d3ee 100%)',
                transition: 'width 0.05s linear',
                boxShadow: progressPct > 0
                  ? '0 0 8px #6366f1, 0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.2)'
                  : 'none',
                position: 'relative',
              }}
            >
              {/* Leading glow dot */}
              {progressPct > 0 && progressPct < 100 && (
                <div style={{
                  position: 'absolute', right: '-1px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#a5b4fc',
                  boxShadow: '0 0 10px #818cf8, 0 0 20px #6366f1',
                }} />
              )}
            </div>
          </div>

          {/* Labels row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.22)',
              fontSize: '10px',
              fontFamily: "'Orbitron', monospace",
              letterSpacing: '0.12em',
            }}>
              {phase === PHASE_INIT    && 'INITIALIZING'}
              {phase === PHASE_LOAD    && 'LOADING SYSTEMS'}
              {phase === PHASE_NOMINAL && 'SYSTEMS NOMINAL'}
              {phase === PHASE_WIPE    && 'LAUNCHING'}
            </span>

            <span style={{
              color: '#6366f1',
              fontSize: '11px',
              fontFamily: "'Orbitron', monospace",
              letterSpacing: '0.1em',
              textShadow: progressPct > 0 ? '0 0 10px rgba(99,102,241,0.6)' : 'none',
            }}>
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>

        {/* ── Version stamp ──────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          marginTop: '28px',
          color: 'rgba(255,255,255,0.1)',
          fontSize: '9px',
          fontFamily: "'Share Tech Mono', monospace",
          letterSpacing: '0.18em',
        }}>
          BUILD 2024.12 · CLEARANCE: OPERATOR · NODE: PRIMARY
        </div>

      </div>
    </div>
  )
}
