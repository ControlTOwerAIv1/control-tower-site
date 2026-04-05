'use client'

import { motion } from 'framer-motion'
import { getZoneVisibility } from '@/lib/zones'

type Zone7OverlayProps = { progress: number }

const team = [
  { name: 'Salman Anis', role: 'Founder & Ops Architect' },
  { name: 'Saima', role: 'Senior Software / AI Engineer' },
  { name: 'Jafar Beldar', role: 'AI / Automation Egnineer' },
  { name: 'Pristin Varghese', role: 'AI / Automation Engineer' },
]

export default function Zone7Overlay({ progress }: Zone7OverlayProps) {
  const opacity = getZoneVisibility(progress, 7)

  return (
    <motion.section
      style={{ opacity }}
      className="absolute inset-0 flex items-center justify-end px-6 md:px-16"
      initial={false}
      animate={{ y: opacity > 0.3 ? 0 : 30 }}
      transition={{ duration: 0.38 }}
    >
      <div className="overlay-panel w-full max-w-xl rounded-2xl p-5">
        <h2 className="overlay-title text-2xl font-semibold">Team</h2>
        <div className="mt-4 grid gap-3">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={false}
              animate={{ opacity: opacity > 0.3 ? 1 : 0.35, y: opacity > 0.3 ? 0 : 12 + i * 2 }}
              className="rounded border border-white/15 bg-black/35 p-3"
            >
              <p className="font-semibold text-cyan">{member.name}</p>
              <p className="overlay-body text-sm">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
