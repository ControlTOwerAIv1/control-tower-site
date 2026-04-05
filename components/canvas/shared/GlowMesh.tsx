'use client'

type GlowMeshProps = {
  type?: 'sphere' | 'box'
  position?: [number, number, number]
  color?: string
  size?: number
}

export default function GlowMesh({
  type = 'sphere',
  position = [0, 0, 0],
  color = '#00c8ff',
  size = 1,
}: GlowMeshProps) {
  return (
    <mesh position={position}>
      {type === 'sphere' ? <sphereGeometry args={[size, 18, 18]} /> : <boxGeometry args={[size, size, size]} />}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.2} roughness={0.4} />
    </mesh>
  )
}
