'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import GlowMesh from '@/components/canvas/shared/GlowMesh'

export default function Zone1Hero() {
  const screenRef = useRef<THREE.Mesh>(null)
  const scanRef = useRef<THREE.Mesh>(null)
  const barRefs = useRef<Array<THREE.Mesh | null>>([])
  const blipARef = useRef<THREE.Mesh>(null)
  const blipBRef = useRef<THREE.Mesh>(null)

  const dashboardBars = useMemo(() => {
    return new Array(72).fill(0).map((_, i) => {
      const row = Math.floor(i / 24)
      const col = i % 24
      return {
        x: -4.9 + col * 0.42,
        y: 1.08 + row * 0.82,
        baseHeight: 0.12 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2,
      }
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.16 + Math.sin(t * 1.8) * 0.04
    }

    if (scanRef.current) {
      scanRef.current.position.y = 1.15 + ((Math.sin(t * 0.9) + 1) / 2) * 1.25
    }

    dashboardBars.forEach((barData, i) => {
      const bar = barRefs.current[i]
      if (!bar) return

      const scaleY = 0.65 + ((Math.sin(t * 2.6 + barData.phase) + 1) / 2) * 1.1
      bar.scale.y = scaleY
      bar.position.y = barData.y + (barData.baseHeight * (scaleY - 1)) / 2

      const mat = bar.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.28 + ((Math.sin(t * 3.1 + barData.phase) + 1) / 2) * 0.45
    })

    if (blipARef.current) {
      blipARef.current.position.x = -4.9 + ((Math.sin(t * 1.0) + 1) / 2) * 9.8
    }

    if (blipBRef.current) {
      blipBRef.current.position.x = -4.9 + ((Math.sin(t * 1.2 + 1.2) + 1) / 2) * 9.8
    }
  })

  return (
    <group position={[-1, 0, 0]}>
      <mesh position={[0, 1.9, -1.28]}>
        <cylinderGeometry args={[6.45, 6.45, 0.12, 48, 1, true, -1.18, 2.35]} />
        <meshStandardMaterial color="#192b43" emissive="#00c8ff" emissiveIntensity={0.2} metalness={0.75} roughness={0.2} side={2} />
      </mesh>

      <mesh ref={screenRef} position={[0, 1.88, -1.02]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[6.18, 6.18, 0.44, 48, 1, true, -1.18, 2.35]} />
        <meshStandardMaterial color="#07101f" emissive="#00c8ff" emissiveIntensity={0.18} metalness={0.65} roughness={0.35} side={2} />
      </mesh>

      <mesh position={[0, 1.95, -0.9]}>
        <boxGeometry args={[10.8, 3.8, 0.01]} />
        <meshStandardMaterial color="#6dd7ff" emissive="#00c8ff" emissiveIntensity={0.35} transparent opacity={0.14} />
      </mesh>

      {dashboardBars.map((barData, i) => (
        <mesh
          key={`screen-bar-${i}`}
          position={[barData.x, barData.y, -0.9]}
          ref={(el) => {
            barRefs.current[i] = el
          }}
        >
          <boxGeometry args={[0.26, barData.baseHeight, 0.02]} />
          <meshStandardMaterial color="#87e1ff" emissive="#00c8ff" emissiveIntensity={0.45} transparent opacity={0.85} />
        </mesh>
      ))}

      <mesh ref={blipARef} position={[-4.9, 2.72, -0.88]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#b4f1ff" emissive="#00c8ff" emissiveIntensity={1.2} />
      </mesh>

      <mesh ref={blipBRef} position={[-4.9, 1.62, -0.88]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#b4f1ff" emissive="#00c8ff" emissiveIntensity={1.1} />
      </mesh>

      <mesh ref={scanRef} position={[-2.8, 1.15, -0.95]}>
        <boxGeometry args={[0.1, 0.48, 4.6]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.9} transparent opacity={0.5} />
      </mesh>

      {new Array(6).fill(0).map((_, i) => (
        <mesh key={`ops-tile-${i}`} position={[-3.8 + i * 1.52, 0.55, 1.16]}>
          <boxGeometry args={[1.22, 0.12, 0.42]} />
          <meshStandardMaterial color="#224365" emissive="#00c8ff" emissiveIntensity={0.16 + i * 0.02} />
        </mesh>
      ))}

      <mesh position={[1.8, 0.45, 1.2]}>
        <boxGeometry args={[3.4, 0.18, 1.7]} />
        <meshStandardMaterial color="#101826" />
      </mesh>
      <mesh position={[1.8, 0.9, 1.9]}>
        <boxGeometry args={[0.25, 0.9, 0.25]} />
        <meshStandardMaterial color="#151f31" />
      </mesh>

      <mesh position={[1.8, 0.3, 2.12]}>
        <boxGeometry args={[0.95, 0.55, 0.95]} />
        <meshStandardMaterial color="#122034" metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[1.8, 1.3, 1.1]}>
        <boxGeometry args={[0.5, 0.8, 0.38]} />
        <meshStandardMaterial color="#1f2f4a" />
      </mesh>
      <mesh position={[1.8, 2.0, 1.1]}>
        <sphereGeometry args={[0.23, 14, 14]} />
        <meshStandardMaterial color="#35b5ff" emissive="#00c8ff" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[2.15, 1.35, 1.0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.14, 0.55, 0.14]} />
        <meshStandardMaterial color="#35b5ff" />
      </mesh>

      <mesh position={[1.3, 0.55, 1.2]}>
        <boxGeometry args={[0.7, 0.08, 0.35]} />
        <meshStandardMaterial color="#2a496a" emissive="#00c8ff" emissiveIntensity={0.15} />
      </mesh>

      <GlowMesh type="box" position={[-1.7, 1.3, -0.6]} size={0.45} color="#00ff88" />
      <GlowMesh type="sphere" position={[-2.4, 2.5, -1.8]} size={0.22} color="#ffa000" />
      <GlowMesh type="sphere" position={[-0.8, 3.1, -2.2]} size={0.15} color="#00c8ff" />
    </group>
  )
}
