import { create } from 'zustand'

interface ScrollState {
  progress: number          // normalised [0, 1]
  setProgress: (p: number) => void
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),
}))
