'use client'

import { useEffect, useRef } from 'react'
import { useSelectedAct } from '@/contexts/SelectedActContext'

export default function ClearSelection() {
  const { setSelectedActId } = useSelectedAct()
  const hasClearedRef = useRef(false)

  useEffect(() => {
    // Only clear once when the component first mounts
    if (!hasClearedRef.current) {
      setSelectedActId(null)
      hasClearedRef.current = true
    }
  }, []) // Empty dependency array since we only want this to run once

  return null
}
