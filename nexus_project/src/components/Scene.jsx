import { useRef, useCallback, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import Planet from './Planet'
import Sun from './Sun'
import StarField, { AsteroidBelt, Pulsar, Quasar } from './StarField'
import { PLANETS } from '../data/planets'

// ── Meteor Shower (canvas-based, runs in R3F) ────────────────────────────────
function MeteorShower() {
  const meteorsRef = useRef([])
  const MAX = 8

  const spawn = () => ({
    active: true, t: 0,
    life: 0.6 + Math.random() * 1.0,
    speed: 1.0 + Math.random() * 1.5,
    ox: (Math.random() - 0.5) * 160,
    oy: 30 + Math.random() * 40,
    oz: -20 + Math.random() * 80,
    dx: -0.4 - Math.random() * 0.5,
    dy: -0.5 - Math.random() * 0.3,
    dz: -0.1 - Math.random() * 0.2,
    trailLen: 5 + Math.random() * 8,
    color: Math.random() < 0.6 ? new THREE.Color('#a8c4ff') : new THREE.Color('#ffa8c8'),
  })

  const lines = useMemo(() => {
    return Array.from({ length: MAX }, () => {
      const geo = new THREE.BufferGeometry()
      const pos = new Float32Array(6)
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color('#a8c4ff'),
        transparent: true, opacity: 0, depthWrite: false,
      })
      return { geo, mat, data: null }
    })
  }, [])

  useFrame((state, delta) => {
    // Randomly spawn
    lines.forEach(l => {
      if (!l.data || !l.data.active) {
        if (Math.random() < delta * 0.5) l.data = spawn()
      }
    })

    lines.forEach(l => {
      if (!l.data || !l.data.active) {
        l.mat.opacity = 0
        return
      }
      const m = l.data
      m.t += delta * m.speed
      if (m.t > m.life) { m.data = null; l.mat.opacity = 0; l.data = null; return }

      const progress = m.t / m.life
      const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
      const hx = m.ox + m.dx * m.t * 55
      const hy = m.oy + m.dy * m.t * 55
      const hz = m.oz + m.dz * m.t * 55
      const tl = m.trailLen * (1 - progress * 0.4)
      const pos = l.geo.attributes.position.array
      pos[0] = hx - m.dx * tl; pos[1] = hy - m.dy * tl; pos[2] = hz - m.dz * tl
      pos[3] = hx;              pos[4] = hy;              pos[5] = hz
      l.geo.attributes.position.needsUpdate = true
      l.mat.color = m.color
      l.mat.opacity = fade * 0.9
    })
  })

  return (
    <>
      {lines.map((l, i) => (
        <line key={i} geometry={l.geo} material={l.mat} />
      ))}
    </>
  )
}

export default function Scene({ onHoverPlanet, onUnhoverPlanet, onClickPlanet, visitedIds, classifiedMode }) {
  const { camera } = useThree()
  const isAnimatingRef = useRef(false)
  const lookTargetRef  = useRef(new THREE.Vector3(0, 0, 0))
  const driftModeRef   = useRef(true)

  useFrame((state) => {
    if (!driftModeRef.current) {
      camera.lookAt(lookTargetRef.current)
      return
    }
    const t = state.clock.getElapsedTime()
    const driftX = Math.sin(t * 0.07) * 1.2
    const driftY = Math.cos(t * 0.05) * 0.6
    camera.position.x += (driftX - camera.position.x) * 0.008
    camera.position.y += (driftY - camera.position.y) * 0.008
    camera.lookAt(0, 0, 0)
  })

  const handleClick = useCallback((planet, worldPos) => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    driftModeRef.current   = false

    const planetPos = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z)
    lookTargetRef.current.copy(planetPos)

    const dir      = planetPos.clone().normalize()
    const closeDist = planet.size * 6 + planet.orbitRadius * 0.28
    const camTarget = planetPos.clone().sub(dir.clone().multiplyScalar(closeDist))
    camTarget.y += planet.size * 1.5

    gsap.to(camera.position, {
      x: camTarget.x, y: camTarget.y, z: camTarget.z,
      duration: 1.4, ease: 'power3.inOut',
      onUpdate: () => {
        lookTargetRef.current.copy(planetPos)
        camera.lookAt(lookTargetRef.current)
      },
      onComplete: () => {
        onClickPlanet(planet)
        setTimeout(() => {
          gsap.to(camera.position, {
            x: 0, y: 0, z: 18,
            duration: 1.6, ease: 'power2.inOut',
            onUpdate: () => {
              lookTargetRef.current.lerp(new THREE.Vector3(0, 0, 0), 0.04)
              camera.lookAt(lookTargetRef.current)
            },
            onComplete: () => {
              lookTargetRef.current.set(0, 0, 0)
              driftModeRef.current   = true
              isAnimatingRef.current = false
            },
          })
        }, 450)
      },
    })
  }, [camera, onClickPlanet])

  return (
    <>
      <ambientLight intensity={0.06} color="#1a1a3e" />
      <directionalLight position={[20, 10, 10]} intensity={0.25} color="#8080ff" />
      <fog attach="fog" args={['#020209', 100, 260]} />

      <StarField count={4000} />
      <MeteorShower />
      <AsteroidBelt innerRadius={11.0} outerRadius={12.8} count={700} />

      {/* Pulsar — upper right distant */}
      <Pulsar position={[85, 25, -65]} />

      {/* Quasar — lower left distant */}
      <Quasar position={[-95, -20, -80]} />

      <Sun />

      {PLANETS.map((planet) => (
        <Planet
          key={planet.id}
          data={planet}
          onHover={onHoverPlanet}
          onUnhover={onUnhoverPlanet}
          onClick={handleClick}
          visited={visitedIds.has(planet.id)}
          classifiedMode={classifiedMode}
        />
      ))}
    </>
  )
}
