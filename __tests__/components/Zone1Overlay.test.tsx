import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Zone1Overlay from '@/components/overlay/Zone1Overlay'

describe('Zone1Overlay', () => {
  it('renders hero title and cta', () => {
    render(<Zone1Overlay progress={0.01} onJumpToZone={vi.fn()} />)
    expect(screen.getByText(/control tower/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument()
  })
})
