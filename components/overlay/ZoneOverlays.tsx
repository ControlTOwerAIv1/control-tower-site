'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Zone1Overlay from '@/components/overlay/Zone1Overlay'
import Zone2Overlay from '@/components/overlay/Zone2Overlay'
import Zone3Overlay from '@/components/overlay/Zone3Overlay'
import Zone4Overlay from '@/components/overlay/Zone4Overlay'
import Zone5Overlay from '@/components/overlay/Zone5Overlay'
import Zone6Overlay from '@/components/overlay/Zone6Overlay'
import Zone7Overlay from '@/components/overlay/Zone7Overlay'
import { getZoneIndex } from '@/lib/zones'

type ZoneOverlaysProps = {
  progress: number
  onJumpToZone: (zoneIndex: number) => void
}

export default function ZoneOverlays({ progress, onJumpToZone }: ZoneOverlaysProps) {
  const zoneIndex = getZoneIndex(progress)

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={zoneIndex}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.32 }}
          className="h-full w-full"
        >
          {zoneIndex === 0 && (
            <section className="absolute inset-0 flex items-start justify-center px-6 pt-24">
              <div className="overlay-panel rounded-2xl px-5 py-3 text-center">
                <p className="font-mono text-[11px] tracking-[0.28em] text-cyan/90">CONTROL TOWER AI</p>
              </div>
            </section>
          )}
          {zoneIndex === 1 && <Zone1Overlay progress={progress} onJumpToZone={onJumpToZone} />}
          {zoneIndex === 2 && <Zone2Overlay progress={progress} />}
          {zoneIndex === 3 && <Zone3Overlay progress={progress} />}
          {zoneIndex === 4 && <Zone4Overlay progress={progress} />}
          {zoneIndex === 5 && <Zone5Overlay progress={progress} />}
          {zoneIndex === 6 && <Zone6Overlay progress={progress} />}
          {zoneIndex === 7 && <Zone7Overlay progress={progress} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
