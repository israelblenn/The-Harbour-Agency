'use client'

import { useEffect } from 'react'
import { useSelectedAct } from '@/contexts/SelectedActContext'

export default function ClearSelection() {
  const { setSelectedActId } = useSelectedAct()

  useEffect(() => {
    setSelectedActId(null)
  }, [setSelectedActId])

  return null
}
