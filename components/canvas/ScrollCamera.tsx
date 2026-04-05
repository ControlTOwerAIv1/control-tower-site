'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useScrollStore } from '@/store/scroll'
import { interpolateCameraPosition } from '@/lib/zones'

export default function ScrollCamera() {
  const camera = useThree((state) => state.camera)
  const targetLookAt = useMemo(() => new THREE.Vector3(), [])
  const progress = useScrollStore((state) => state.progress)

  useFrame(() => {
    const { position, lookAt } = interpolateCameraPosition(progress)
    camera.position.lerp(position, 0.08)
    targetLookAt.lerp(lookAt, 0.08)
    camera.lookAt(targetLookAt)
  })

  return null
}
