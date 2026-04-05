'use client'

import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from '@/components/canvas/Scene'
import ZoneOverlays from '@/components/overlay/ZoneOverlays'
import ScrollHint from '@/components/ui/ScrollHint'
import { useScrollStore } from '@/store/scroll'

const TOTAL_ZONES = 8

function MobileFallback() {
  return (
    <main className="relative z-10 pt-24">
      <section className="mx-auto max-w-5xl px-5 pb-8">
        <div className="rounded-3xl border border-cyan/25 bg-gradient-to-br from-[#061326] via-[#071a2e] to-[#0a2742] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <p className="font-mono text-xs tracking-[0.3em] text-cyan">CONTROL TOWER</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Your business,
            <span className="block text-cyan">always in view.</span>
          </h1>
          <p className="mt-3 text-sm text-white/80">
            Mobile mode uses a lightweight preview to keep performance smooth while preserving all key content.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-20">
        {[
          'What We Do',
          'How It Works',
          'Services',
          'Why Us',
          'Case Studies',
          'Team',
          'Contact',
        ].map((title, i) => (
          <article key={title} className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-5">
            <p className="font-mono text-xs tracking-[0.22em] text-cyan/80">ZONE {i + 2}</p>
            <h2 className="mt-2 text-xl font-semibold">{title}</h2>
          </article>
        ))}
      </section>
    </main>
  )
}

export default function Home() {
  const setProgress = useScrollStore((state) => state.setProgress)
  const progress = useScrollStore((state) => state.progress)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const next = max > 0 ? window.scrollY / max : 0

      // At the end of the experience, show the landing city overview again
      // without rewinding the scroll position through every intermediate zone.
      setProgress(next >= 0.995 ? 0 : Math.max(0, Math.min(1, next)))
    }

    updateSize()
    updateProgress()
    window.addEventListener('resize', updateSize)
    window.addEventListener('scroll', updateProgress, { passive: true })

    return () => {
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('scroll', updateProgress)
    }
  }, [setProgress])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const zone = params.get('zone')
    if (!zone) return
    const zoneIndex = Number(zone)
    if (Number.isNaN(zoneIndex)) return
    const max = document.documentElement.scrollHeight - window.innerHeight
    const top = (Math.max(0, Math.min(TOTAL_ZONES - 1, zoneIndex)) / TOTAL_ZONES) * max
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const jumpToZone = (zoneIndex: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const top = (Math.max(0, Math.min(TOTAL_ZONES - 1, zoneIndex)) / TOTAL_ZONES) * max
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const cameraPosition = useMemo<[number, number, number]>(() => [0, 3, 10], [])

  if (isMobile) {
    return <MobileFallback />
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_20%_20%,rgba(0,200,255,0.14),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(0,255,136,0.1),transparent_20%)]" />
      <div className="fixed inset-0">
        <Canvas camera={{ position: cameraPosition, fov: 45 }} dpr={[1, 1.75]} shadows gl={{ antialias: true }}>
          <Scene />
        </Canvas>
      </div>

      <ZoneOverlays progress={progress} onJumpToZone={jumpToZone} />
      <ScrollHint progress={progress} />

      <div className="relative z-0 h-[840vh]" aria-hidden />
    </main>
  )
}
