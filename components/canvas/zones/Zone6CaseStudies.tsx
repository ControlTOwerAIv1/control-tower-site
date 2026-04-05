'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useScrollStore } from '@/store/scroll'
import { getZoneProgress, getZoneVisibility } from '@/lib/zones'

export default function Zone6CaseStudies() {
  const group = useRef<THREE.Group>(null)
  const scanRefs = useRef<Array<THREE.Mesh | null>>([])
  const progress = useScrollStore((state) => state.progress)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const visibility = getZoneVisibility(progress, 6)
    const reveal = getZoneProgress(progress, 6)

    if (!group.current) return
    const targetY = -2.45 + reveal * 2.95
    const targetScale = 0.6 + visibility * 0.4
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, -6.1, 0.08)
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.12)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 3.25, 0.08)
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
      child.position.y = 2.15 + Math.sin(t * 0.9 + i) * 0.2
      child.rotation.y = -0.28 + Math.sin(t * 0.35 + i) * 0.06

      const panel = child.children[0] as THREE.Mesh | undefined
      if (panel) {
        const mat = panel.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.14 + visibility * 0.28
      }
    })

    scanRefs.current.forEach((scan, i) => {
      if (!scan) return
      scan.position.y = 1.45 + ((Math.sin(t * 1.2 + i) + 1) / 2) * 1.35
      const mat = scan.material as THREE.MeshStandardMaterial
      mat.opacity = 0.15 + visibility * 0.45
    })
  })

  return (
    <group ref={group} position={[-6.1, -2.45, 3.25]} scale={0.6}>
      {new Array(3).fill(0).map((_, i) => (
        <group key={i} position={[-1.75 + i * 1.75, 2.15, -0.52]} rotation={[-0.1, -0.28, 0.02]}>
          <mesh>
            <boxGeometry args={[1.25, 1.82, 0.14]} />
            <meshStandardMaterial color="#0e2238" emissive="#00c8ff" emissiveIntensity={0.34} metalness={0.65} roughness={0.18} />
          </mesh>

          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[1.02, 1.45, 0.02]} />
            <meshStandardMaterial color="#85ddff" emissive="#00c8ff" emissiveIntensity={0.45} transparent opacity={0.25} />
          </mesh>

          <mesh
            position={[0, 1.1, 0.09]}
            ref={(el) => {
              scanRefs.current[i] = el
            }}
          >
            <boxGeometry args={[1.08, 0.08, 0.01]} />
            <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={1} transparent opacity={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
