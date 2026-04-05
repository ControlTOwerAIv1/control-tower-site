'use client'

import { ContactShadows, Environment, Preload } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useRef } from 'react'
import * as THREE from 'three'
import ScrollCamera from '@/components/canvas/ScrollCamera'
import ParticleField from '@/components/canvas/shared/ParticleField'
import GridFloor from '@/components/canvas/shared/GridFloor'
import Zone1Hero from '@/components/canvas/zones/Zone1Hero'
import Zone2WhatWeDo from './zones/Zone2WhatWeDo'
import Zone3HowItWorks from '@/components/canvas/zones/Zone3HowItWorks'
import Zone4Services from '@/components/canvas/zones/Zone4Services'
import Zone5WhyUs from '@/components/canvas/zones/Zone5WhyUs'
import Zone6CaseStudies from '@/components/canvas/zones/Zone6CaseStudies'
import Zone7Team from '@/components/canvas/zones/Zone7Team'
import Zone8CTA from '@/components/canvas/zones/Zone8CTA'

function Atmosphere() {
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ringA.current) {
      ringA.current.rotation.x = Math.PI / 2
      ringA.current.rotation.z = clock.elapsedTime * 0.08
    }
    if (ringB.current) {
      ringB.current.rotation.x = Math.PI / 2
      ringB.current.rotation.z = -clock.elapsedTime * 0.11
    }
  })

  return (
    <group>
      <mesh ref={ringA} position={[0, 12.2, 0]}>
        <torusGeometry args={[36, 0.05, 12, 120]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.28} transparent opacity={0.42} />
      </mesh>
      <mesh ref={ringB} position={[0, 11.4, 0]}>
        <torusGeometry args={[28, 0.04, 12, 120]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.18} transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={['#03060f', 15, 130]} />
      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#5fc7ff', '#031120', 0.35]} />
      <directionalLight castShadow position={[14, 24, 18]} intensity={1.25} color="#9fddff" shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[0, 9, 4]} intensity={2.0} color="#00c8ff" distance={80} decay={2} />
      <pointLight position={[18, 8, -18]} intensity={0.9} color="#00ff88" distance={140} decay={2} />
      <pointLight position={[-22, 7, 16]} intensity={0.75} color="#ffa000" distance={140} decay={2} />

      <ScrollCamera />
      <ParticleField />
      <GridFloor />
      <Atmosphere />
      <ContactShadows position={[0, -0.01, 2]} opacity={0.5} blur={1.8} scale={26} far={12} color="#000000" />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.32} blur={2.5} scale={260} far={110} color="#000000" />

      <Zone1Hero />
      <Zone2WhatWeDo />
      <Zone3HowItWorks />
      <Zone4Services />
      <Zone5WhyUs />
      <Zone6CaseStudies />
      <Zone7Team />
      <Zone8CTA />

      <Environment preset="night" />

      <EffectComposer>
        <Bloom
          mipmapBlur
          intensity={1.08}
          luminanceThreshold={0.14}
          luminanceSmoothing={0.28}
        />
      </EffectComposer>

      <Preload all />
    </>
  )
}
