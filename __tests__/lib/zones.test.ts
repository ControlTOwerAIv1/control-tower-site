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
