import { useMemo } from 'react'
import * as THREE from 'three'

export default function OrbitRing({ radius, tilt = 0, color = '#ffffff', active = false }) {
  const points = useMemo(() => {
    const pts = []
    const segments = 128
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  return (
    <group rotation={[tilt, 0, 0]}>
      <line geometry={geometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.35 : 0.1}
          linewidth={1}
          depthWrite={false}
        />
      </line>
    </group>
  )
}
