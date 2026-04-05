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
