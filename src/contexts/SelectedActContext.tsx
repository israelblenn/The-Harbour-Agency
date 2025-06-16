import { createContext, useContext, useState } from 'react'

type SelectedActContextType = {
  selectedActId: string | null
  setSelectedActId: (id: string | null) => void
}

const SelectedActContext = createContext<SelectedActContextType | undefined>(undefined)

export const SelectedActProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedActId, setSelectedActId] = useState<string | null>(null)

  return (
    <SelectedActContext.Provider value={{ selectedActId, setSelectedActId }}>{children}</SelectedActContext.Provider>
  )
}

export const useSelectedAct = () => {
  const ctx = useContext(SelectedActContext)
  if (!ctx) throw new Error('useSelectedAct must be used within a SelectedActProvider')
  return ctx
}
