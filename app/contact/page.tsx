'use client'

import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
import ParticleField from '@/components/canvas/shared/ParticleField'
import ContactForm from '@/components/contact/ContactForm'

function ContactBackground() {
  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 50 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 6, 6]} intensity={1.2} color="#00c8ff" />
      <ParticleField count={220} spread={80} />
    </Canvas>
  )
}

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#030710] via-[#040b16] to-[#071325]" />
      <div className="fixed inset-0 -z-10 opacity-80">
        <ContactBackground />
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pb-16">
        <Link href="/" className="inline-flex w-fit rounded border border-white/20 px-3 py-2 text-xs text-white/80">
          Back to home
        </Link>
        <ContactForm />
      </section>
    </main>
  )
}
