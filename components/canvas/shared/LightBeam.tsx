'use client'

import { Line } from '@react-three/drei'

type LightBeamProps = {
  from: [number, number, number]
  to: [number, number, number]
  color?: string
}

export default function LightBeam({ from, to, color = '#00c8ff' }: LightBeamProps) {
  return <Line points={[from, to]} color={color} lineWidth={1.2} transparent opacity={0.7} />
}
