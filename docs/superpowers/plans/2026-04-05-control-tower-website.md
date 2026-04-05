# Control Tower Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Control Tower MVP showcase website — a full-immersive 3D animated Next.js site where scrolling moves a camera through 8 zones of a single Three.js world.

**Architecture:** One persistent `<Canvas>` fixed to the viewport. The page body is `800vh` tall. A Zustand store holds normalised scroll progress `[0, 1]`. A `ScrollCamera` component inside the canvas reads that store every frame and lerps the camera to the target position for the current zone. HTML overlays are absolutely positioned divs driven by Framer Motion scroll hooks.

**Tech Stack:** Next.js 14 (App Router), TypeScript, React Three Fiber v8, @react-three/drei v9, Zustand v4, Framer Motion v11, Tailwind CSS v3, Vitest + @testing-library/react.

---

## File Map

```
app/
  layout.tsx              Root layout — wraps everything, mounts Navbar
  page.tsx                Homepage — 800vh scroll container + canvas + overlays
  globals.css             Tailwind directives + CSS custom properties
  contact/
    page.tsx              Contact page — particle background + form

components/
  canvas/
    Scene.tsx             R3F scene root — mounts all zone 3D objects + ScrollCamera
    ScrollCamera.tsx      Reads scroll store, lerps camera each frame
    shared/
      ParticleField.tsx   Ambient floating particle system (used everywhere)
      GridFloor.tsx       Perspective grid plane
      GlowMesh.tsx        Reusable glowing sphere/box primitive
      LightBeam.tsx       Animated line between two points
    zones/
      Zone1Hero.tsx       Low-poly boy + massive screen 3D assembly
      Zone2WhatWeDo.tsx   Control tower building + orbiting nodes
      Zone3HowItWorks.tsx 8-node process flow graph
      Zone4Services.tsx   5 floating 3D service cards
      Zone5WhyUs.tsx      3D bar columns + stat spheres
      Zone6CaseStudies.tsx 3 holographic tilted panels
      Zone7Team.tsx       Orbiting team orbs (click to expand)
      Zone8CTA.tsx        No new geometry — full-scene visible at this camera pos

  overlay/
    ZoneOverlays.tsx      Mounts all overlays, passes scroll progress
    Zone1Overlay.tsx      Hero text + two CTAs
    Zone2Overlay.tsx      "What We Do" copy
    Zone3Overlay.tsx      Step labels beside nodes
    Zone4Overlay.tsx      Service card labels
    Zone5Overlay.tsx      Counting stat numbers
    Zone6Overlay.tsx      Case study panel text
    Zone7Overlay.tsx      Team name cards
    Zone8Overlay.tsx      "Ready to take control?" CTA

  ui/
    Navbar.tsx            Fixed top nav — frosted on scroll, hamburger on mobile
    ScrollHint.tsx        "SCROLL ↓" indicator

  contact/
    ContactForm.tsx       Name/Company/Email/Message form → Formspree

lib/
  colors.ts               Colour constants (CYAN, AMBER, GREEN, NAVY, etc.)
  zones.ts                Zone definitions: scroll ranges + camera positions

store/
  scroll.ts               Zustand store: { progress: number, setProgress: fn }

hooks/
  useScrollZone.ts        Returns { zoneIndex, zoneProgress } for current scroll pos

__tests__/
  hooks/
    useScrollZone.test.ts
  lib/
    zones.test.ts
  components/
    Navbar.test.tsx
    ContactForm.test.tsx
    Zone1Overlay.test.tsx
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json` (via npx)
- Create: `tailwind.config.ts`
- Create: `app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd "c:/Users/belda/OneDrive/Desktop/CT"
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
```

When prompted, accept all defaults.

- [ ] **Step 2: Install 3D + animation + state dependencies**

```bash
npm install three @react-three/fiber @react-three/drei zustand framer-motion
npm install -D @types/three vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Update globals.css with design tokens**

Replace the contents of `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --cyan: #00c8ff;
  --green: #00ff88;
  --amber: #ffa000;
  --navy: #04080f;
  --navy-mid: #060b14;
}

html {
  background: var(--navy);
  color: white;
}

* {
  box-sizing: border-box;
}

/* Prevent body scroll on mobile when canvas is active */
body {
  overflow-x: hidden;
}
```

- [ ] **Step 6: Update tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: '#00c8ff',
        green: '#00ff88',
        amber: '#ffa000',
        navy: '#04080f',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}

export default config
```

- [ ] **Step 7: Verify setup compiles**

```bash
npm run build
```

Expected: build succeeds (may have unused file warnings — ignore).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with R3F, Zustand, Framer Motion"
```

---

## Task 2: Colour Constants + Zone Definitions

**Files:**
- Create: `lib/colors.ts`
- Create: `lib/zones.ts`
- Create: `__tests__/lib/zones.test.ts`

- [ ] **Step 1: Write failing tests for zone logic**

Create `__tests__/lib/zones.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getZoneIndex, getZoneProgress, ZONES, TOTAL_ZONES } from '@/lib/zones'

describe('getZoneIndex', () => {
  it('returns 0 at scroll progress 0', () => {
    expect(getZoneIndex(0)).toBe(0)
  })
  it('returns 7 at scroll progress 1', () => {
    expect(getZoneIndex(1)).toBe(7)
  })
  it('returns 3 at the midpoint of zone 3', () => {
    // Zone 3 midpoint: (3 + 0.5) / 8 = 0.4375
    expect(getZoneIndex(0.4375)).toBe(3)
  })
})

describe('getZoneProgress', () => {
  it('returns 0 at the start of zone 0', () => {
    expect(getZoneProgress(0, 0)).toBeCloseTo(0)
  })
  it('returns 1 at the end of zone 0', () => {
    // End of zone 0 = 1/8 = 0.125
    expect(getZoneProgress(0.125, 0)).toBeCloseTo(1)
  })
  it('returns 0.5 at the midpoint of zone 4', () => {
    // Zone 4 midpoint = (4 + 0.5) / 8 = 0.5625
    expect(getZoneProgress(0.5625, 4)).toBeCloseTo(0.5)
  })
  it('clamps to 0 when scroll is before zone', () => {
    expect(getZoneProgress(0, 5)).toBe(0)
  })
  it('clamps to 1 when scroll is past zone', () => {
    expect(getZoneProgress(1, 0)).toBe(1)
  })
})

describe('ZONES', () => {
  it('has 8 zones', () => {
    expect(ZONES).toHaveLength(8)
  })
  it('every zone has a camera position and lookAt', () => {
    ZONES.forEach(z => {
      expect(z.camera.position).toHaveLength(3)
      expect(z.camera.lookAt).toHaveLength(3)
    })
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- __tests__/lib/zones.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/zones'`

- [ ] **Step 3: Create lib/colors.ts**

```typescript
export const COLORS = {
  CYAN: '#00c8ff',
  CYAN_DIM: 'rgba(0, 200, 255, 0.3)',
  GREEN: '#00ff88',
  AMBER: '#ffa000',
  NAVY: '#04080f',
  NAVY_MID: '#060b14',
  WHITE: '#ffffff',
} as const

// Three.js numeric colours (pass to `color` prop on meshes)
export const COLOR3 = {
  CYAN: 0x00c8ff,
  GREEN: 0x00ff88,
  AMBER: 0xffa000,
  NAVY: 0x04080f,
  WHITE: 0xffffff,
} as const
```

- [ ] **Step 4: Create lib/zones.ts**

```typescript
import * as THREE from 'three'

export const TOTAL_ZONES = 8

export interface ZoneDefinition {
  id: number
  name: string
  navLabel?: string  // present on zones that are nav targets
  camera: {
    position: [number, number, number]
    lookAt: [number, number, number]
  }
}

export const ZONES: ZoneDefinition[] = [
  {
    id: 0,
    name: 'Hero',
    camera: { position: [0, 3, 9], lookAt: [-1, 1, 0] },
  },
  {
    id: 1,
    name: 'What We Do',
    camera: { position: [0, 8, 22], lookAt: [0, 3, 0] },
  },
  {
    id: 2,
    name: 'How It Works',
    navLabel: 'How It Works',
    camera: { position: [0, 4, 5], lookAt: [0, 2, -10] },
  },
  {
    id: 3,
    name: 'Services',
    navLabel: 'Services',
    camera: { position: [18, 4, 8], lookAt: [18, 2, 0] },
  },
  {
    id: 4,
    name: 'Why Us',
    camera: { position: [30, 5, 10], lookAt: [28, 2, 0] },
  },
  {
    id: 5,
    name: 'Case Studies',
    camera: { position: [42, 4, 8], lookAt: [42, 2, 0] },
  },
  {
    id: 6,
    name: 'Team',
    navLabel: 'Team',
    camera: { position: [55, 4, 8], lookAt: [55, 2, 0] },
  },
  {
    id: 7,
    name: 'Contact CTA',
    navLabel: 'Contact',
    camera: { position: [0, 30, 60], lookAt: [0, 0, 0] },
  },
]

/** Normalised scroll progress [0, 1] → zone index [0, 7] */
export function getZoneIndex(scrollProgress: number): number {
  const raw = Math.floor(scrollProgress * TOTAL_ZONES)
  return Math.min(raw, TOTAL_ZONES - 1)
}

/** Normalised progress [0, 1] within a specific zone */
export function getZoneProgress(scrollProgress: number, zoneId: number): number {
  const zoneSize = 1 / TOTAL_ZONES
  const zoneStart = zoneId * zoneSize
  const raw = (scrollProgress - zoneStart) / zoneSize
  return Math.max(0, Math.min(1, raw))
}

/** Get interpolated camera position between two zones */
export function interpolateCameraPosition(
  scrollProgress: number
): { position: THREE.Vector3; lookAt: THREE.Vector3 } {
  const rawZone = scrollProgress * TOTAL_ZONES
  const fromIndex = Math.min(Math.floor(rawZone), TOTAL_ZONES - 1)
  const toIndex = Math.min(fromIndex + 1, TOTAL_ZONES - 1)
  const t = rawZone - fromIndex

  const from = ZONES[fromIndex].camera
  const to = ZONES[toIndex].camera

  const position = new THREE.Vector3(
    from.position[0] + (to.position[0] - from.position[0]) * t,
    from.position[1] + (to.position[1] - from.position[1]) * t,
    from.position[2] + (to.position[2] - from.position[2]) * t,
  )
  const lookAt = new THREE.Vector3(
    from.lookAt[0] + (to.lookAt[0] - from.lookAt[0]) * t,
    from.lookAt[1] + (to.lookAt[1] - from.lookAt[1]) * t,
    from.lookAt[2] + (to.lookAt[2] - from.lookAt[2]) * t,
  )

  return { position, lookAt }
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm run test:run -- __tests__/lib/zones.test.ts
```

Expected: all 9 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/ __tests__/lib/
git commit -m "feat: add zone definitions and scroll math utilities"
```

---

## Task 3: Scroll Zustand Store + useScrollZone Hook

**Files:**
- Create: `store/scroll.ts`
- Create: `hooks/useScrollZone.ts`
- Create: `__tests__/hooks/useScrollZone.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/hooks/useScrollZone.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollZone } from '@/hooks/useScrollZone'
import { useScrollStore } from '@/store/scroll'

beforeEach(() => {
  useScrollStore.setState({ progress: 0 })
})

describe('useScrollZone', () => {
  it('returns zone 0 at scroll 0', () => {
    const { result } = renderHook(() => useScrollZone())
    expect(result.current.zoneIndex).toBe(0)
    expect(result.current.zoneProgress).toBeCloseTo(0)
  })

  it('returns zone 3 when scroll is at zone 3 midpoint', () => {
    act(() => {
      useScrollStore.setState({ progress: (3 + 0.5) / 8 })
    })
    const { result } = renderHook(() => useScrollZone())
    expect(result.current.zoneIndex).toBe(3)
    expect(result.current.zoneProgress).toBeCloseTo(0.5)
  })

  it('returns zone 7 at scroll 1', () => {
    act(() => {
      useScrollStore.setState({ progress: 1 })
    })
    const { result } = renderHook(() => useScrollZone())
    expect(result.current.zoneIndex).toBe(7)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- __tests__/hooks/useScrollZone.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create store/scroll.ts**

```typescript
import { create } from 'zustand'

interface ScrollState {
  progress: number          // normalised [0, 1]
  setProgress: (p: number) => void
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),
}))
```

- [ ] **Step 4: Create hooks/useScrollZone.ts**

```typescript
import { useScrollStore } from '@/store/scroll'
import { getZoneIndex, getZoneProgress } from '@/lib/zones'

export function useScrollZone() {
  const progress = useScrollStore((s) => s.progress)
  const zoneIndex = getZoneIndex(progress)
  const zoneProgress = getZoneProgress(progress, zoneIndex)
  return { zoneIndex, zoneProgress, progress }
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm run test:run -- __tests__/hooks/useScrollZone.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add store/ hooks/ __tests__/hooks/
git commit -m "feat: scroll state store and useScrollZone hook"
```

---

## Task 4: Root Layout + Navbar

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/ui/Navbar.tsx`
- Create: `__tests__/components/Navbar.test.tsx`

- [ ] **Step 1: Write failing Navbar tests**

Create `__tests__/components/Navbar.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/ui/Navbar'

describe('Navbar', () => {
  it('renders the brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('Control Tower')).toBeInTheDocument()
  })

  it('renders the Contact link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('renders the Services link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- __tests__/components/Navbar.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create components/ui/Navbar.tsx**

```typescript
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
```

- [ ] **Step 4: Update app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Control Tower — Your business, always in view.',
  description:
    'AI-powered operations intelligence. Control Tower watches every process in your business, surfaces what needs attention, and automates what it can.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-navy text-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Run Navbar tests — expect pass**

```bash
npm run test:run -- __tests__/components/Navbar.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/ui/ __tests__/components/Navbar.test.tsx
git commit -m "feat: root layout and navbar with scroll-to-zone navigation"
```

---

## Task 5: Canvas Scene Shell + ScrollCamera

**Files:**
- Create: `components/canvas/ScrollCamera.tsx`
- Create: `components/canvas/Scene.tsx`

- [ ] **Step 1: Create components/canvas/ScrollCamera.tsx**

This component lives inside `<Canvas>` and reads the Zustand scroll store every frame to lerp the camera.

```typescript
'use client'

import { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '@/store/scroll'
import { interpolateCameraPosition } from '@/lib/zones'

const _lookAtVec = new THREE.Vector3()

export default function ScrollCamera() {
  const { camera } = useThree()
  const lerpedPosition = useRef(new THREE.Vector3(0, 3, 9))
  const lerpedLookAt = useRef(new THREE.Vector3(-1, 1, 0))

  useFrame(() => {
    const progress = useScrollStore.getState().progress
    const { position, lookAt } = interpolateCameraPosition(progress)

    // Smooth lerp — 0.05 = slow/cinematic, increase for snappier feel
    lerpedPosition.current.lerp(position, 0.05)
    lerpedLookAt.current.lerp(lookAt, 0.05)

    camera.position.copy(lerpedPosition.current)
    _lookAtVec.copy(lerpedLookAt.current)
    camera.lookAt(_lookAtVec)
  })

  return null
}
```

- [ ] **Step 2: Create components/canvas/Scene.tsx**

```typescript
'use client'

import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import { useState } from 'react'
import ScrollCamera from './ScrollCamera'

export default function Scene() {
  const [dpr, setDpr] = useState<[number, number]>([1, 2])

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 3, 9], fov: 60, near: 0.1, far: 500 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr([1, 1])}
        onIncline={() => setDpr([1, 2])}
      />
      <color attach="background" args={[0x04080f]} />
      <fog attach="fog" args={[0x04080f, 40, 120]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} />
      <ScrollCamera />
      <Preload all />
    </Canvas>
  )
}
```

- [ ] **Step 3: Create app/page.tsx — scroll container + canvas mount**

```typescript
'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useScrollStore } from '@/store/scroll'

// Dynamic import prevents SSR of Three.js
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

const TOTAL_ZONES = 8

export default function HomePage() {
  const setProgress = useScrollStore((s) => s.setProgress)

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      setProgress(window.scrollY / maxScroll)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setProgress])

  return (
    <main>
      {/* Three.js canvas — fixed, full viewport */}
      <Scene />

      {/* Scroll space — gives the page its height so scroll works */}
      <div style={{ height: `${TOTAL_ZONES * 100}vh` }} />
    </main>
  )
}
```

- [ ] **Step 4: Verify dev server runs**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: dark navy page. Scrolling should not throw errors. No 3D objects visible yet (scene is empty).

- [ ] **Step 5: Commit**

```bash
git add components/canvas/ app/page.tsx
git commit -m "feat: canvas shell with scroll-driven camera"
```

---

## Task 6: Shared 3D Primitives — ParticleField + GridFloor

**Files:**
- Create: `components/canvas/shared/ParticleField.tsx`
- Create: `components/canvas/shared/GridFloor.tsx`
- Create: `components/canvas/shared/GlowMesh.tsx`
- Create: `components/canvas/shared/LightBeam.tsx`

- [ ] **Step 1: Create components/canvas/shared/ParticleField.tsx**

```typescript
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
  spread?: number
  color?: number
  size?: number
}

export default function ParticleField({
  count = 800,
  spread = 60,
  color = 0x00c8ff,
  size = 0.04,
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * (spread * 0.5)
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread
      velocities[i] = 0.002 + Math.random() * 0.003
    }
    return { positions, velocities }
  }, [count, spread])

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += velocities[i]
      if (pos[i * 3 + 1] > spread * 0.25) {
        pos[i * 3 + 1] = -spread * 0.25
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
```

- [ ] **Step 2: Create components/canvas/shared/GridFloor.tsx**

```typescript
import { GridHelper } from 'three'
import { useRef } from 'react'
import * as THREE from 'three'

export default function GridFloor() {
  return (
    <group position={[0, -1, 0]} rotation={[0, 0, 0]}>
      <gridHelper
        args={[120, 60, 0x001a33, 0x001a33]}
      />
    </group>
  )
}
```

- [ ] **Step 3: Create components/canvas/shared/GlowMesh.tsx**

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GlowMeshProps {
  position: [number, number, number]
  radius?: number
  color?: number
  pulseSpeed?: number
  intensity?: number
}

export default function GlowMesh({
  position,
  radius = 0.3,
  color = 0x00c8ff,
  pulseSpeed = 1.5,
  intensity = 1,
}: GlowMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.8 + Math.sin(t * pulseSpeed) * 0.2
    if (meshRef.current) {
      meshRef.current.scale.setScalar(pulse)
    }
    if (lightRef.current) {
      lightRef.current.intensity = intensity * pulse
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={intensity}
        distance={radius * 8}
        decay={2}
      />
    </group>
  )
}
```

- [ ] **Step 4: Create components/canvas/shared/LightBeam.tsx**

```typescript
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface LightBeamProps {
  from: [number, number, number]
  to: [number, number, number]
  color?: number
  opacity?: number
  animated?: boolean
}

export default function LightBeam({
  from,
  to,
  color = 0x00c8ff,
  opacity = 0.4,
  animated = false,
}: LightBeamProps) {
  const ref = useRef<THREE.Line>(null)

  const geometry = useMemo(() => {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [from, to])

  useFrame(({ clock }) => {
    if (!animated || !ref.current) return
    const mat = ref.current.material as THREE.LineBasicMaterial
    mat.opacity = opacity * (0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.5)
  })

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </line>
  )
}
```

- [ ] **Step 5: Add shared elements to Scene.tsx**

Modify `components/canvas/Scene.tsx` — add imports and mounts after `<ScrollCamera />`:

```typescript
// Add these imports at top of Scene.tsx
import ParticleField from './shared/ParticleField'
import GridFloor from './shared/GridFloor'

// Add inside <Canvas> after <ScrollCamera />:
<ParticleField />
<GridFloor />
```

- [ ] **Step 6: Verify visually**

```bash
npm run dev
```

Expected: dark scene with small glowing cyan particles floating upward and a subtle grid on the floor.

- [ ] **Step 7: Commit**

```bash
git add components/canvas/shared/
git commit -m "feat: shared 3D primitives — particles, grid floor, glow mesh, light beam"
```

---

## Task 7: Zone 1 — Low-Poly Character + Desk

**Files:**
- Create: `components/canvas/zones/Zone1Hero.tsx`

- [ ] **Step 1: Create components/canvas/zones/Zone1Hero.tsx**

This builds the hero scene: boy at desk (bottom-right) + massive screen (dominant, left-centre).

```typescript
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlowMesh from '../shared/GlowMesh'

// Low-poly boy geometry built from extruded shapes
function LowPolyBoy({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Subtle idle breathing motion
    groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8) * 0.02
  })

  const mat = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: 0x0a2a4a,
        emissive: 0x00c8ff,
        emissiveIntensity: 0.15,
        wireframe: false,
        transparent: true,
        opacity: 0.9,
      }),
    []
  )

  const edgeMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.7 }),
    []
  )

  const parts: { geo: THREE.BufferGeometry; pos: [number, number, number] }[] = useMemo(() => {
    return [
      // Head
      { geo: new THREE.IcosahedronGeometry(0.18, 0), pos: [0, 0.72, 0] },
      // Torso (leaning slightly forward)
      { geo: new THREE.BoxGeometry(0.28, 0.32, 0.18), pos: [0, 0.35, 0] },
      // Left arm — reaching toward screen
      { geo: new THREE.BoxGeometry(0.32, 0.08, 0.08), pos: [-0.28, 0.42, 0] },
      // Right arm — resting on desk
      { geo: new THREE.BoxGeometry(0.28, 0.08, 0.08), pos: [0.24, 0.32, 0] },
      // Upper legs (seated)
      { geo: new THREE.BoxGeometry(0.12, 0.08, 0.22), pos: [-0.07, 0.12, 0.1] },
      { geo: new THREE.BoxGeometry(0.12, 0.08, 0.22), pos: [0.07, 0.12, 0.1] },
    ]
  }, [])

  return (
    <group ref={groupRef} position={position}>
      {parts.map(({ geo, pos }, i) => (
        <group key={i} position={pos}>
          <mesh geometry={geo} material={mat} />
          <lineSegments>
            <edgesGeometry args={[geo]} />
            <primitive object={edgeMat} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

// Desk
function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Desk surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.7]} />
        <meshPhongMaterial color={0x0a1a2e} emissive={0x001122} />
      </mesh>
      {/* Desk legs */}
      {(
        [
          [-0.55, -0.35, -0.3],
          [0.55, -0.35, -0.3],
          [-0.55, -0.35, 0.3],
          [0.55, -0.35, 0.3],
        ] as [number, number, number][]
      ).map((lp, i) => (
        <mesh key={i} position={lp}>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
          <meshPhongMaterial color={0x071525} />
        </mesh>
      ))}
    </group>
  )
}

// Massive screen — a large plane with emissive material
// The "content" panels are handled via HTML overlay in Zone1Overlay
function MassiveScreen({ position }: { position: [number, number, number] }) {
  const screenRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (!glowRef.current) return
    glowRef.current.intensity = 1.5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.3
  })

  return (
    <group position={position}>
      {/* Screen bezel */}
      <mesh>
        <boxGeometry args={[7.2, 4.2, 0.08]} />
        <meshPhongMaterial color={0x050d1a} />
      </mesh>
      {/* Screen surface — emissive glow */}
      <mesh ref={screenRef} position={[0, 0, 0.05]}>
        <planeGeometry args={[7.0, 4.0]} />
        <meshBasicMaterial color={0x000d1f} transparent opacity={0.95} />
      </mesh>
      {/* Screen edge glow */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[7.1, 4.1]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0.05} />
      </mesh>
      {/* Light emanating from screen */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 1]}
        color={0x004488}
        intensity={1.5}
        distance={12}
        decay={2}
      />
    </group>
  )
}

export default function Zone1Hero() {
  return (
    <group>
      {/* Massive screen — centre-left, dominant */}
      <MassiveScreen position={[-1.5, 2.2, -2]} />

      {/* Desk — bottom right */}
      <Desk position={[3.5, 0.18, 0.5]} />

      {/* Boy sitting at desk */}
      <LowPolyBoy position={[3.5, 0.95, 0.5]} />

      {/* Ambient glow nodes floating near screen */}
      <GlowMesh position={[-4, 4, 0]} radius={0.08} color={0x00c8ff} intensity={0.5} />
      <GlowMesh position={[0, 5, -1]} radius={0.06} color={0x00c8ff} intensity={0.3} />
      <GlowMesh position={[-3, 1, 1]} radius={0.05} color={0x00c8ff} intensity={0.2} />
    </group>
  )
}
```

- [ ] **Step 2: Mount Zone1Hero in Scene.tsx**

Add to `components/canvas/Scene.tsx`:

```typescript
import Zone1Hero from './zones/Zone1Hero'

// Inside <Canvas>, after <GridFloor />:
<Zone1Hero />
```

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Expected: A large dark screen shape visible in the scene. Small low-poly geometric figure at desk to the right. Scroll to see camera pull away.

- [ ] **Step 4: Commit**

```bash
git add components/canvas/zones/Zone1Hero.tsx components/canvas/Scene.tsx
git commit -m "feat: zone 1 hero — low-poly character, desk, and massive screen geometry"
```

---

## Task 8: Zone 1 — HTML Overlay (Screen Dashboard + Tagline)

**Files:**
- Create: `components/overlay/Zone1Overlay.tsx`
- Create: `components/overlay/ZoneOverlays.tsx`
- Create: `components/ui/ScrollHint.tsx`
- Create: `__tests__/components/Zone1Overlay.test.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/Zone1Overlay.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Zone1Overlay from '@/components/overlay/Zone1Overlay'

describe('Zone1Overlay', () => {
  it('renders the tagline', () => {
    render(<Zone1Overlay zoneProgress={0} />)
    expect(screen.getByText(/always in view/i)).toBeInTheDocument()
  })

  it('renders the GET STARTED CTA', () => {
    render(<Zone1Overlay zoneProgress={0} />)
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument()
  })

  it('renders the LEARN MORE button', () => {
    render(<Zone1Overlay zoneProgress={0} />)
    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- __tests__/components/Zone1Overlay.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create components/overlay/Zone1Overlay.tsx**

```typescript
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Zone1OverlayProps {
  zoneProgress: number
}

const SCREEN_PANELS = [
  {
    title: 'PROCESS FLOW MAP',
    type: 'nodes',
    nodes: ['Invoice Processing', 'Lead Routing', 'Inventory Check', 'Report Gen'],
  },
  {
    title: 'THROUGHPUT',
    value: '↑ 24.3%',
    type: 'chart',
    bars: [45, 60, 80, 65, 90, 75, 100],
  },
  {
    title: '⚠ ANOMALY DETECTED',
    type: 'alert',
    body: 'Process B-7 latency spike: +340ms',
    action: 'SUGGESTED FIX: REROUTE → APPLY FIX',
    isAlert: true,
  },
  {
    title: 'ACTIVE AUTOMATIONS',
    type: 'progress',
    items: [
      { label: 'Invoice Processing', pct: 85 },
      { label: 'Lead Routing', pct: 100 },
      { label: 'Report Generation', pct: 60 },
    ],
  },
  {
    title: 'EFFICIENCY SCORE',
    type: 'score',
    value: '94%',
    sub: '↑ from 71% before CT',
    positive: true,
  },
]

export default function Zone1Overlay({ zoneProgress }: Zone1OverlayProps) {
  const scrollToZone2 = () => {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: (1 / 8) * pageHeight, behavior: 'smooth' })
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10">

      {/* ── Massive screen dashboard panels (centre-left) ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: '4%', top: '12%', width: '58%', height: '76%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
        {/* Screen top bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan/10 bg-[rgba(0,30,60,0.3)] rounded-t text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="w-2 h-2 rounded-full bg-green" />
            <span className="ml-2 text-cyan/40 tracking-widest">CONTROL TOWER — OPERATIONS OVERVIEW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_6px_#00ff88]" />
            <span className="text-green/60">LIVE</span>
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-3 grid-rows-2 gap-1.5 p-2 h-[calc(100%-28px)]">
          {/* Process flow map — spans 2 rows */}
          <div className="row-span-2 bg-cyan/[0.03] border border-cyan/10 rounded p-2 flex flex-col gap-2">
            <div className="text-cyan/50 font-mono text-[8px] tracking-wider">PROCESS FLOW MAP</div>
            <div className="flex-1 flex flex-col justify-around">
              {['Invoice Processing', 'Lead Routing', 'Inventory Check', 'Report Gen'].map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-cyan/50 bg-cyan/20 flex-shrink-0" />
                  <div className="text-white/40 text-[8px]">{name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Throughput chart */}
          <div className="bg-cyan/[0.03] border border-cyan/10 rounded p-2">
            <div className="text-cyan/50 font-mono text-[8px] mb-1">THROUGHPUT</div>
            <div className="flex items-end gap-0.5 h-10">
              {[45, 60, 80, 65, 90, 75, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-cyan/40 rounded-sm"
                  style={{ height: `${h}%`, boxShadow: h === 100 ? '0 0 4px rgba(0,200,255,0.5)' : undefined }}
                />
              ))}
            </div>
            <div className="text-cyan text-[10px] font-mono mt-1">↑ 24.3%</div>
          </div>

          {/* Anomaly alert */}
          <div className="bg-amber/[0.04] border border-amber/30 rounded p-2">
            <div className="text-amber/70 font-mono text-[8px] mb-1">⚠ ANOMALY DETECTED</div>
            <div className="text-white/50 text-[8px] leading-relaxed">Process B-7 latency spike: +340ms</div>
            <div className="mt-1.5 inline-block bg-amber/15 border border-amber/40 rounded px-1.5 py-0.5 text-amber/80 font-mono text-[7px]">
              APPLY FIX →
            </div>
          </div>

          {/* Active automations */}
          <div className="bg-cyan/[0.03] border border-cyan/10 rounded p-2">
            <div className="text-cyan/50 font-mono text-[8px] mb-1.5">ACTIVE AUTOMATIONS</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Invoice Processing', pct: 85 },
                { label: 'Lead Routing', pct: 100 },
                { label: 'Report Gen', pct: 60 },
              ].map(({ label, pct }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="text-white/40 text-[7px] w-20 truncate">{label}</div>
                  <div className="flex-1 h-1 bg-cyan/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan rounded-full"
                      style={{ width: `${pct}%`, boxShadow: pct === 100 ? '0 0 4px #00c8ff' : undefined }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency score */}
          <div className="bg-green/[0.03] border border-green/15 rounded p-2">
            <div className="text-green/50 font-mono text-[8px] mb-1">EFFICIENCY SCORE</div>
            <div className="text-green text-2xl font-mono font-bold">94<span className="text-sm opacity-60">%</span></div>
            <div className="text-green/40 text-[7px] mt-0.5">↑ from 71% before CT</div>
          </div>
        </div>
      </motion.div>

      {/* ── Tagline + CTAs (top-right) ── */}
      <motion.div
        className="absolute right-6 top-24 max-w-[240px] pointer-events-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-2 opacity-70">
          Control Tower
        </div>
        <h1 className="text-white text-2xl font-bold leading-tight mb-2">
          Your business,<br />always in view.<br />
          <span className="text-cyan/70">Always improving.</span>
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-4">
          AI-powered operations intelligence.<br />
          Watch. Suggest. Automate.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/contact"
            className="px-4 py-2 bg-cyan/15 border border-cyan/40 text-cyan font-mono text-xs tracking-wider hover:bg-cyan/25 transition-colors rounded text-center"
          >
            GET STARTED →
          </Link>
          <button
            onClick={scrollToZone2}
            className="px-4 py-2 border border-white/15 text-white/50 font-mono text-xs tracking-wider hover:text-white/80 hover:border-white/30 transition-colors rounded"
          >
            LEARN MORE
          </button>
        </div>
      </motion.div>

    </div>
  )
}
```

- [ ] **Step 4: Create components/ui/ScrollHint.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'

export default function ScrollHint() {
  return (
    <motion.div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <span className="text-white/25 font-mono text-[9px] tracking-[3px]">SCROLL</span>
      <motion.div
        className="w-px h-8 bg-white/15"
        animate={{ scaleY: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </motion.div>
  )
}
```

- [ ] **Step 5: Create components/overlay/ZoneOverlays.tsx**

```typescript
'use client'

import { useScrollZone } from '@/hooks/useScrollZone'
import Zone1Overlay from './Zone1Overlay'

export default function ZoneOverlays() {
  const { zoneIndex, zoneProgress } = useScrollZone()

  return (
    <>
      {zoneIndex === 0 && <Zone1Overlay zoneProgress={zoneProgress} />}
      {/* Additional zone overlays added in subsequent tasks */}
    </>
  )
}
```

- [ ] **Step 6: Mount overlays + scroll hint in app/page.tsx**

Update `app/page.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useScrollStore } from '@/store/scroll'
import ScrollHint from '@/components/ui/ScrollHint'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })
const ZoneOverlays = dynamic(() => import('@/components/overlay/ZoneOverlays'), { ssr: false })

const TOTAL_ZONES = 8

export default function HomePage() {
  const setProgress = useScrollStore((s) => s.setProgress)

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      setProgress(window.scrollY / maxScroll)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setProgress])

  return (
    <main>
      <Scene />
      <ZoneOverlays />
      <ScrollHint />
      <div style={{ height: `${TOTAL_ZONES * 100}vh` }} />
    </main>
  )
}
```

- [ ] **Step 7: Run Zone1Overlay tests**

```bash
npm run test:run -- __tests__/components/Zone1Overlay.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 8: Verify visually**

```bash
npm run dev
```

Expected: Hero zone shows the operations dashboard overlay on the left, tagline + CTAs on the right. Scroll hint pulses at the bottom.

- [ ] **Step 9: Commit**

```bash
git add components/overlay/ components/ui/ScrollHint.tsx app/page.tsx __tests__/components/Zone1Overlay.test.tsx
git commit -m "feat: zone 1 HTML overlay — dashboard panels, tagline, CTAs"
```

---

## Task 9: Zone 2 — Control Tower Building + "What We Do" Overlay

**Files:**
- Create: `components/canvas/zones/Zone2WhatWeDo.tsx`
- Create: `components/overlay/Zone2Overlay.tsx`

- [ ] **Step 1: Create components/canvas/zones/Zone2WhatWeDo.tsx**

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlowMesh from '../shared/GlowMesh'
import LightBeam from '../shared/LightBeam'

function ControlTowerBuilding() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Very slow rotation
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.05
  })

  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x0a1a2e, emissive: 0x001122 })
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.6 })

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.5, 1, 2.5]} />
        <primitive object={bodyMat} />
      </mesh>
      {/* Mid section */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.8, 2, 1.8]} />
        <primitive object={bodyMat} />
      </mesh>
      {/* Top section */}
      <mesh position={[0, 3.8, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <primitive object={bodyMat} />
      </mesh>
      {/* Control room (top) */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[1.4, 0.6, 1.4]} />
        <meshPhongMaterial color={0x0f2a40} emissive={0x00c8ff} emissiveIntensity={0.2} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 5.8, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
        <meshBasicMaterial color={0x00c8ff} />
      </mesh>
      {/* Antenna tip glow */}
      <GlowMesh position={[0, 6.45, 0]} radius={0.06} color={0x00c8ff} pulseSpeed={2} intensity={1.2} />

      {/* Windows */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 1.8, 0.92]}>
          <planeGeometry args={[0.3, 0.4]} />
          <primitive object={windowMat} />
        </mesh>
      ))}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 3.0, 0.91]}>
          <planeGeometry args={[0.25, 0.35]} />
          <primitive object={windowMat} />
        </mesh>
      ))}
    </group>
  )
}

// Orbiting data nodes around the building
function OrbitingNodes() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.25
  })

  const nodePositions: [number, number, number][] = [
    [5, 2, 0],
    [-5, 3, 0],
    [0, 4, 5],
    [3.5, 1.5, -3.5],
    [-3.5, 2.5, 3.5],
    [0, 1, -5.5],
  ]

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {nodePositions.map((pos, i) => (
        <group key={i}>
          <GlowMesh position={pos} radius={0.12} color={0x00c8ff} intensity={0.6} pulseSpeed={1 + i * 0.2} />
          <LightBeam from={[0, 3, 0]} to={pos} color={0x00c8ff} opacity={0.15} animated />
        </group>
      ))}
    </group>
  )
}

export default function Zone2WhatWeDo() {
  return (
    <group>
      <ControlTowerBuilding />
      <OrbitingNodes />
    </group>
  )
}
```

- [ ] **Step 2: Create components/overlay/Zone2Overlay.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'

interface Zone2OverlayProps {
  zoneProgress: number
}

export default function Zone2Overlay({ zoneProgress }: Zone2OverlayProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-10 pointer-events-none">
      <motion.div
        className="text-center max-w-xl px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-4 opacity-60">
          What We Do
        </div>
        <h2 className="text-white text-4xl font-bold leading-tight mb-5">
          Your AI co-pilot for<br />business operations.
        </h2>
        <p className="text-white/50 text-base leading-relaxed">
          Control Tower watches every operation in your business, 24/7.
          It surfaces what needs attention, suggests what to do, and automates
          what it can. Think of it as an always-on AI analyst sitting at mission control.
        </p>
        <div className="mt-6 flex justify-center gap-8 text-sm font-mono">
          {['Watch', 'Suggest', 'Automate'].map((word, i) => (
            <motion.div
              key={word}
              className="text-cyan/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.2 }}
            >
              {word}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Mount in Scene.tsx and ZoneOverlays.tsx**

In `components/canvas/Scene.tsx`, add:

```typescript
import Zone2WhatWeDo from './zones/Zone2WhatWeDo'

// Inside <Canvas>, after <Zone1Hero />:
<Zone2WhatWeDo />
```

In `components/overlay/ZoneOverlays.tsx`, add:

```typescript
import Zone2Overlay from './Zone2Overlay'

// Inside the return, after Zone1Overlay:
{zoneIndex === 1 && <Zone2Overlay zoneProgress={zoneProgress} />}
```

- [ ] **Step 4: Verify visually**

```bash
npm run dev
```

Scroll to ~12% of page. Expected: camera pulls back, control tower building visible, orbiting nodes circling it, "What We Do" text centred on screen.

- [ ] **Step 5: Commit**

```bash
git add components/canvas/zones/Zone2WhatWeDo.tsx components/overlay/Zone2Overlay.tsx components/canvas/Scene.tsx components/overlay/ZoneOverlays.tsx
git commit -m "feat: zone 2 — control tower building, orbiting nodes, what we do overlay"
```

---

## Task 10: Zone 3 — Process Flow Nodes + "How It Works" Overlay

**Files:**
- Create: `components/canvas/zones/Zone3HowItWorks.tsx`
- Create: `components/overlay/Zone3Overlay.tsx`

- [ ] **Step 1: Create components/canvas/zones/Zone3HowItWorks.tsx**

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlowMesh from '../shared/GlowMesh'
import LightBeam from '../shared/LightBeam'

const SERVICE_NODES: { pos: [number, number, number]; color: number }[] = [
  { pos: [-6, 4, -12], color: 0x00c8ff },
  { pos: [-2, 4, -12], color: 0x00c8ff },
  { pos: [2, 4, -12], color: 0x00c8ff },
  { pos: [6, 4, -12], color: 0x00c8ff },
]

const AI_NODES: { pos: [number, number, number]; color: number }[] = [
  { pos: [-6, 1.5, -12], color: 0x00ff88 },
  { pos: [-2, 1.5, -12], color: 0x00ff88 },
  { pos: [2, 1.5, -12], color: 0x00ff88 },
  { pos: [6, 1.5, -12], color: 0x00ff88 },
]

export default function Zone3HowItWorks() {
  return (
    <group>
      {/* Service layer nodes */}
      {SERVICE_NODES.map((n, i) => (
        <group key={`service-${i}`}>
          <GlowMesh position={n.pos} radius={0.25} color={n.color} intensity={0.8} pulseSpeed={1 + i * 0.3} />
          {i < SERVICE_NODES.length - 1 && (
            <LightBeam
              from={n.pos}
              to={SERVICE_NODES[i + 1].pos}
              color={0x00c8ff}
              opacity={0.3}
              animated
            />
          )}
        </group>
      ))}

      {/* AI layer nodes */}
      {AI_NODES.map((n, i) => (
        <group key={`ai-${i}`}>
          <GlowMesh position={n.pos} radius={0.25} color={n.color} intensity={0.8} pulseSpeed={1.5 + i * 0.3} />
          {i < AI_NODES.length - 1 && (
            <LightBeam
              from={n.pos}
              to={AI_NODES[i + 1].pos}
              color={0x00ff88}
              opacity={0.3}
              animated
            />
          )}
        </group>
      ))}

      {/* Separator beam between rows */}
      <LightBeam from={[-8, 2.75, -12]} to={[8, 2.75, -12]} color={0xffffff} opacity={0.05} />

      {/* Label plane (visual indicator of the 3D space) */}
      <mesh position={[0, 2.75, -12]}>
        <planeGeometry args={[16, 0.01]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0.08} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Create components/overlay/Zone3Overlay.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'

interface Zone3OverlayProps {
  zoneProgress: number
}

const SERVICE_STEPS = [
  { label: 'Identify', desc: 'Map your existing processes' },
  { label: 'Analyse', desc: 'Find inefficiencies with AI' },
  { label: 'Automate', desc: 'Build and deploy automations' },
  { label: 'Monitor', desc: 'Track results in real time' },
]

const AI_STEPS = [
  { label: 'Watch', desc: 'Real-time visibility, every operation' },
  { label: 'Detect', desc: 'AI spots anomalies and patterns' },
  { label: 'Suggest', desc: 'System recommends your next action' },
  { label: 'Act', desc: 'Automate what can be automated' },
]

export default function Zone3Overlay({ zoneProgress }: Zone3OverlayProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-8">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-2 opacity-60">How It Works</div>
          <h2 className="text-white text-3xl font-bold">Two layers. One platform.</h2>
        </div>

        {/* Service layer */}
        <div className="mb-6">
          <div className="text-cyan/50 font-mono text-[9px] tracking-[3px] mb-3 uppercase">Service Layer — how we work with you</div>
          <div className="grid grid-cols-4 gap-3">
            {SERVICE_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                className="bg-white/[0.03] border border-cyan/15 rounded p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-cyan/40 font-mono text-[9px] mb-1">{String(i + 1).padStart(2, '0')}</div>
                <div className="text-white font-semibold text-sm mb-1">{step.label}</div>
                <div className="text-white/40 text-[11px] leading-relaxed">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/5" />
          <div className="text-white/20 font-mono text-[9px] tracking-widest">AI INTELLIGENCE LAYER</div>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* AI layer */}
        <div>
          <div className="text-green/50 font-mono text-[9px] tracking-[3px] mb-3 uppercase">Always-on AI — running continuously</div>
          <div className="grid grid-cols-4 gap-3">
            {AI_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                className="bg-white/[0.03] border border-green/15 rounded p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="text-green/40 font-mono text-[9px] mb-1">{String(i + 5).padStart(2, '0')}</div>
                <div className="text-white font-semibold text-sm mb-1">{step.label}</div>
                <div className="text-white/40 text-[11px] leading-relaxed">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Mount in Scene.tsx and ZoneOverlays.tsx**

`components/canvas/Scene.tsx`:

```typescript
import Zone3HowItWorks from './zones/Zone3HowItWorks'
// Inside <Canvas>:
<Zone3HowItWorks />
```

`components/overlay/ZoneOverlays.tsx`:

```typescript
import Zone3Overlay from './Zone3Overlay'
// Inside return:
{zoneIndex === 2 && <Zone3Overlay zoneProgress={zoneProgress} />}
```

- [ ] **Step 4: Commit**

```bash
git add components/canvas/zones/Zone3HowItWorks.tsx components/overlay/Zone3Overlay.tsx components/canvas/Scene.tsx components/overlay/ZoneOverlays.tsx
git commit -m "feat: zone 3 — process flow nodes and how it works overlay"
```

---

## Task 11: Zone 4 — Floating Service Cards + Overlay

**Files:**
- Create: `components/canvas/zones/Zone4Services.tsx`
- Create: `components/overlay/Zone4Overlay.tsx`

- [ ] **Step 1: Create components/canvas/zones/Zone4Services.tsx**

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CARD_POSITIONS: [number, number, number][] = [
  [10, 3, -2],
  [14, 2.5, -3],
  [18, 3, -2],
  [22, 2.5, -3],
  [26, 3, -2],
]

function ServiceCard({ position, index }: { position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4 + index) * 0.15
    meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.6 + index * 0.8) * 0.1
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[2.4, 3.2, 0.08]} />
      <meshPhongMaterial
        color={0x040d1e}
        emissive={0x00c8ff}
        emissiveIntensity={0.08}
        transparent
        opacity={0.85}
      />
      {/* Card border glow */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.4, 3.2]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0.04} />
      </mesh>
    </mesh>
  )
}

export default function Zone4Services() {
  return (
    <group>
      {CARD_POSITIONS.map((pos, i) => (
        <ServiceCard key={i} position={pos} index={i} />
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Create components/overlay/Zone4Overlay.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'

const SERVICES = [
  {
    icon: '◉',
    name: 'Real-Time Monitoring',
    desc: 'Live visibility into every operation, process, and system across your business.',
  },
  {
    icon: '⬡',
    name: 'Anomaly Detection',
    desc: 'AI automatically spots irregularities, bottlenecks, and failures before they escalate.',
  },
  {
    icon: '◈',
    name: 'Intelligent Suggestions',
    desc: 'The system recommends specific actions — you decide when to act.',
  },
  {
    icon: '▸',
    name: 'Process Automation',
    desc: 'Deploy automations for repeatable tasks. Cut cycle time, reduce errors.',
  },
  {
    icon: '⬕',
    name: 'Custom Dashboards',
    desc: 'Operations intelligence built around your business, your KPIs, your team.',
  },
]

export default function Zone4Overlay({ zoneProgress }: { zoneProgress: number }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-8">
      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-2 opacity-60">Services</div>
          <h2 className="text-white text-3xl font-bold">Everything you need to stay in control.</h2>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.name}
              className="bg-white/[0.03] border border-cyan/15 rounded-lg p-4 hover:border-cyan/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-cyan text-xl mb-3">{service.icon}</div>
              <div className="text-white font-semibold text-sm mb-2 leading-tight">{service.name}</div>
              <div className="text-white/40 text-[11px] leading-relaxed">{service.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Mount in Scene.tsx and ZoneOverlays.tsx**

`Scene.tsx`:

```typescript
import Zone4Services from './zones/Zone4Services'
// Inside <Canvas>:
<Zone4Services />
```

`ZoneOverlays.tsx`:

```typescript
import Zone4Overlay from './Zone4Overlay'
// Inside return:
{zoneIndex === 3 && <Zone4Overlay zoneProgress={zoneProgress} />}
```

- [ ] **Step 4: Commit**

```bash
git add components/canvas/zones/Zone4Services.tsx components/overlay/Zone4Overlay.tsx components/canvas/Scene.tsx components/overlay/ZoneOverlays.tsx
git commit -m "feat: zone 4 — floating service cards and services overlay"
```

---

## Task 12: Zone 5 — Stat Geometry + "Why Us" Overlay

**Files:**
- Create: `components/canvas/zones/Zone5WhyUs.tsx`
- Create: `components/overlay/Zone5Overlay.tsx`

- [ ] **Step 1: Create components/canvas/zones/Zone5WhyUs.tsx**

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlowMesh from '../shared/GlowMesh'

const BAR_DATA = [0.94, 0.72, 0.88, 0.65]

function StatBars() {
  return (
    <group position={[28, 0, -2]}>
      {BAR_DATA.map((height, i) => (
        <group key={i} position={[i * 1.5 - 2.25, 0, 0]}>
          <mesh position={[0, height * 2.5, 0]}>
            <boxGeometry args={[0.8, height * 5, 0.8]} />
            <meshPhongMaterial
              color={0x004466}
              emissive={0x00c8ff}
              emissiveIntensity={0.4 + height * 0.4}
            />
          </mesh>
          <GlowMesh position={[0, height * 5 + 0.3, 0]} radius={0.12} color={0x00c8ff} intensity={height} />
        </group>
      ))}
    </group>
  )
}

function OrbitRing({ radius, y, speed }: { radius: number; y: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = clock.getElapsedTime() * speed
    ref.current.rotation.x = 0.4
  })

  return (
    <mesh ref={ref} position={[32, y, -3]}>
      <torusGeometry args={[radius, 0.02, 8, 48]} />
      <meshBasicMaterial color={0x00c8ff} transparent opacity={0.25} />
    </mesh>
  )
}

export default function Zone5WhyUs() {
  return (
    <group>
      <StatBars />
      <GlowMesh position={[32, 3, -3]} radius={0.6} color={0x00c8ff} intensity={0.8} pulseSpeed={0.8} />
      <OrbitRing radius={1.2} y={3} speed={0.3} />
      <OrbitRing radius={1.8} y={3} speed={-0.2} />
    </group>
  )
}
```

- [ ] **Step 2: Create components/overlay/Zone5Overlay.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const STATS = [
  { value: 94, suffix: '%', label: 'Average efficiency improvement', color: 'text-cyan' },
  { value: 3, suffix: '×', label: 'Faster process cycle times', color: 'text-cyan' },
  { value: 12, suffix: '', label: 'Industries served', color: 'text-green' },
  { value: 48, suffix: 'hr', label: 'Average time to first automation', color: 'text-green' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 40
    const increment = target / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export default function Zone5Overlay({ zoneProgress }: { zoneProgress: number }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-8">
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-2 opacity-60">Why Us</div>
          <h2 className="text-white text-3xl font-bold">Results that speak for themselves.</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`text-5xl font-mono font-bold mb-2 ${stat.color}`}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-white/25 text-xs font-mono mt-6 tracking-wider">
          * PLACEHOLDER STATS — UPDATE WITH REAL DATA BEFORE LAUNCH
        </p>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Mount in Scene.tsx and ZoneOverlays.tsx**

`Scene.tsx`:

```typescript
import Zone5WhyUs from './zones/Zone5WhyUs'
// Inside <Canvas>:
<Zone5WhyUs />
```

`ZoneOverlays.tsx`:

```typescript
import Zone5Overlay from './Zone5Overlay'
// Inside return:
{zoneIndex === 4 && <Zone5Overlay zoneProgress={zoneProgress} />}
```

- [ ] **Step 4: Commit**

```bash
git add components/canvas/zones/Zone5WhyUs.tsx components/overlay/Zone5Overlay.tsx components/canvas/Scene.tsx components/overlay/ZoneOverlays.tsx
git commit -m "feat: zone 5 — stat geometry and why us overlay with count-up animation"
```

---

## Task 13: Zone 6 — Holographic Panels + Case Studies Overlay

**Files:**
- Create: `components/canvas/zones/Zone6CaseStudies.tsx`
- Create: `components/overlay/Zone6Overlay.tsx`

- [ ] **Step 1: Create components/canvas/zones/Zone6CaseStudies.tsx**

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PANEL_CONFIGS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [38, 3, -4], rotY: 0.3 },
  { pos: [42, 3, -2], rotY: 0 },
  { pos: [46, 3, -4], rotY: -0.3 },
]

function HolographicPanel({
  position,
  rotY,
}: {
  position: [number, number, number]
  rotY: number
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + rotY) * 0.15
  })

  return (
    <group ref={ref} position={position} rotation={[0, rotY, 0]}>
      {/* Panel face */}
      <mesh>
        <planeGeometry args={[2.8, 3.6]} />
        <meshBasicMaterial color={0x001a33} transparent opacity={0.7} />
      </mesh>
      {/* Edge glow — top */}
      <mesh position={[0, 1.82, 0]}>
        <planeGeometry args={[2.8, 0.04]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0.8} />
      </mesh>
      {/* Edge glow — bottom */}
      <mesh position={[0, -1.82, 0]}>
        <planeGeometry args={[2.8, 0.04]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0.5} />
      </mesh>
      {/* Edge glow — left */}
      <mesh position={[-1.42, 0, 0]}>
        <planeGeometry args={[0.04, 3.6]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0.5} />
      </mesh>
      {/* Edge glow — right */}
      <mesh position={[1.42, 0, 0]}>
        <planeGeometry args={[0.04, 3.6]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function Zone6CaseStudies() {
  return (
    <group>
      {PANEL_CONFIGS.map((cfg, i) => (
        <HolographicPanel key={i} position={cfg.pos} rotY={cfg.rotY} />
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Create components/overlay/Zone6Overlay.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'

const CASE_STUDIES = [
  {
    industry: '🚚',
    industryLabel: 'Logistics',
    stat: '−70%',
    statLabel: 'invoice processing time',
    outcome: 'Automated end-to-end invoice matching and routing. Zero manual touchpoints.',
  },
  {
    industry: '💻',
    industryLabel: 'SaaS',
    stat: '3×',
    statLabel: 'faster lead response time',
    outcome: 'AI-powered lead scoring and routing triggered instant follow-up workflows.',
  },
  {
    industry: '🛍',
    industryLabel: 'Retail',
    stat: '0',
    statLabel: 'stockouts in 6 months',
    outcome: 'Real-time inventory anomaly detection with automated reorder triggers.',
  },
]

export default function Zone6Overlay({ zoneProgress }: { zoneProgress: number }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-8">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-2 opacity-60">Case Studies</div>
          <h2 className="text-white text-3xl font-bold">Real results for real businesses.</h2>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {CASE_STUDIES.map((cs, i) => (
            <motion.div
              key={cs.industryLabel}
              className="bg-white/[0.03] border border-cyan/15 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-2xl mb-2">{cs.industry}</div>
              <div className="text-cyan/60 font-mono text-[9px] tracking-wider uppercase mb-3">{cs.industryLabel}</div>
              <div className="text-4xl font-mono font-bold text-white mb-1">{cs.stat}</div>
              <div className="text-white/50 text-xs mb-3">{cs.statLabel}</div>
              <div className="text-white/35 text-[11px] leading-relaxed border-t border-white/5 pt-3">
                {cs.outcome}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-5">
          <span className="text-white/25 text-xs font-mono">Placeholder — update with real client stories before launch</span>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Mount in Scene.tsx and ZoneOverlays.tsx**

`Scene.tsx`:

```typescript
import Zone6CaseStudies from './zones/Zone6CaseStudies'
// Inside <Canvas>:
<Zone6CaseStudies />
```

`ZoneOverlays.tsx`:

```typescript
import Zone6Overlay from './Zone6Overlay'
// Inside return:
{zoneIndex === 5 && <Zone6Overlay zoneProgress={zoneProgress} />}
```

- [ ] **Step 4: Commit**

```bash
git add components/canvas/zones/Zone6CaseStudies.tsx components/overlay/Zone6Overlay.tsx components/canvas/Scene.tsx components/overlay/ZoneOverlays.tsx
git commit -m "feat: zone 6 — holographic panels and case studies overlay"
```

---

## Task 14: Zone 7 — Team Orbs + Overlay

**Files:**
- Create: `components/canvas/zones/Zone7Team.tsx`
- Create: `components/overlay/Zone7Overlay.tsx`

- [ ] **Step 1: Create components/canvas/zones/Zone7Team.tsx**

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlowMesh from '../shared/GlowMesh'
import LightBeam from '../shared/LightBeam'

const ORBS: { offset: [number, number, number]; speed: number; radius: number }[] = [
  { offset: [0, 0, 0], speed: 0, radius: 0 },       // centre — lead
  { offset: [3.5, 0.5, 0], speed: 0.4, radius: 3.5 },
  { offset: [-3.5, -0.5, 0], speed: 0.4, radius: 3.5 },
  { offset: [0, 1, -4], speed: 0.3, radius: 4 },
  { offset: [0, -1, 4], speed: 0.3, radius: 4 },
]

const CENTER: [number, number, number] = [55, 3, -3]

export default function Zone7Team() {
  const orbRefs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ORBS.forEach((orb, i) => {
      const ref = orbRefs.current[i]
      if (!ref || i === 0) return
      ref.position.x = CENTER[0] + Math.cos(t * orb.speed) * orb.radius
      ref.position.y = CENTER[1] + orb.offset[1] + Math.sin(t * orb.speed * 1.3) * 0.3
      ref.position.z = CENTER[2] + Math.sin(t * orb.speed) * orb.radius
    })
  })

  return (
    <group>
      {/* Central lead orb */}
      <group ref={(el) => { orbRefs.current[0] = el }} position={CENTER}>
        <GlowMesh position={[0, 0, 0]} radius={0.4} color={0x00c8ff} intensity={1.2} pulseSpeed={0.8} />
      </group>

      {/* Orbiting team orbs */}
      {ORBS.slice(1).map((orb, i) => (
        <group
          key={i}
          ref={(el) => { orbRefs.current[i + 1] = el }}
          position={[CENTER[0] + orb.offset[0], CENTER[1] + orb.offset[1], CENTER[2] + orb.offset[2]]}
        >
          <GlowMesh position={[0, 0, 0]} radius={0.25} color={0x00c8ff} intensity={0.7} pulseSpeed={1 + i * 0.2} />
          <LightBeam from={[0, 0, 0]} to={[CENTER[0] - (CENTER[0] + orb.offset[0]), CENTER[1] - (CENTER[1] + orb.offset[1]), CENTER[2] - (CENTER[2] + orb.offset[2])]} color={0x00c8ff} opacity={0.1} />
        </group>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Create components/overlay/Zone7Overlay.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'

const TEAM = [
  { name: 'Founder & CEO', role: 'Vision, strategy, client partnerships', initials: 'CT' },
  { name: 'Head of AI', role: 'ML models, automation intelligence', initials: 'AI' },
  { name: 'Lead Engineer', role: 'Platform architecture, infrastructure', initials: 'EN' },
  { name: 'Operations Lead', role: 'Client delivery, process analysis', initials: 'OP' },
  { name: 'Product Designer', role: 'UX, dashboards, client-facing tools', initials: 'DS' },
]

export default function Zone7Overlay({ zoneProgress }: { zoneProgress: number }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-8">
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-2 opacity-60">Team</div>
          <h2 className="text-white text-3xl font-bold">The operators behind the tower.</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {TEAM.map((member, i) => (
            <motion.div
              key={i}
              className="bg-white/[0.03] border border-cyan/15 rounded-xl p-5 w-48 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/25 flex items-center justify-center mx-auto mb-3">
                <span className="text-cyan font-mono text-sm font-bold">{member.initials}</span>
              </div>
              <div className="text-white font-semibold text-sm mb-1">{member.name}</div>
              <div className="text-white/40 text-[11px] leading-relaxed">{member.role}</div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-white/20 text-xs font-mono mt-6">
          Placeholder — update with real names before launch
        </p>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Mount in Scene.tsx and ZoneOverlays.tsx**

`Scene.tsx`:

```typescript
import Zone7Team from './zones/Zone7Team'
// Inside <Canvas>:
<Zone7Team />
```

`ZoneOverlays.tsx`:

```typescript
import Zone7Overlay from './Zone7Overlay'
// Inside return:
{zoneIndex === 6 && <Zone7Overlay zoneProgress={zoneProgress} />}
```

- [ ] **Step 4: Commit**

```bash
git add components/canvas/zones/Zone7Team.tsx components/overlay/Zone7Overlay.tsx components/canvas/Scene.tsx components/overlay/ZoneOverlays.tsx
git commit -m "feat: zone 7 — orbiting team orbs and team overlay"
```

---

## Task 15: Zone 8 — Contact CTA Overlay

**Files:**
- Create: `components/overlay/Zone8Overlay.tsx`

No new 3D geometry for zone 8 — the camera pulls back far enough that the full scene is visible.

- [ ] **Step 1: Create components/overlay/Zone8Overlay.tsx**

```typescript
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Zone8Overlay({ zoneProgress }: { zoneProgress: number }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-4 opacity-60">
          Ready?
        </div>
        <h2 className="text-white text-5xl font-bold mb-4 leading-tight">
          Ready to take control?
        </h2>
        <p className="text-white/40 text-lg mb-8 max-w-md mx-auto">
          Let's map your processes, find the inefficiencies, and build automations that actually work.
        </p>
        <Link
          href="/contact"
          className="pointer-events-auto inline-block px-8 py-4 bg-cyan/10 border border-cyan/40 text-cyan font-mono text-sm tracking-widest hover:bg-cyan/20 hover:border-cyan/60 transition-all rounded-lg shadow-[0_0_30px_rgba(0,200,255,0.15)]"
        >
          LET'S TALK →
        </Link>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Mount in ZoneOverlays.tsx**

```typescript
import Zone8Overlay from './Zone8Overlay'
// Inside return:
{zoneIndex === 7 && <Zone8Overlay zoneProgress={zoneProgress} />}
```

- [ ] **Step 3: Commit**

```bash
git add components/overlay/Zone8Overlay.tsx components/overlay/ZoneOverlays.tsx
git commit -m "feat: zone 8 — contact CTA overlay"
```

---

## Task 16: Contact Page

**Files:**
- Create: `app/contact/page.tsx`
- Create: `components/contact/ContactForm.tsx`
- Create: `__tests__/components/ContactForm.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/ContactForm.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ContactForm from '@/components/contact/ContactForm'

describe('ContactForm', () => {
  it('renders all required fields', () => {
    render(<ContactForm />)
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/company/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/message/i)).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    render(<ContactForm />)
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<ContactForm />)
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- __tests__/components/ContactForm.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create components/contact/ContactForm.tsx**

```typescript
'use client'

import { useState } from 'react'

interface FormData {
  name: string
  company: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE_URL ?? ''

export default function ContactForm() {
  const [form, setForm] = useState<FormData>({ name: '', company: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const validate = (): FormErrors => {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.message.trim()) errs.message = 'Message is required'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="text-green text-4xl mb-4">✓</div>
        <h3 className="text-white text-xl font-semibold mb-2">Message sent.</h3>
        <p className="text-white/50">We'll be in touch within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="Company (optional)"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <textarea
          placeholder="Tell us about your business and the processes you want to improve..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors resize-none"
        />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3 bg-cyan/10 border border-cyan/40 text-cyan font-mono text-sm tracking-widest hover:bg-cyan/20 transition-colors rounded-lg disabled:opacity-50"
      >
        {status === 'sending' ? 'SENDING...' : 'SEND MESSAGE →'}
      </button>
      {status === 'error' && (
        <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
```

- [ ] **Step 4: Create app/contact/page.tsx**

```typescript
import dynamic from 'next/dynamic'
import Link from 'next/link'
import ContactForm from '@/components/contact/ContactForm'

const ContactParticles = dynamic(
  () => import('@/components/canvas/Scene').then((mod) => {
    // Lightweight: just the canvas with particles, no zones
    return mod.default
  }),
  { ssr: false }
)

export default function ContactPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center px-6 py-24">
      {/* Minimal particle background */}
      <div className="fixed inset-0 -z-10">
        <ContactParticles />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <Link
          href="/"
          className="inline-block text-white/40 hover:text-white/70 font-mono text-xs tracking-wider mb-8 transition-colors"
        >
          ← Back to Control Tower
        </Link>

        <div className="text-cyan font-mono text-[10px] tracking-[4px] uppercase mb-2 opacity-60">
          Get in Touch
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">Let's talk.</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Tell us about your business and the processes you want to get under control.
          We'll come back with a clear plan.
        </p>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <ContactForm />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Add NEXT_PUBLIC_FORMSPREE_URL to .env.local**

Create `.env.local`:

```
# Get a free endpoint at https://formspree.io
NEXT_PUBLIC_FORMSPREE_URL=https://formspree.io/f/YOUR_FORM_ID
```

Add `.env.local` to `.gitignore` (it should already be there from Next.js scaffold).

- [ ] **Step 6: Run ContactForm tests**

```bash
npm run test:run -- __tests__/components/ContactForm.test.tsx
```

Expected: all 3 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add app/contact/ components/contact/ __tests__/components/ContactForm.test.tsx .env.local
git commit -m "feat: contact page with validated form and Formspree integration"
```

---

## Task 17: Mobile Fallback

**Files:**
- Modify: `app/page.tsx`
- Create: `components/ui/MobileFallback.tsx`

- [ ] **Step 1: Create components/ui/MobileFallback.tsx**

```typescript
import Link from 'next/link'

const SECTIONS = [
  { heading: 'AI-powered operations intelligence', body: 'Control Tower watches every operation in your business, 24/7. It surfaces what needs attention, suggests what to do, and automates what it can.' },
  { heading: 'How it works', body: 'Identify processes → Analyse with AI → Automate → Monitor. Plus an always-on AI layer: Watch → Detect → Suggest → Act.' },
  { heading: 'Our services', body: 'Real-Time Monitoring · Anomaly Detection · Intelligent Suggestions · Process Automation · Custom Dashboards' },
  { heading: 'Results', body: '94% average efficiency improvement · 3× faster cycles · 12 industries served · 48hr to first automation.' },
]

export default function MobileFallback() {
  return (
    <div className="min-h-screen bg-navy px-6 py-24 flex flex-col gap-12">
      <div>
        <div className="text-cyan font-mono text-xs tracking-widest uppercase mb-2 opacity-60">Control Tower</div>
        <h1 className="text-white text-3xl font-bold leading-tight mb-4">
          Your business,<br />always in view.<br />
          <span className="text-cyan/70">Always improving.</span>
        </h1>
        <p className="text-white/50 text-sm leading-relaxed">
          AI-powered operations intelligence. Watch. Suggest. Automate.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/contact"
            className="px-5 py-3 bg-cyan/15 border border-cyan/40 text-cyan font-mono text-sm tracking-wider rounded text-center"
          >
            GET STARTED →
          </Link>
        </div>
      </div>

      {SECTIONS.map((s, i) => (
        <div key={i} className="border-t border-white/5 pt-8">
          <h2 className="text-white font-semibold text-lg mb-3">{s.heading}</h2>
          <p className="text-white/45 text-sm leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add mobile detection to app/page.tsx**

Update `app/page.tsx` to conditionally render mobile fallback:

```typescript
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useScrollStore } from '@/store/scroll'
import ScrollHint from '@/components/ui/ScrollHint'
import MobileFallback from '@/components/ui/MobileFallback'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })
const ZoneOverlays = dynamic(() => import('@/components/overlay/ZoneOverlays'), { ssr: false })

const TOTAL_ZONES = 8

export default function HomePage() {
  const setProgress = useScrollStore((s) => s.setProgress)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) return
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      setProgress(window.scrollY / maxScroll)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setProgress, isMobile])

  if (isMobile) {
    return <MobileFallback />
  }

  return (
    <main>
      <Scene />
      <ZoneOverlays />
      <ScrollHint />
      <div style={{ height: `${TOTAL_ZONES * 100}vh` }} />
    </main>
  )
}
```

- [ ] **Step 3: Verify mobile view**

```bash
npm run dev
```

Open browser DevTools → toggle device toolbar → select a mobile viewport (375px wide). Expected: text-only layout with all content visible. No canvas.

- [ ] **Step 4: Commit**

```bash
git add components/ui/MobileFallback.tsx app/page.tsx
git commit -m "feat: mobile fallback — text-only layout for viewports under 768px"
```

---

## Task 18: Deployment + Final Checks

**Files:**
- Create: `vercel.json`
- Modify: `next.config.js`

- [ ] **Step 1: Update next.config.js for Three.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
}

module.exports = nextConfig
```

- [ ] **Step 2: Create vercel.json**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

- [ ] **Step 3: Run full test suite**

```bash
npm run test:run
```

Expected: all tests PASS. Fix any failures before continuing.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: build succeeds with no errors. Note any warnings.

- [ ] **Step 5: Set up Formspree endpoint**

1. Go to [formspree.io](https://formspree.io), create a free account
2. Create a new form, copy the endpoint URL
3. Update `.env.local`: `NEXT_PUBLIC_FORMSPREE_URL=https://formspree.io/f/<your-id>`
4. In Vercel dashboard, add `NEXT_PUBLIC_FORMSPREE_URL` as an environment variable

- [ ] **Step 6: Deploy to Vercel**

```bash
npx vercel --prod
```

Or connect the GitHub repo to Vercel via the Vercel dashboard for automatic deploys.

- [ ] **Step 7: Final commit**

```bash
git add vercel.json next.config.js
git commit -m "chore: deployment config and final build verification"
```

---

## Self-Review Checklist

Ran against the spec after writing the plan:

| Spec requirement | Task |
|---|---|
| Single Three.js canvas, camera-driven | Tasks 5, 6 |
| Zone 1 Hero — boy at desk, massive screen, dashboard | Tasks 7, 8 |
| Zone 2 — control tower building, orbiting nodes | Task 9 |
| Zone 3 — 8 process nodes (service + AI layers) | Task 10 |
| Zone 4 — floating service cards | Task 11 |
| Zone 5 — 3D stat geometry, count-up numbers | Task 12 |
| Zone 6 — holographic panels, case studies | Task 13 |
| Zone 7 — orbiting team orbs | Task 14 |
| Zone 8 — full-scene pullback, CTA | Task 15 |
| Contact page with form | Task 16 |
| Navbar with scroll-to-zone | Task 4 |
| Mobile fallback (no canvas) | Task 17 |
| Vercel deployment | Task 18 |
| Dark futuristic visual style | Tasks 1 (globals.css), throughout |
| Particle field + grid floor shared primitives | Task 6 |
| Cyan/green/amber colour tokens | Task 2 |
