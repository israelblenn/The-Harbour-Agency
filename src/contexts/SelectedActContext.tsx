'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type SelectedActContextType = {
  selectedActId: string | null
  setSelectedActId: (id: string | null) => void
  hoveredActId: string | null
  setHoveredActId: (id: string | null) => void
}

const SelectedActContext = createContext<SelectedActContextType | undefined>(undefined)

// Module-level deselection lock — synchronously blocks scroll-based re-selection
let deselectionLockedUntil = 0
export const isDeselectionLocked = () => Date.now() < deselectionLockedUntil
export const lockDeselection = () => { deselectionLockedUntil = Date.now() + 3000 }

export const SelectedActProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedActId, setSelectedActIdState] = useState<string | null>(null)
  const [hoveredActId, setHoveredActId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1400)
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const setSelectedActId = (id: string | null) => {
    setSelectedActIdState(id)
    if (id != null && !isMobile) router.push(`${id}`)
  }

  return (
    <SelectedActContext.Provider value={{ selectedActId, setSelectedActId, hoveredActId, setHoveredActId }}>{children}</SelectedActContext.Provider>
  )
}

export const useSelectedAct = () => {
  const ctx = useContext(SelectedActContext)
  if (!ctx) throw new Error('useSelectedAct must be used within a SelectedActProvider')
  return ctx
}
