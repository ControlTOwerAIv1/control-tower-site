'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { getZoneVisibility } from '@/lib/zones'

type Zone6OverlayProps = { progress: number }

const studies = [
  'Logistics company: reduced invoice processing time by 70%',
  'SaaS startup: automated lead routing, 3x faster response',
  'Retail chain: real-time inventory alerts, 0 stockouts in 6 months',
]

export default function Zone6Overlay({ progress }: Zone6OverlayProps) {
  const opacity = getZoneVisibility(progress, 6)

  return (
    <motion.section
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-end px-6 md:px-16"
      initial={false}
      animate={{ y: opacity > 0.3 ? 0 : 30 }}
      transition={{ duration: 0.38 }}
    >
      <div className="overlay-panel w-full max-w-xl rounded-2xl p-6">
        <h2 className="overlay-title text-2xl font-semibold">Case Studies</h2>
        <div className="mt-4 grid gap-3">
          {studies.map((study, i) => (
            <motion.div
              key={study}
              initial={false}
              animate={{ opacity: opacity > 0.3 ? 1 : 0.35, y: opacity > 0.3 ? 0 : 14 + i * 2 }}
              className="overlay-body rounded border border-white/15 bg-black/35 p-3 text-sm"
            >
              {study}
            </motion.div>
          ))}
        </div>
        <Link href="/contact" className="pointer-events-auto mt-5 inline-block text-sm text-cyan">
          View all
        </Link>
      </div>
    </motion.section>
  )
}
