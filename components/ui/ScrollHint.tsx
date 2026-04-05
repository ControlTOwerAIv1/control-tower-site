'use client'

type ScrollHintProps = {
  progress: number
}

export default function ScrollHint({ progress }: ScrollHintProps) {
  void progress

  return (
    <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
      <p className="font-mono text-xs tracking-[0.35em] text-cyan/80 animate-pulse">
        SCROLL DOWN
      </p>
    </div>
  )
}
