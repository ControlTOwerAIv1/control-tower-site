import { useScrollStore } from '@/store/scroll'
import { getZoneIndex, getZoneProgress } from '@/lib/zones'

export function useScrollZone() {
  const progress = useScrollStore((s) => s.progress)
  const zoneIndex = getZoneIndex(progress)
  const zoneProgress = getZoneProgress(progress, zoneIndex)
  return { zoneIndex, zoneProgress, progress }
}
