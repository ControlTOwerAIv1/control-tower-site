'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useScrollStore } from '@/store/scroll'
import { getZoneProgress, getZoneVisibility } from '@/lib/zones'

export default function Zone4Services() {
  const group = useRef<THREE.Group>(null)
  const progress = useScrollStore((state) => state.progress)

  useFrame(({ clock }) => {
    if (!group.current) return

    const visibility = getZoneVisibility(progress, 4)
    const reveal = getZoneProgress(progress, 4)
    const targetY = -2.45 + reveal * 2.8
    const targetScale = 0.56 + visibility * 0.44

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, -6.1, 0.08)
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.12)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 3.3, 0.08)
    const nextScale = THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.12)
    group.current.scale.setScalar(nextScale)
    group.current.visible = visibility > 0.02

    group.current.traverse((child) => {
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

    group.current.children.forEach((child, i) => {
      child.rotation.y = Math.sin(clock.elapsedTime * 0.7 + i) * 0.18
      child.rotation.x = -0.14 + Math.sin(clock.elapsedTime * 0.35 + i) * 0.03
      child.position.y = 1.85 + Math.sin(clock.elapsedTime * 0.9 + i) * 0.28

      const card = child.children[0] as THREE.Mesh | undefined
      if (card) {
        const mat = card.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = (0.14 + i * 0.015) * visibility
      }
    })
  })

  return (
    <group ref={group} position={[-6.1, -2.45, 3.3]} scale={0.56}>
      {new Array(5).fill(0).map((_, i) => (
        <group key={i} position={[-2.2 + i * 1.1, 1.85, -0.6 + (i % 2) * 0.8]} rotation={[-0.14, 0, 0.03]}>
          <mesh>
            <boxGeometry args={[0.96, 1.55, 0.14]} />
            <meshStandardMaterial color="#0f1f35" emissive="#00c8ff" emissiveIntensity={0.16} metalness={0.64} roughness={0.22} />
          </mesh>

          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[0.82, 1.28, 0.02]} />
            <meshStandardMaterial color="#79daff" emissive="#00c8ff" emissiveIntensity={0.4} transparent opacity={0.28} />
          </mesh>

          <mesh position={[0, 0.72, 0.11]}>
            <sphereGeometry args={[0.14, 14, 14]} />
            <meshStandardMaterial color="#9ce9ff" emissive="#00c8ff" emissiveIntensity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
