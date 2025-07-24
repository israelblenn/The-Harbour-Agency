'use client'

import { useEffect } from 'react'

interface Act {
  id: string
  name: string
}

interface ActListOverflowEffectProps {
  contentRefs: React.RefObject<Record<string, HTMLSpanElement | null>>
  filteredActs: Act[]
  selectedActId: string | null
}

export default function ActListOverflowEffect({
  contentRefs,
  filteredActs,
  selectedActId,
}: ActListOverflowEffectProps) {
  useEffect(() => {
    Object.values(contentRefs.current).forEach((contentEl) => {
      if (!contentEl) return
      const isOverflowing = contentEl.scrollWidth > (contentEl.parentElement?.offsetWidth || 0)
      contentEl.dataset.overflowing = isOverflowing.toString()
    })
  }, [filteredActs, selectedActId, contentRefs])

  return null
}
