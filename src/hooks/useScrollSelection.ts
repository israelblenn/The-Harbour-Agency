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
    const items = Array.from(list.children).slice(0, -1) // Exclude spacer
    if (items.length === 0) return

    // Calculate which act is at the scroll position by summing heights
    let cumulativeHeight = 0
    let actIndex = 0
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLLIElement
      const isSeparator = item.getAttribute('data-separator') === 'true'
      const isTitle = item.getAttribute('data-title') === 'true'
      
      if (isSeparator || isTitle) {
        cumulativeHeight += item.clientHeight
      } else {
        const itemTop = cumulativeHeight
        const itemBottom = cumulativeHeight + item.clientHeight
        
        if (scrollTop >= itemTop && scrollTop < itemBottom) {
          // Found the act at this scroll position
          break
        }
        cumulativeHeight += item.clientHeight
        actIndex++
      }
    }

    const act = filteredActs[actIndex]
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

    const items = Array.from(list.children).slice(0, -1) // Exclude spacer
    if (items.length === 0) return

    // Calculate scroll position accounting for separator
    // Find the separator and add its height if the selected act is after it
    let expectedScrollTop = 0
    let actItemIndex = 0
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLLIElement
      const isSeparator = item.getAttribute('data-separator') === 'true'
      const isTitle = item.getAttribute('data-title') === 'true'
      
      if (isSeparator || isTitle) {
        expectedScrollTop += item.clientHeight
      } else {
        if (actItemIndex === index) {
          break
        }
        expectedScrollTop += item.clientHeight
        actItemIndex++
      }
    }

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
