import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { getZoneIndex, getZoneProgress, ZONES, TOTAL_ZONES, interpolateCameraPosition } from '@/lib/zones'

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

describe('interpolateCameraPosition', () => {
  it('returns zone 0 camera position at progress 0', () => {
    const { position, lookAt } = interpolateCameraPosition(0)
    expect(position).toBeInstanceOf(THREE.Vector3)
    expect(position.x).toBeCloseTo(ZONES[0].camera.position[0])
    expect(position.y).toBeCloseTo(ZONES[0].camera.position[1])
    expect(position.z).toBeCloseTo(ZONES[0].camera.position[2])
  })
  it('returns zone 7 camera position at progress 1', () => {
    const { position } = interpolateCameraPosition(1)
    expect(position.x).toBeCloseTo(ZONES[7].camera.position[0])
    expect(position.y).toBeCloseTo(ZONES[7].camera.position[1])
    expect(position.z).toBeCloseTo(ZONES[7].camera.position[2])
  })
  it('interpolates midpoint between zone 0 and zone 1', () => {
    // Midpoint between zone 0 and zone 1 is at scrollProgress = 0.5/8 = 0.0625
    const { position } = interpolateCameraPosition(0.0625)
    const expected = (ZONES[0].camera.position[0] + ZONES[1].camera.position[0]) / 2
    expect(position.x).toBeCloseTo(expected)
  })
})
