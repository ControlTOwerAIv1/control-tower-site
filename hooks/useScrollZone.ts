import { useScrollStore } from '@/store/scroll'
import { getZoneIndex, getZoneProgress, getZoneVisibility } from '@/lib/zones'

export function useScrollZone() {
  const progress = useScrollStore((s) => s.progress)
  const zoneIndex = getZoneIndex(progress)
  const zoneProgress = getZoneProgress(progress, zoneIndex)
  const zoneVisibility = getZoneVisibility(progress, zoneIndex)
  return { zoneIndex, zoneProgress, zoneVisibility, progress }
}
