'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useScrollStore } from '@/store/scroll'
import { getZoneProgress, getZoneVisibility } from '@/lib/zones'

export default function Zone5WhyUs() {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const ringRefB = useRef<THREE.Mesh>(null)
  const barRefs = useRef<Array<THREE.Mesh | null>>([])
  const progress = useScrollStore((state) => state.progress)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const visibility = getZoneVisibility(progress, 5)
    const reveal = getZoneProgress(progress, 5)

    if (groupRef.current) {
      const targetY = -2.5 + reveal * 3
      const targetScale = 0.62 + visibility * 0.38
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, -6.2, 0.08)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.12)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 3.2, 0.1)
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

    if (!ringRef.current) return
    ringRef.current.rotation.x = Math.PI / 2
    ringRef.current.rotation.z = t * 0.5
    ;(ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + visibility * 0.4

    if (ringRefB.current) {
      ringRefB.current.rotation.x = Math.PI / 2
      ringRefB.current.rotation.z = -t * 0.38
      ;(ringRefB.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.22 + visibility * 0.35
    }

    barRefs.current.forEach((bar, i) => {
      if (!bar) return
      const pulse = 0.92 + Math.sin(t * 1.4 + i * 0.7) * 0.08
      bar.scale.y = pulse
      bar.position.y = (bar.userData.baseHeight / 2) * pulse
      ;(bar.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.12 + visibility * 0.26
    })
  })

  return (
    <group ref={groupRef} position={[-6.2, -2.5, 3.2]} scale={0.62}>
      {[2.2, 3.6, 4.8, 3.1].map((height, i) => (
        <mesh
          key={i}
          position={[-2 + i * 1.3, height / 2, -0.45]}
          ref={(el) => {
            barRefs.current[i] = el
            if (el) el.userData.baseHeight = height
          }}
        >
          <boxGeometry args={[0.8, height, 0.8]} />
          <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.25} metalness={0.4} roughness={0.22} />
        </mesh>
      ))}

      <mesh position={[2.5, 2.8, 0.42]}>
        <sphereGeometry args={[1.25, 24, 24]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.45} />
      </mesh>

      <mesh ref={ringRef} position={[2.5, 2.8, 0.42]}>
        <torusGeometry args={[1.9, 0.08, 16, 64]} />
        <meshStandardMaterial color="#ffa000" emissive="#ffa000" emissiveIntensity={0.65} />
      </mesh>

      <mesh ref={ringRefB} position={[2.5, 2.8, 0.42]}>
        <torusGeometry args={[2.35, 0.04, 16, 64]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.55} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
