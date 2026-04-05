'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import LightBeam from '@/components/canvas/shared/LightBeam'
import { useScrollStore } from '@/store/scroll'
import { getZoneProgress, getZoneVisibility } from '@/lib/zones'

const nodePositions: [number, number, number][] = [
  [-2.6, 2.95, 0],
  [-0.9, 2.95, 0],
  [0.9, 2.95, 0],
  [2.6, 2.95, 0],
  [-2.6, 1.45, 0],
  [-0.9, 1.45, 0],
  [0.9, 1.45, 0],
  [2.6, 1.45, 0],
]

export default function Zone3HowItWorks() {
  const groupRef = useRef<THREE.Group>(null)
  const refs = useRef<Array<THREE.Mesh | null>>([])
  const packetRefs = useRef<Array<THREE.Mesh | null>>([])
  const progress = useScrollStore((state) => state.progress)
  const links = useMemo(() => {
    return [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [6, 7],
      [1, 5],
      [2, 6],
      [3, 7],
    ]
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const visibility = getZoneVisibility(progress, 3)
    const reveal = getZoneProgress(progress, 3)

    if (groupRef.current) {
      const targetY = -2.6 + reveal * 2.9
      const targetScale = 0.58 + visibility * 0.42
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, -6.2, 0.08)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.12)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 3.35, 0.08)
      const nextScale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.12)
      groupRef.current.scale.setScalar(nextScale)
      groupRef.current.visible = visibility > 0.02

      groupRef.current.traverse((child) => {
        const material = (child as THREE.Mesh).material
        if (!material) return

        const applyOpacity = (mat: THREE.Material) => {
          const baseOpacity = typeof mat.userData.baseOpacity === 'number' ? mat.userData.baseOpacity : mat.opacity
          if (typeof mat.userData.baseOpacity !== 'number') {
            mat.userData.baseOpacity = baseOpacity
          }
          mat.transparent = true
          mat.opacity = baseOpacity * visibility
        }

        if (Array.isArray(material)) {
          material.forEach(applyOpacity)
        } else {
          applyOpacity(material)
        }
      })
    }

    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const pulse = 0.55 + Math.sin(t * 2.2 + i * 0.6) * 0.25
      ;(mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * visibility
    })

    packetRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const [from, to] = links[i % links.length]
      const start = nodePositions[from]
      const end = nodePositions[to]
      const travel = (t * 0.45 + i * 0.17) % 1

      mesh.position.set(
        start[0] + (end[0] - start[0]) * travel,
        start[1] + (end[1] - start[1]) * travel,
        start[2] + (end[2] - start[2]) * travel,
      )

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.25 + visibility * 0.9
    })
  })

  return (
    <group ref={groupRef} position={[-6.2, -2.6, 3.35]} scale={0.58}>
      {nodePositions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.6} metalness={0.24} roughness={0.2} />
        </mesh>
      ))}

      {links.map(([from, to], i) => (
        <LightBeam key={i} from={nodePositions[from]} to={nodePositions[to]} color="#00c8ff" />
      ))}

      {new Array(14).fill(0).map((_, i) => (
        <mesh
          key={`packet-${i}`}
          position={[0, 0, 0]}
          ref={(el) => {
            packetRefs.current[i] = el
          }}
        >
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#9de9ff" emissive="#00c8ff" emissiveIntensity={1.05} />
        </mesh>
      ))}

      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[6.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffa000" emissive="#ffa000" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0, 4.05, 0]}>
        <boxGeometry args={[6.1, 0.04, 0.04]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.38} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}
