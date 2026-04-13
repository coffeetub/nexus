import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANETS } from '../data/planets'

// Draws glowing lines between visited planets — a constellation of your journey
export default function ConstellationLines({ visitedIds, planetPositions }) {
  const linesRef = useRef([])
  const timeRef = useRef(0)

  const visitedPlanets = useMemo(() =>
    PLANETS.filter(p => visitedIds.has(p.id)),
    [visitedIds]
  )

  const lineData = useMemo(() => {
    if (visitedPlanets.length < 2) return []
    const lines = []
    for (let i = 0; i < visitedPlanets.length - 1; i++) {
      lines.push({ from: visitedPlanets[i], to: visitedPlanets[i + 1] })
    }
    return lines
  }, [visitedPlanets])

  useFrame((state, delta) => {
    timeRef.current += delta
    linesRef.current.forEach((mesh, i) => {
      if (mesh && mesh.material) {
        mesh.material.opacity = 0.08 + Math.sin(timeRef.current * 1.5 + i * 0.8) * 0.05
      }
    })
  })

  if (lineData.length === 0 || !planetPositions || Object.keys(planetPositions).length < 2) return null

  return (
    <>
      {lineData.map((line, i) => {
        const fromPos = planetPositions[line.from.id]
        const toPos = planetPositions[line.to.id]
        if (!fromPos || !toPos) return null

        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z),
          new THREE.Vector3(toPos.x, toPos.y, toPos.z),
        ])

        return (
          <line key={`${line.from.id}-${line.to.id}`} ref={el => linesRef.current[i] = el} geometry={geo}>
            <lineBasicMaterial
              color={line.from.color}
              transparent
              opacity={0.08}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </line>
        )
      })}
    </>
  )
}
