import * as THREE from 'three'

export const TOTAL_ZONES = 8

export interface ZoneDefinition {
  id: number
  name: string
  navLabel?: string
  camera: {
    position: [number, number, number]
    lookAt: [number, number, number]
  }
}

export const ZONES: ZoneDefinition[] = [
  {
    id: 0,
    name: 'City Overview',
    camera: { position: [0, 26, 84], lookAt: [0, 6, 0] },
  },
  {
    id: 1,
    name: 'Hero Interior',
    camera: { position: [-8.8, 3.4, 8.8], lookAt: [1.8, 1.9, 1.1] },
  },
  {
    id: 2,
    name: 'What We Do',
    camera: { position: [2.9, 3.3, 10.6], lookAt: [-6.1, 2.55, 3.45] },
  },
  {
    id: 3,
    name: 'How It Works',
    navLabel: 'How It Works',
    camera: { position: [2.9, 3.3, 8.2], lookAt: [-6.2, 2.25, 3.35] },
  },
  {
    id: 4,
    name: 'Services',
    navLabel: 'Services',
    camera: { position: [2.8, 3.3, 8.1], lookAt: [-6.1, 2.15, 3.3] },
  },
  {
    id: 5,
    name: 'Why Us',
    camera: { position: [3.1, 4.9, 7.2], lookAt: [-6.2, 2.8, 3.2] },
  },
  {
    id: 6,
    name: 'Case Studies',
    camera: { position: [3.1, 4.9, 7.2], lookAt: [-6.1, 2.75, 3.25] },
  },
  {
    id: 7,
    name: 'Team',
    navLabel: 'Team',
    camera: { position: [3.3, 5.3, 7.1], lookAt: [-6.25, 2.95, 3.15] },
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

/** Zone visibility around its center, useful for smooth cross-fades */
export function getZoneVisibility(scrollProgress: number, zoneId: number): number {
  const center = (zoneId + 0.5) / TOTAL_ZONES
  const distance = Math.abs(scrollProgress - center)
  return Math.max(0, 1 - distance * TOTAL_ZONES)
}

/** Get interpolated camera position between two zones */
export function interpolateCameraPosition(
  scrollProgress: number
): { position: THREE.Vector3; lookAt: THREE.Vector3 } {
  const rawZone = scrollProgress * TOTAL_ZONES
  const fromIndex = Math.min(Math.floor(rawZone), TOTAL_ZONES - 1)
  const toIndex = Math.min(fromIndex + 1, TOTAL_ZONES - 1)
  const t = Math.min(rawZone - fromIndex, 1)

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
