import { useCallback, useEffect, useMemo, useRef } from 'react'

export function useScrollSelection(
  filteredActs: Array<{ id: string; name: string }>,
  selectedActId: string | null,
  setSelectedActId: (id: string) => void,
) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const isProgrammaticScrollRef = useRef(false)
  const isClickAllowedRef = useRef(true)
  const initialSelectedIdRef = useRef(selectedActId)
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

  useEffect(() => {
    const list = scrollRef.current
    if (!list || !selectedActId) return

    const index = filteredActs.findIndex((act) => act.id === selectedActId)
    if (index === -1) return

    const items = Array.from(list.children).slice(0, -1)
    if (items.length === 0) return

    const itemHeight = items[0].clientHeight
    const expectedScrollTop = index * itemHeight

    if (Math.abs(list.scrollTop - expectedScrollTop) < 4) return

    let scrollBehavior: ScrollBehavior = 'smooth'

    if (
      !hasPerformedInitialPositioningRef.current &&
      initialSelectedIdRef.current &&
      initialSelectedIdRef.current === selectedActId
    ) {
      scrollBehavior = 'auto'
    }

    hasPerformedInitialPositioningRef.current = true
    isProgrammaticScrollRef.current = true

    list.scrollTo({ top: expectedScrollTop, behavior: scrollBehavior })

    if (scrollBehavior === 'auto') {
      queueMicrotask(() => {
        isProgrammaticScrollRef.current = false
      })
    } else {
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
