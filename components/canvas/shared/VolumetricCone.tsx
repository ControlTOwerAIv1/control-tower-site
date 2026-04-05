'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

type VolumetricConeProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  height?: number
  radius?: number
  color?: string
  opacity?: number
  pulseSpeed?: number
}

export default function VolumetricCone({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  height = 6,
  radius = 2,
  color = '#6ad6ff',
  opacity = 0.14,
  pulseSpeed = 0.8,
}: VolumetricConeProps) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const material = ref.current.material as THREE.MeshBasicMaterial
    material.opacity = opacity * (0.82 + Math.sin(clock.elapsedTime * pulseSpeed) * 0.18)
    ref.current.rotation.y += 0.0014
  })

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <coneGeometry args={[radius, height, 32, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}