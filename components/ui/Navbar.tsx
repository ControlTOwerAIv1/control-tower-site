'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToZone = (zoneIndex: number) => {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight
    const zoneStart = (zoneIndex / 8) * pageHeight
    window.scrollTo({ top: zoneStart, behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'bg-navy/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <Link href="/" className="text-cyan font-mono text-sm tracking-widest uppercase">
        Control Tower
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => scrollToZone(2)}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          How It Works
        </button>
        <button
          onClick={() => scrollToZone(3)}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Services
        </button>
        <button
          onClick={() => scrollToZone(6)}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Team
        </button>
        <Link
          href="/contact"
          className="px-4 py-2 border border-cyan/40 text-cyan font-mono text-xs tracking-wider hover:bg-cyan/10 transition-colors rounded"
        >
          Contact
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white/60 hover:text-white"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className="font-mono text-lg">{menuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-navy/95 backdrop-blur-md border-b border-white/5 flex flex-col p-6 gap-4 md:hidden">
          <button onClick={() => scrollToZone(2)} className="text-white/70 text-sm text-left">
            How It Works
          </button>
          <button onClick={() => scrollToZone(3)} className="text-white/70 text-sm text-left">
            Services
          </button>
          <button onClick={() => scrollToZone(6)} className="text-white/70 text-sm text-left">
            Team
          </button>
          <Link href="/contact" className="text-cyan font-mono text-sm">
            Contact
          </Link>
        </div>
      )}
    </nav>
  )
}
