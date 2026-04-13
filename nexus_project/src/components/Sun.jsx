import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Sun() {
  const coreRef = useRef()
  const glowRef = useRef()
  const outerRef = useRef()
  const coronaRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.15
      coreRef.current.rotation.z = t * 0.05
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.04
      glowRef.current.scale.setScalar(s)
    }
    if (outerRef.current) {
      const s = 1 + Math.sin(t * 0.7 + 1) * 0.06
      outerRef.current.scale.setScalar(s)
      outerRef.current.material.opacity = 0.06 + Math.sin(t * 0.8) * 0.02
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z = t * 0.08
      coronaRef.current.material.opacity = 0.04 + Math.sin(t * 0.5) * 0.015
    }
  })

  return (
    <group>
      {/* Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial
          color="#fff8e1"
          emissive="#ff9500"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial
          color="#ffb700"
          emissive="#ff6b00"
          emissiveIntensity={1.2}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial
          color="#ff8c00"
          emissive="#ff4400"
          emissiveIntensity={0.8}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Corona ring */}
      <mesh ref={coronaRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.4, 8, 64]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff8800"
          emissiveIntensity={0.5}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>

      {/* Point light from sun */}
      <pointLight color="#ffb347" intensity={4} distance={60} decay={1.5} />
      <pointLight color="#ffffff" intensity={1.5} distance={20} decay={2} />
    </group>
  )
}
