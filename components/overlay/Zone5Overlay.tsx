'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { getZoneVisibility } from '@/lib/zones'

type Zone5OverlayProps = { progress: number }

function lerp(start: number, end: number, t: number) {
  return Math.round(start + (end - start) * Math.max(0, Math.min(1, t)))
}

export default function Zone5Overlay({ progress }: Zone5OverlayProps) {
  const opacity = getZoneVisibility(progress, 5)
  const local = Math.max(0, Math.min(1, (progress - 5 / 8) * 8))

  const stats = useMemo(
    () => [
      { value: `${lerp(0, 94, local)}%`, label: 'Average efficiency improvement' },
      { value: `${lerp(1, 3, local)}x`, label: 'Faster process cycle times' },
      { value: `${lerp(0, 12, local)}`, label: 'Industries served' },
      { value: `${lerp(0, 48, local)}hr`, label: 'Average time-to-automation' },
    ],
    [local],
  )

  return (
    <motion.section
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-end px-6 md:px-16"
      initial={false}
      animate={{ y: opacity > 0.3 ? 0 : 30 }}
      transition={{ duration: 0.38 }}
    >
      <div className="overlay-panel w-full max-w-xl rounded-2xl p-6">
        <h2 className="overlay-title text-2xl font-semibold">Why Teams Choose Control Tower</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={false}
              animate={{ opacity: opacity > 0.3 ? 1 : 0.35, y: opacity > 0.3 ? 0 : 14 + i * 2 }}
              className="rounded border border-white/15 bg-black/35 p-3"
            >
              <div className="text-2xl font-semibold text-cyan">{stat.value}</div>
              <div className="overlay-body mt-1 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
