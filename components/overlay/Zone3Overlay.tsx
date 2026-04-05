'use client'

import { motion } from 'framer-motion'
import { getZoneVisibility } from '@/lib/zones'

type Zone3OverlayProps = { progress: number }

const labels = [
  'Identify',
  'Analyse',
  'Automate',
  'Monitor',
  'Watch',
  'Detect',
  'Suggest',
  'Act',
]

export default function Zone3Overlay({ progress }: Zone3OverlayProps) {
  const opacity = getZoneVisibility(progress, 3)
  const serviceLayer = labels.slice(0, 4)
  const intelligenceLayer = labels.slice(4)

  return (
    <motion.section
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-end px-6 md:px-16"
      initial={false}
      animate={{ y: opacity > 0.3 ? 0 : 30 }}
      transition={{ duration: 0.38 }}
    >
      <div className="overlay-panel w-full max-w-xl rounded-2xl p-5 md:p-7">
        <h2 className="overlay-title text-2xl font-semibold md:text-3xl">How It Works</h2>
        <p className="mt-1 font-mono text-[11px] tracking-[0.24em] text-cyan/80">SERVICE LAYER</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:gap-3 md:text-sm">
          {serviceLayer.map((label, i) => (
            <motion.div
              key={label}
              initial={false}
              animate={{ opacity: opacity > 0.3 ? 1 : 0.3, y: opacity > 0.3 ? 0 : 16 + i * 3 }}
              className="overlay-body rounded-md border border-white/15 bg-black/35 px-3 py-2"
            >
              {i + 1}. {label}
            </motion.div>
          ))}
        </div>

        <p className="mt-5 font-mono text-[11px] tracking-[0.24em] text-cyan/80">AI INTELLIGENCE LAYER</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:gap-3 md:text-sm">
          {intelligenceLayer.map((label, i) => (
            <motion.div
              key={label}
              initial={false}
              animate={{ opacity: opacity > 0.3 ? 1 : 0.3, y: opacity > 0.3 ? 0 : 16 + i * 3 }}
              className="overlay-body rounded-md border border-white/15 bg-black/35 px-3 py-2"
            >
              {i + 5}. {label}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
