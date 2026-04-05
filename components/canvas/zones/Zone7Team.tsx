'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useScrollStore } from '@/store/scroll'
import { getZoneProgress, getZoneVisibility } from '@/lib/zones'

export default function Zone7Team() {
  const rootRef = useRef<THREE.Group>(null)
  const group = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const progress = useScrollStore((state) => state.progress)

  useFrame(({ clock }) => {
    const visibility = getZoneVisibility(progress, 7)
    const reveal = getZoneProgress(progress, 7)

    if (rootRef.current) {
      const targetY = -2.55 + reveal * 3.25
      const targetScale = 0.62 + visibility * 0.38
      rootRef.current.position.x = THREE.MathUtils.lerp(rootRef.current.position.x, -6.25, 0.08)
      rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, targetY, 0.12)
      rootRef.current.position.z = THREE.MathUtils.lerp(rootRef.current.position.z, 3.15, 0.08)
      const nextScale = THREE.MathUtils.lerp(rootRef.current.scale.x, targetScale, 0.12)
      rootRef.current.scale.setScalar(nextScale)
      rootRef.current.visible = visibility > 0.02

      rootRef.current.traverse((child) => {
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

    if (!group.current) return
    group.current.rotation.y = clock.elapsedTime * 0.25
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      mesh.position.y = 2.1 + Math.sin(clock.elapsedTime * 1.4 + i) * 0.24

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.25 + visibility * 0.4
    })

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2
      ringRef.current.rotation.z = -clock.elapsedTime * 0.45
      ;(ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25 + visibility * 0.37
    }
  })

  return (
    <group ref={rootRef} position={[-6.25, -2.55, 3.15]} scale={0.62}>
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.8, 20, 20]} />
        <meshStandardMaterial color="#0f2a3f" emissive="#00c8ff" emissiveIntensity={0.4} metalness={0.4} roughness={0.2} />
      </mesh>

      <mesh ref={ringRef} position={[0, 2.1, 0]}>
        <torusGeometry args={[3.1, 0.06, 16, 64]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.62} transparent opacity={0.6} />
      </mesh>

      <group ref={group}>
        {new Array(6).fill(0).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * 2.6, 2.1, Math.sin(angle) * 2.6]}>
              <icosahedronGeometry args={[0.55, 0]} />
              <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.58} metalness={0.35} roughness={0.2} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
