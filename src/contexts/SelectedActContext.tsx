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

  // #region agent log
  useEffect(() => {
    const start = performance.now()
    let last = ''
    const post = (d: object) => { fetch('http://127.0.0.1:7537/ingest/29cc7403-aac1-4fdb-a3b3-c8158a4c3e0f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e72563'},body:JSON.stringify(Object.assign({sessionId:'e72563',hypothesisId:'MARGIN',location:'SelectedActContext:sampler',timestamp:Date.now()},d))}).catch(()=>{}) }
    const tick = () => {
      const t = Math.round(performance.now() - start)
      const he = document.documentElement
      const hs = getComputedStyle(he)
      const bs = document.body ? getComputedStyle(document.body) : null
      const stack = (document.elementsFromPoint ? document.elementsFromPoint(3, 3) : []).slice(0, 5).map((el) => {
        const cs = getComputedStyle(el as Element)
        return (el as Element).tagName + '.' + (((el as Element).className && (el as Element).className.toString) ? (el as Element).className.toString().slice(0, 24) : '') + '{bg:' + cs.backgroundColor + ',op:' + cs.opacity + ',pos:' + cs.position + ',z:' + cs.zIndex + '}'
      })
      const sig = hs.backgroundColor + '|' + (bs ? bs.backgroundColor : 'nobody') + '|' + stack.join('>>')
      if (sig !== last) { last = sig; post({ message: 'margin-sample', data: { t, htmlBg: hs.backgroundColor, htmlColorScheme: hs.colorScheme, bodyBg: bs ? bs.backgroundColor : 'nobody', marginStack: stack } }) }
      if (performance.now() - start < 2500) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])
  // #endregion

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
