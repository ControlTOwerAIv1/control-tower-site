import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/ui/Navbar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}))

describe('Navbar', () => {
  it('renders the brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('Control Tower')).toBeInTheDocument()
  })

  it('renders the Contact link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('renders the Services button', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /services/i })).toBeInTheDocument()
  })
})
