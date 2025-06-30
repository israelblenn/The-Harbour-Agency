// SelectedActContext.tsx
'use client'

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

type SelectedActContextType = {
  selectedActId: string | null
  setSelectedActId: (id: string | null) => void
}

const SelectedActContext = createContext<SelectedActContextType | undefined>(undefined)

export const SelectedActProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedActId, setSelectedActIdState] = useState<string | null>(null)
  const router = useRouter()

  const setSelectedActId = (id: string | null) => {
    setSelectedActIdState(id)
    if (id != null) router.push(`${id}`)
  }

  return (
    <SelectedActContext.Provider value={{ selectedActId, setSelectedActId }}>{children}</SelectedActContext.Provider>
  )
}

export const useSelectedAct = () => {
  const ctx = useContext(SelectedActContext)
  if (!ctx) throw new Error('useSelectedAct must be used within a SelectedActProvider')
  return ctx
}
