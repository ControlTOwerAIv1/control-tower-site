'use client'

import { motion } from 'framer-motion'
import { getZoneVisibility } from '@/lib/zones'

type Zone4OverlayProps = { progress: number }

const services = [
  'Real-Time Operations Monitoring',
  'AI-Powered Anomaly Detection',
  'Intelligent Suggestions and Alerts',
  'Process Automation',
  'Custom Operations Dashboards',
]

export default function Zone4Overlay({ progress }: Zone4OverlayProps) {
  const opacity = getZoneVisibility(progress, 4)

  return (
    <motion.section
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-end px-6 md:px-16"
      initial={false}
      animate={{ y: opacity > 0.3 ? 0 : 30 }}
      transition={{ duration: 0.38 }}
    >
      <div className="overlay-panel w-full max-w-xl rounded-2xl p-5 md:p-7">
        <h2 className="overlay-title text-2xl font-semibold md:text-3xl">Services</h2>
        <div className="mt-4 grid gap-3">
          {services.map((service, i) => (
            <motion.div
              key={service}
              initial={false}
              animate={{ opacity: opacity > 0.3 ? 1 : 0.35, y: opacity > 0.3 ? 0 : 18 + i * 2 }}
              className="group rounded-md border border-white/15 bg-black/35 p-3 text-sm text-white/95 transition hover:-translate-y-0.5 hover:border-cyan/45 hover:bg-black/45"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-cyan/80">SERVICE</p>
              {service}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
