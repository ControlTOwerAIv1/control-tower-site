'use client'

import { motion } from 'framer-motion'
import { getZoneVisibility } from '@/lib/zones'

type Zone2OverlayProps = { progress: number }

export default function Zone2Overlay({ progress }: Zone2OverlayProps) {
  const opacity = getZoneVisibility(progress, 2)

  return (
    <motion.section
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-end px-6 md:px-16"
      initial={false}
      animate={{ y: opacity > 0.3 ? 0 : 30 }}
      transition={{ duration: 0.38 }}
    >
      <div className="overlay-panel max-w-xl rounded-2xl p-6 md:p-7">
        <h2 className="overlay-title text-2xl font-semibold md:text-3xl">What We Do</h2>
        <p className="overlay-body mt-3 text-sm md:text-base">
          Control Tower watches every operation in your business, surfaces what needs attention, suggests what to do, and automates what it can.
        </p>
      </div>
    </motion.section>
  )
}
