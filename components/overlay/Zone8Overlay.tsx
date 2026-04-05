'use client'

import Link from 'next/link'

type Zone8OverlayProps = { progress: number }

function visibility(progress: number, zoneIndex: number) {
  const center = (zoneIndex + 0.5) / 8
  const distance = Math.abs(progress - center)
  return Math.max(0, 1 - distance * 8)
}

export default function Zone8Overlay({ progress }: Zone8OverlayProps) {
  const opacity = visibility(progress, 7)

  return (
    <section style={{ opacity }} className="absolute inset-0 flex items-center justify-center px-6">
      <div className="overlay-panel rounded-3xl p-8 text-center md:p-12">
        <h2 className="overlay-title text-3xl font-semibold md:text-5xl">Ready to take control?</h2>
        <p className="overlay-body mt-3">Bring visibility, intelligence, and automation into one control layer.</p>
        <Link
          href="/contact"
          className="pointer-events-auto mt-6 inline-block rounded-md border border-cyan/45 bg-gradient-to-r from-cyan/20 to-cyan/8 px-5 py-3 font-mono text-xs tracking-[0.25em] text-cyan transition hover:from-cyan/30 hover:to-cyan/15"
        >
          LETS TALK
        </Link>
      </div>
    </section>
  )
}
