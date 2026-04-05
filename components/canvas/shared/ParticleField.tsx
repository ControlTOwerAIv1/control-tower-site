'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'

type ParticleFieldProps = {
  count?: number
  spread?: number
}

export default function ParticleField({ count = 300, spread = 120 }: ParticleFieldProps) {
  const groupRef = useRef<THREE.Points>(null)

  const points = useMemo(() => {
    const coords = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      coords[i * 3] = (Math.random() - 0.5) * spread
      coords[i * 3 + 1] = Math.random() * 40 - 10
      coords[i * 3 + 2] = (Math.random() - 0.5) * spread
    }
    return coords
  }, [count, spread])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.elapsedTime * 0.01
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.25) * 0.25
  })

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00c8ff" size={0.09} sizeAttenuation transparent opacity={0.72} depthWrite={false} />
    </points>
  )
}
