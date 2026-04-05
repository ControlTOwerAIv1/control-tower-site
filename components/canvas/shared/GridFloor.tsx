'use client'

export default function GridFloor() {
  return (
    <group position={[0, -0.02, 0]}>
      <gridHelper args={[200, 140, '#1fb8ee', '#0a1a2f']} />
      <gridHelper args={[200, 28, '#16486a', '#0a1222']} position={[0, 0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <circleGeometry args={[125, 96]} />
        <meshStandardMaterial color="#050d1a" roughness={0.25} metalness={0.35} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
