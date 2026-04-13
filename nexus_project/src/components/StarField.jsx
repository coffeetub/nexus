import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animated star field with twinkling via shader
const starVertexShader = `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    float twinkle = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
    vAlpha = 0.3 + 0.7 * twinkle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z) * twinkle;
    gl_Position = projectionMatrix * mvPosition;
  }
`
const starFragmentShader = `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

export default function StarField({ count = 5000 }) {
  const ref = useRef()
  const uniforms = useRef({ uTime: { value: 0 } })

  const [positions, sizes, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const sp = new Float32Array(count)
    const ph = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 160
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i*3+2] = r * Math.cos(phi)
      sz[i]  = 0.5 + Math.random() * 2.5
      sp[i]  = 0.5 + Math.random() * 3.0
      ph[i]  = Math.random() * Math.PI * 2
    }
    return [pos, sz, sp, ph]
  }, [count])

  useFrame((state) => { uniforms.current.uTime.value = state.clock.getElapsedTime() })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Asteroid belt with instanced mesh
export function AsteroidBelt({ innerRadius = 11.0, outerRadius = 12.8, count = 800 }) {
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const rotSpeeds = useMemo(() => new Float32Array(count).map(() => (Math.random() - 0.5) * 0.5), [count])
  const angles = useMemo(() => new Float32Array(count).map(() => Math.random() * Math.PI * 2), [count])
  const radii = useMemo(() => new Float32Array(count).map(() => innerRadius + Math.random() * (outerRadius - innerRadius)), [count, innerRadius, outerRadius])
  const yOffsets = useMemo(() => new Float32Array(count).map(() => (Math.random() - 0.5) * 0.8), [count])

  useFrame((state, delta) => {
    for (let i = 0; i < count; i++) {
      angles[i] += delta * rotSpeeds[i] * 0.15
      dummy.position.set(Math.cos(angles[i]) * radii[i], yOffsets[i], Math.sin(angles[i]) * radii[i])
      dummy.rotation.set(angles[i] * 2, angles[i] * 3, angles[i])
      dummy.scale.setScalar(0.02 + Math.random() * 0.06)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <icosahedronGeometry args={[0.18, 0]} />
      <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.2} />
    </instancedMesh>
  )
}

export function Pulsar({ position }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.material.opacity = 0.4 + Math.abs(Math.sin(t * 4)) * 0.6
      ref.current.scale.setScalar(1 + Math.abs(Math.sin(t * 4)) * 0.5)
    }
  })
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#00ffff" intensity={2} distance={20} decay={2} />
    </group>
  )
}

export function Quasar({ position }) {
  const diskRef = useRef()
  const jetRef1 = useRef()
  const jetRef2 = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (diskRef.current) diskRef.current.rotation.z = t * 0.3
    if (jetRef1.current) jetRef1.current.material.opacity = 0.2 + Math.sin(t * 2) * 0.15
    if (jetRef2.current) jetRef2.current.material.opacity = 0.2 + Math.sin(t * 2 + Math.PI) * 0.15
  })
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={diskRef} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[0.8, 2.0, 32]} />
        <meshBasicMaterial color="#ff44ff" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ff00ff" intensity={1.5} distance={25} decay={2} />
    </group>
  )
}
