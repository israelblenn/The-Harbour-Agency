import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  const pendingScrollSelectionRef = useRef<NodeJS.Timeout | null>(null)
  const isArrowKeyScrollRef = useRef(false)
  const isUserClickOrKeyRef = useRef(false)
  const lastUserScrollTimeRef = useRef(0)
  const programmaticScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [pendingActId, setPendingActId] = useState<string | null>(null)

  // Cancel any pending scroll-based selection
  const cancelPendingScrollSelection = useCallback(() => {
    if (pendingScrollSelectionRef.current) {
      clearTimeout(pendingScrollSelectionRef.current)
      pendingScrollSelectionRef.current = null
      setPendingActId(null)
    }
  }, [])

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
      // Cancel any existing pending selection
      cancelPendingScrollSelection()

      // If this is from arrow key scrolling, select immediately (no delay)
      if (isArrowKeyScrollRef.current) {
        isProgrammaticScrollRef.current = true
        isUserClickOrKeyRef.current = true
        setSelectedActId(act.id)
        queueMicrotask(() => {
          isProgrammaticScrollRef.current = false
          isArrowKeyScrollRef.current = false
          // Clear the flag after a short delay
          setTimeout(() => {
            isUserClickOrKeyRef.current = false
          }, 500)
        })
      } else {
        // Delay the selection for regular scroll-based selections
        // Set the pending act ID so the indicator can show on the act being scrolled to
        setPendingActId(act.id)
        pendingScrollSelectionRef.current = setTimeout(() => {
          // Check if user has scrolled recently - if so, cancel this selection
          const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current
          if (timeSinceLastUserScroll < 200) {
            pendingScrollSelectionRef.current = null
            setPendingActId(null)
            return
          }

          isProgrammaticScrollRef.current = true
          setSelectedActId(act.id)
          queueMicrotask(() => {
            isProgrammaticScrollRef.current = false
          })
          pendingScrollSelectionRef.current = null
          // Delay clearing the indicator by 500ms so animation can finish
          setTimeout(() => {
            setPendingActId(null)
          }, 500)
        }, 1500)
      }
    }
  }, [filteredActs, setSelectedActId, cancelPendingScrollSelection])

  // Debounce scroll updates - only trigger after scrolling has stopped
  // This ensures the indicator only appears when an act is "landed on" (snapped to)
  const debouncedUpdateSelected = useMemo(() => {
    let timeoutId: number | null = null
    return () => {
      // Cancel any pending update
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      // Wait for scrolling to stop before updating selection
      // 100ms matches roughly when scroll-snap finishes
      timeoutId = window.setTimeout(() => {
        timeoutId = null

        // Don't set pending selection if this is from programmatic scroll or user click/key
        if (!isProgrammaticScrollRef.current && !isUserClickOrKeyRef.current) {
          updateSelected()
        }
      }, 100)
    }
  }, [updateSelected])

  const handleItemClick = (actId: string, e: React.MouseEvent<HTMLLIElement>) => {
    if (!isClickAllowedRef.current) return
    // Cancel any pending scroll-based selection since this is an instant click
    cancelPendingScrollSelection()
    isProgrammaticScrollRef.current = true
    isUserClickOrKeyRef.current = true
    setSelectedActId(actId)
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      isProgrammaticScrollRef.current = false
      // Clear the flag after scroll animation completes
      setTimeout(() => {
        isUserClickOrKeyRef.current = false
      }, 500)
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

    // Check if user is actively scrolling - if so, don't interfere
    const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current
    if (timeSinceLastUserScroll < 200) {
      return
    }

    // Clear any existing programmatic scroll timeout
    if (programmaticScrollTimeoutRef.current) {
      clearTimeout(programmaticScrollTimeoutRef.current)
    }

    isProgrammaticScrollRef.current = true
    list.scrollTo({ top: expectedScrollTop, behavior: scrollBehavior })

    if (scrollBehavior === 'auto') {
      queueMicrotask(() => {
        isProgrammaticScrollRef.current = false
      })
    } else {
      programmaticScrollTimeoutRef.current = setTimeout(() => {
        // Only clear if user hasn't scrolled recently
        const timeSinceLastUserScroll = Date.now() - lastUserScrollTimeRef.current
        if (timeSinceLastUserScroll >= 200) {
          isProgrammaticScrollRef.current = false
        }
        programmaticScrollTimeoutRef.current = null
      }, 300)
      return () => {
        if (programmaticScrollTimeoutRef.current) {
          clearTimeout(programmaticScrollTimeoutRef.current)
          programmaticScrollTimeoutRef.current = null
        }
      }
    }
  }, [selectedActId, filteredActs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPendingScrollSelection()
    }
  }, [cancelPendingScrollSelection])

  // Expose function to mark user scroll (called from scroll event handler)
  const markUserScroll = useCallback(() => {
    lastUserScrollTimeRef.current = Date.now()
  }, [])

  return {
    scrollRef,
    updateSelected: debouncedUpdateSelected,
    handleItemClick,
    isProgrammaticScrollRef,
    isClickAllowedRef,
    cancelPendingScrollSelection,
    isArrowKeyScrollRef,
    pendingActId,
    markUserScroll,
  }
}
