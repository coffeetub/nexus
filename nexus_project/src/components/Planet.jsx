import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import OrbitRing from './OrbitRing'

// ── Per-planet canvas textures ───────────────────────────────────────────────
function makePlanetTexture(planetId) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')

  const configs = {
    mercury: {
      bands: [
        { y:0, h:1.0, c:'#6a6a6a' },
      ],
      craters: true, type:'rocky',
      storms: [],
    },
    venus: {
      bands: [
        { y:0,    h:0.25, c:'#c8840a' },
        { y:0.25, h:0.20, c:'#e09420' },
        { y:0.45, h:0.20, c:'#d4a030' },
        { y:0.65, h:0.20, c:'#b87010' },
        { y:0.85, h:0.15, c:'#c07818' },
      ],
      storms: [{ x:0.5, y:0.5, rx:0.3, ry:0.18, c:'#f0c060', a:0.25 }],
      type:'gas',
    },
    earth: {
      bands: [
        { y:0,    h:0.15, c:'#ffffff' }, // poles
        { y:0.15, h:0.18, c:'#1a6bb5' },
        { y:0.33, h:0.22, c:'#2a8a3e' },
        { y:0.55, h:0.20, c:'#1a6bb5' },
        { y:0.75, h:0.15, c:'#2a7a50' },
        { y:0.90, h:0.10, c:'#e8e8f0' },
      ],
      storms: [{ x:0.3, y:0.45, rx:0.07, ry:0.04, c:'#e8f0ff', a:0.45 }],
      type:'rocky',
    },
    mars: {
      bands: [
        { y:0,    h:0.20, c:'#8b2500' },
        { y:0.20, h:0.20, c:'#c0391a' },
        { y:0.40, h:0.25, c:'#d44e2a' },
        { y:0.65, h:0.20, c:'#b03520' },
        { y:0.85, h:0.15, c:'#7a2010' },
      ],
      storms: [{ x:0.65, y:0.55, rx:0.08, ry:0.05, c:'#e8a090', a:0.3 }],
      type:'rocky',
    },
    jupiter: {
      bands: [
        { y:0,    h:0.12, c:'#c8a868' },
        { y:0.12, h:0.10, c:'#a07840' },
        { y:0.22, h:0.12, c:'#d4b47a' },
        { y:0.34, h:0.08, c:'#8a5828' },
        { y:0.42, h:0.14, c:'#c89860' },
        { y:0.56, h:0.10, c:'#b07838' },
        { y:0.66, h:0.12, c:'#d4b07a' },
        { y:0.78, h:0.10, c:'#a06830' },
        { y:0.88, h:0.12, c:'#c8a060' },
      ],
      storms: [
        { x:0.28, y:0.54, rx:0.16, ry:0.09, c:'#e87040', a:0.8 }, // Great Red Spot
        { x:0.70, y:0.38, rx:0.05, ry:0.03, c:'#f0d090', a:0.5 },
      ],
      type:'gas',
    },
    saturn: {
      bands: [
        { y:0,    h:0.14, c:'#c8b478' },
        { y:0.14, h:0.12, c:'#b8a060' },
        { y:0.26, h:0.16, c:'#d4c08a' },
        { y:0.42, h:0.10, c:'#a89050' },
        { y:0.52, h:0.16, c:'#c8b070' },
        { y:0.68, h:0.12, c:'#b8a060' },
        { y:0.80, h:0.20, c:'#d0bc80' },
      ],
      storms: [{ x:0.5, y:0.48, rx:0.06, ry:0.035, c:'#ffe8b0', a:0.45 }],
      type:'gas',
    },
    uranus: {
      bands: [
        { y:0,    h:0.25, c:'#5ecfdf' },
        { y:0.25, h:0.25, c:'#7adfef' },
        { y:0.50, h:0.25, c:'#5ecfdf' },
        { y:0.75, h:0.25, c:'#48bfcf' },
      ],
      storms: [],
      type:'ice',
    },
    neptune: {
      bands: [
        { y:0,    h:0.20, c:'#2244aa' },
        { y:0.20, h:0.20, c:'#3358cc' },
        { y:0.40, h:0.20, c:'#4466dd' },
        { y:0.60, h:0.20, c:'#2244aa' },
        { y:0.80, h:0.20, c:'#1a3388' },
      ],
      storms: [{ x:0.35, y:0.45, rx:0.12, ry:0.07, c:'#ffffff', a:0.35 }], // Great Dark Spot
      type:'gas',
    },
  }

  const cfg = configs[planetId] || configs.earth

  // Draw bands
  cfg.bands.forEach(({ y, h, c }) => {
    const yPx = y * size, hPx = h * size
    const grad = ctx.createLinearGradient(0, yPx, 0, yPx + hPx)
    grad.addColorStop(0, c + 'cc')
    grad.addColorStop(0.5, c)
    grad.addColorStop(1, c + 'cc')
    ctx.fillStyle = grad
    ctx.fillRect(0, yPx, size, hPx)
  })

  // Noise layer
  for (let i = 0; i < 2500; i++) {
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 1.4 + 0.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.09})`
    ctx.fill()
  }

  // Horizontal streaks for gas giants
  if (cfg.type === 'gas' || cfg.type === 'ice') {
    for (let i = 0; i < 30; i++) {
      const y = Math.random() * size
      const len = size * (0.3 + Math.random() * 0.7)
      const x0 = Math.random() * size * 0.3
      ctx.beginPath(); ctx.moveTo(x0, y)
      for (let j = 1; j < 12; j++) {
        ctx.lineTo(x0 + (len / 12) * j, y + Math.sin(j * 0.8 + i) * 5)
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.05})`
      ctx.lineWidth = 0.5 + Math.random() * 1.2
      ctx.stroke()
    }
  }

  // Craters for rocky planets
  if (cfg.craters || (cfg.type === 'rocky' && planetId !== 'earth')) {
    for (let i = 0; i < 22; i++) {
      const cx = Math.random() * size, cy = Math.random() * size
      const r = 4 + Math.random() * 18
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0,0,0,0.22)`
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = `rgba(0,0,0,0.08)`
      ctx.fill()
    }
  }

  // Storm ovals
  cfg.storms.forEach(({ x, y, rx, ry, c, a }) => {
    ctx.save()
    ctx.translate(x * size, y * size)
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * size)
    sg.addColorStop(0, c + Math.round(a * 255).toString(16).padStart(2, '0'))
    sg.addColorStop(0.5, c + '44')
    sg.addColorStop(1, 'transparent')
    ctx.fillStyle = sg
    ctx.scale(1, ry / rx)
    ctx.beginPath()
    ctx.arc(0, 0, rx * size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })

  // Spherical shading
  const sphere = ctx.createRadialGradient(size * 0.38, size * 0.32, 0, size / 2, size / 2, size * 0.52)
  sphere.addColorStop(0, 'rgba(255,255,255,0.18)')
  sphere.addColorStop(0.4, 'rgba(0,0,0,0)')
  sphere.addColorStop(0.75, 'rgba(0,0,0,0.25)')
  sphere.addColorStop(1, 'rgba(0,0,0,0.75)')
  ctx.fillStyle = sphere
  ctx.fillRect(0, 0, size, size)

  // Clip to circle
  const out = document.createElement('canvas')
  out.width = size; out.height = size
  const ctx2 = out.getContext('2d')
  ctx2.beginPath()
  ctx2.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx2.clip()
  ctx2.drawImage(canvas, 0, 0)
  return new THREE.CanvasTexture(out)
}

// ── Saturn ring system ────────────────────────────────────────────────────────
function SaturnRings({ size }) {
  return (
    <group rotation={[Math.PI * 0.45, 0.05, 0.1]}>
      {[
        { inner: 1.35, outer: 1.70, opacity: 0.20, color: '#c8a050' },
        { inner: 1.72, outer: 2.10, opacity: 0.35, color: '#d4b060' },
        { inner: 2.12, outer: 2.50, opacity: 0.25, color: '#b89040' },
        { inner: 2.52, outer: 2.80, opacity: 0.12, color: '#c8a850' },
      ].map((r, i) => (
        <mesh key={i}>
          <ringGeometry args={[size * r.inner, size * r.outer, 128]} />
          <meshBasicMaterial color={r.color} transparent opacity={r.opacity} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ── Uranus / Neptune faint rings ──────────────────────────────────────────────
function FaintRings({ size, color }) {
  return (
    <group rotation={[Math.PI * 0.42, 0.1, 0]}>
      <mesh>
        <ringGeometry args={[size * 1.6, size * 1.75, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function Planet({ data, onHover, onUnhover, onClick, visited, classifiedMode }) {
  const meshRef      = useRef()
  const glowRef      = useRef()
  const haloRef      = useRef()
  const outerGlowRef = useRef()
  const groupRef     = useRef()
  const angleRef     = useRef(Math.random() * Math.PI * 2)
  const [hovered, setHovered] = useState(false)

  const texture = useMemo(() => makePlanetTexture(data.id), [data.id])

  // ── Gold texture for classified mode ─────────────────────────────────────
  const goldTexture = useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, '#ffd700')
    grad.addColorStop(0.3, '#ffec6e')
    grad.addColorStop(0.6, '#d4a000')
    grad.addColorStop(1, '#b8860b')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 1800; i++) {
      ctx.beginPath()
      ctx.arc(Math.random()*size, Math.random()*size, Math.random()*1.2+0.2, 0, Math.PI*2)
      ctx.fillStyle = `rgba(255,255,200,${Math.random()*0.12})`
      ctx.fill()
    }
    const sphere = ctx.createRadialGradient(size*0.38, size*0.32, 0, size/2, size/2, size*0.52)
    sphere.addColorStop(0, 'rgba(255,255,200,0.35)')
    sphere.addColorStop(0.4, 'rgba(0,0,0,0)')
    sphere.addColorStop(0.75, 'rgba(0,0,0,0.3)')
    sphere.addColorStop(1, 'rgba(0,0,0,0.8)')
    ctx.fillStyle = sphere; ctx.fillRect(0, 0, size, size)
    const out = document.createElement('canvas')
    out.width = size; out.height = size
    const ctx2 = out.getContext('2d')
    ctx2.beginPath(); ctx2.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx2.clip()
    ctx2.drawImage(canvas, 0, 0)
    return new THREE.CanvasTexture(out)
  }, [])

  const activeColor  = classifiedMode ? '#ffd700' : data.color
  const activeEmissive = classifiedMode ? new THREE.Color('#b87000') : data.emissive

  useFrame((state, delta) => {
    const speed = hovered ? data.orbitSpeed * 0.15 : data.orbitSpeed
    angleRef.current += delta * speed
    const x     = Math.cos(angleRef.current) * data.orbitRadius
    const z     = Math.sin(angleRef.current) * data.orbitRadius
    const tiltY = Math.sin(angleRef.current) * data.orbitRadius * Math.sin(data.orbitTilt)
    if (groupRef.current) groupRef.current.position.set(x, tiltY * 0.3, z)
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35
      meshRef.current.rotation.x += delta * 0.015
    }
    const t = state.clock.getElapsedTime()
    if (glowRef.current) {
      const s = hovered ? 1 + Math.sin(t * 3.5) * 0.1 : 1 + Math.sin(t * 1.5 + data.orbitRadius) * 0.04
      glowRef.current.scale.setScalar(s)
      glowRef.current.material.opacity = hovered ? 0.45 : 0.12
      glowRef.current.material.emissiveIntensity = hovered ? 2.0 : 0.8
      glowRef.current.material.color.set(activeColor)
      glowRef.current.material.emissive.set(activeColor)
    }
    if (haloRef.current) {
      haloRef.current.material.opacity = hovered ? 0.7 : 0
      haloRef.current.rotation.z += delta * (hovered ? 1.5 : 0.8)
      haloRef.current.material.color.set(activeColor)
    }
    if (outerGlowRef.current) {
      const os = hovered ? 1 + Math.sin(t * 2) * 0.05 : 0.95
      outerGlowRef.current.scale.setScalar(os)
      outerGlowRef.current.material.opacity = hovered ? 0.18 : 0.0
      outerGlowRef.current.material.color.set(activeColor)
    }
  })

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.4, ease: 'elastic.out(1, 0.5)' })
    }
    const pos = groupRef.current?.position
    if (pos) onHover(data, { x: pos.x, y: pos.y, z: pos.z })
  }, [data, onHover])

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation()
    setHovered(false)
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' })
    }
    onUnhover()
  }, [onUnhover])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    const pos = groupRef.current?.position
    if (!pos) return
    onClick(data, { x: pos.x, y: pos.y, z: pos.z })
  }, [data, onClick])

  return (
    <group>
      <OrbitRing radius={data.orbitRadius} tilt={data.orbitTilt} color={data.color} active={hovered} />
      <group ref={groupRef}>
        <mesh ref={meshRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick} castShadow>
          <sphereGeometry args={[data.size, 64, 64]} />
          <meshStandardMaterial
            map={classifiedMode ? goldTexture : texture}
            emissive={activeEmissive}
            emissiveIntensity={hovered ? 1.8 : (classifiedMode ? 0.7 : 0.35)}
            roughness={classifiedMode ? 0.3 : 0.7}
            metalness={classifiedMode ? 0.8 : 0.12}
          />
        </mesh>

        {/* Saturn full ring system */}
        {data.id === 'saturn' && <SaturnRings size={data.size} />}

        {/* Uranus / Neptune faint rings */}
        {(data.id === 'uranus' || data.id === 'neptune') && (
          <FaintRings size={data.size} color={data.color} />
        )}

        {/* Inner glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[data.size * 1.45, 32, 32]} />
          <meshStandardMaterial color={activeColor} emissive={activeColor} emissiveIntensity={0.8}
            transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
        </mesh>

        {/* Outer soft glow */}
        <mesh ref={outerGlowRef}>
          <sphereGeometry args={[data.size * 2.2, 32, 32]} />
          <meshBasicMaterial color={activeColor} transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
        </mesh>

        {/* Spinning halo ring */}
        <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[data.size * 1.9, 0.03, 8, 64]} />
          <meshBasicMaterial color={activeColor} transparent opacity={0} depthWrite={false} />
        </mesh>

        {visited && (
          <mesh position={[data.size * 0.75, data.size * 0.75, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#22d3ee" />
          </mesh>
        )}
      </group>
    </group>
  )
}
