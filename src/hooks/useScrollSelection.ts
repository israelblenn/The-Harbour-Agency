// hooks/useScrollSelection.ts
import { useCallback, useEffect, useMemo, useRef } from 'react'

export function useScrollSelection(
  filteredActs: Array<{ id: string; name: string }>,
  selectedActId: string | null,
  setSelectedActId: (id: string) => void,
) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const isProgrammaticScrollRef = useRef(false)
  const isClickAllowedRef = useRef(true)

  // Ref to store the selectedActId from the very first render
  const initialSelectedIdRef = useRef(selectedActId)
  // Ref to track if we've performed the first positioning action
  const hasPerformedInitialPositioningRef = useRef(false)

  const updateSelected = useCallback(() => {
    const list = scrollRef.current
    if (!list) return

    const scrollTop = list.scrollTop
    const items = Array.from(list.children).slice(0, -1)
    if (items.length === 0) return

    const itemHeight = items[0].clientHeight
    const index = Math.round(scrollTop / itemHeight)
    const act = filteredActs[index]

    if (act) {
      isProgrammaticScrollRef.current = true
      setSelectedActId(act.id)
      queueMicrotask(() => {
        isProgrammaticScrollRef.current = false
      })
    }
  }, [filteredActs, setSelectedActId])

  const debounce = (fn: () => void, delay: number) => {
    let timer: number | null = null
    return () => {
      if (timer) clearTimeout(timer)
      timer = window.setTimeout(fn, delay)
    }
  }

  const debouncedUpdateSelected = useMemo(
    () =>
      debounce(() => {
        if (!isProgrammaticScrollRef.current) updateSelected()
      }, 100),
    [updateSelected],
  )

  const handleItemClick = (actId: string, e: React.MouseEvent<HTMLLIElement>) => {
    if (!isClickAllowedRef.current) return
    isProgrammaticScrollRef.current = true
    setSelectedActId(actId)
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 200)
  }

  // Scroll to selected effect
  useEffect(() => {
    const list = scrollRef.current
    if (!list || !selectedActId) return

    const index = filteredActs.findIndex((act) => act.id === selectedActId)
    if (index === -1) return

    const items = Array.from(list.children).slice(0, -1)
    if (items.length === 0) return

    const itemHeight = items[0].clientHeight
    const expectedScrollTop = index * itemHeight

    if (Math.abs(list.scrollTop - expectedScrollTop) < 4) {
      return
    }

    let scrollBehavior: ScrollBehavior = 'smooth' // Default to smooth

    // This logic now correctly checks for an initial ID on mount
    if (
      !hasPerformedInitialPositioningRef.current &&
      initialSelectedIdRef.current &&
      initialSelectedIdRef.current === selectedActId
    ) {
      scrollBehavior = 'auto' // Override to 'auto' only for the initial mount selection
    }

    // Any programmatic scroll means the initial positioning is now complete.
    hasPerformedInitialPositioningRef.current = true
    isProgrammaticScrollRef.current = true

    list.scrollTo({ top: expectedScrollTop, behavior: scrollBehavior })

    if (scrollBehavior === 'auto') {
      // For an instant scroll, reset the flag immediately.
      queueMicrotask(() => {
        isProgrammaticScrollRef.current = false
      })
    } else {
      // For a smooth scroll, wait for the animation.
      const timeoutId = setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedActId, filteredActs])

  return {
    scrollRef,
    updateSelected: debouncedUpdateSelected,
    handleItemClick,
    isProgrammaticScrollRef,
    isClickAllowedRef,
  }
}
