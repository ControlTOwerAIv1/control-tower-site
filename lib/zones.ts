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
