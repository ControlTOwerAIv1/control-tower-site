'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { getZoneVisibility } from '@/lib/zones'

type Zone1OverlayProps = {
  progress: number
  onJumpToZone: (zoneIndex: number) => void
}

export default function Zone1Overlay({ progress, onJumpToZone }: Zone1OverlayProps) {
  const opacity = getZoneVisibility(progress, 1)

  return (
    <motion.section
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-end px-6 md:px-16"
      initial={false}
      animate={{ y: opacity > 0.35 ? 0 : 34 }}
      transition={{ duration: 0.4 }}
    >
      <div className="pointer-events-auto max-w-2xl rounded-3xl border border-cyan/30 bg-[var(--panel)] p-6 md:p-9 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <p className="font-mono text-[11px] tracking-[0.45em] text-cyan/95">CONTROL TOWER</p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.03] md:text-6xl">
          Your business,
          <span className="block text-cyan">always in view.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/78 md:text-base">
          AI-powered operations intelligence that watches every process, flags what needs attention, and automates what can be automated.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-md border border-cyan/45 bg-gradient-to-r from-cyan/20 to-cyan/5 px-5 py-2.5 font-mono text-xs tracking-[0.22em] text-cyan transition hover:from-cyan/30 hover:to-cyan/10"
          >
            GET STARTED
          </Link>
          <button
            onClick={() => onJumpToZone(2)}
            className="rounded-md border border-white/25 px-5 py-2.5 font-mono text-xs tracking-[0.22em] text-white/85 transition hover:border-white/40 hover:bg-white/5"
          >
            LEARN MORE
          </button>
        </div>
      </div>
    </motion.section>
  )
}
