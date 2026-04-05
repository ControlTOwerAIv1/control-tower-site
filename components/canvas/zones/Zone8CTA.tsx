'use client'

export default function Zone8CTA() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 18, 0]}>
        <torusGeometry args={[10, 0.12, 16, 96]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}
