'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from '@/styles/ActList.module.css'
import { useSelectedAct } from '@/contexts/SelectedActContext'
import { search } from 'fast-fuzzy'
import { useScrollSelection } from '@/hooks/useScrollSelection'
import ActListSearch from './ActListSearch'
import ActListScroll from './ActListScroll'
import ActListDisplay from './ActListDisplay'
import ActListOverflowEffect from './ActListOverflowEffect'

interface Act {
  id: string
  name: string
  eLive?: boolean | null
}

interface ActListProps {
  Acts: Act[] | undefined
}

export default function ActList({ Acts }: ActListProps) {
  const { selectedActId, setSelectedActId } = useSelectedAct()
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isUserInteractingWithSelection = useRef(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const contentRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const separatorRef = useRef<HTMLLIElement | null>(null)

  const { filteredActs, eLiveTitleIndex } = useMemo(() => {
    if (!Acts) return { filteredActs: [], eLiveTitleIndex: -1 }

    // Separate acts into regular and E-Live acts
    const regularActs = Acts.filter((act) => !act.eLive)
    const eLiveActs = Acts.filter((act) => act.eLive === true)

    let filteredRegular: Act[]
    let filteredELive: Act[]

    if (!searchQuery) {
      // No search: show regular acts first, then E-Live acts at the bottom
      filteredRegular = regularActs
      filteredELive = eLiveActs
    } else {
      // With search: search both groups separately
      filteredRegular = search(searchQuery, regularActs, { keySelector: (act) => act.name })
      filteredELive = search(searchQuery, eLiveActs, { keySelector: (act) => act.name })
    }

    // If there are both regular and E-Live acts, insert the E-Live title as a virtual selectable item
    if (filteredRegular.length > 0 && filteredELive.length > 0) {
      const eLiveTitleItem: Act = { id: 'e-live', name: 'E-Live' }
      return {
        filteredActs: [...filteredRegular, eLiveTitleItem, ...filteredELive],
        eLiveTitleIndex: filteredRegular.length,
      }
    }

    // Return regular acts first, then E-Live acts at the bottom (no title needed if one group is empty)
    return {
      filteredActs: [...filteredRegular, ...filteredELive],
      eLiveTitleIndex: -1,
    }
  }, [Acts, searchQuery])

  const {
    scrollRef,
    updateSelected: debouncedUpdateSelectedFromScroll,
    handleItemClick: originalHandleItemClick,
    isProgrammaticScrollRef,
    isClickAllowedRef,
    cancelPendingScrollSelection,
    isArrowKeyScrollRef,
    pendingActId,
    markUserScroll,
    isUserClickOrKeyRef,
  } = useScrollSelection(filteredActs, selectedActId, setSelectedActId)

  const handleItemClick = useCallback(
    (id: string, e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      isUserInteractingWithSelection.current = true

      // Special handling for E-Live title click (sticky element - scrollIntoView doesn't work correctly)
      if (id === 'e-live' && scrollRef.current) {
        // DO NOT call originalHandleItemClick - scrollIntoView on sticky elements scrolls to wrong position!
        // Instead, manually handle everything:
        cancelPendingScrollSelection()
      isProgrammaticScrollRef.current = true
        isUserClickOrKeyRef.current = true // Block scroll-based selection
        setSelectedActId(id)

        // Calculate and scroll to the E-Live title position
      const container = scrollRef.current
      const items = Array.from(container.children).slice(0, -1) // Exclude spacer
        const eLiveIndex = filteredActs.findIndex((act) => act.id === 'e-live')

      let scrollTop = 0
        let actIndex = 0

      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLLIElement
        const isSeparator = item.getAttribute('data-separator') === 'true'

          if (isSeparator) {
          scrollTop += item.clientHeight
        } else {
            if (actIndex === eLiveIndex) break
          scrollTop += item.clientHeight
            actIndex++
        }
      }

        // Temporarily disable scroll-snap to prevent it from snapping to wrong position
        const originalSnapType = container.style.scrollSnapType
        container.style.scrollSnapType = 'none'

        // Scroll with smooth animation
      container.scrollTo({ top: scrollTop, behavior: 'smooth' })

        // Re-enable scroll-snap after smooth scroll animation completes (~500ms)
      setTimeout(() => {
          container.style.scrollSnapType = originalSnapType || ''
        isProgrammaticScrollRef.current = false
          setTimeout(() => {
            isUserClickOrKeyRef.current = false
      }, 500)
        }, 600)
      } else {
        originalHandleItemClick(id, e)
    }
    },
    [
      originalHandleItemClick,
      scrollRef,
      filteredActs,
      cancelPendingScrollSelection,
      isProgrammaticScrollRef,
      isUserClickOrKeyRef,
      setSelectedActId,
    ],
  )

  const debouncedUpdateSelected = useCallback(
    (_event: React.UIEvent<HTMLUListElement>) => {
      // Mark that user is scrolling (unless it's a programmatic scroll)
      if (!isProgrammaticScrollRef.current) {
        markUserScroll()
      }

      isUserInteractingWithSelection.current = true
      debouncedUpdateSelectedFromScroll()
    },
    [debouncedUpdateSelectedFromScroll, isProgrammaticScrollRef, markUserScroll],
  )

  useEffect(() => {
    const currentInput = inputRef.current
    const currentList = scrollRef.current
    if (currentInput && currentList && document.activeElement === currentInput) {
      isProgrammaticScrollRef.current = true
      isUserInteractingWithSelection.current = false
      currentList.scrollTo({ top: 0 })
      setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 100)
    }
  }, [searchQuery, scrollRef, isProgrammaticScrollRef])

  useEffect(() => {
    if (searchQuery && filteredActs.length > 0 && !isUserInteractingWithSelection.current) {
      const firstResultId = filteredActs[0].id
      if (firstResultId !== selectedActId) {
        // Cancel any pending scroll-based selection since this is a programmatic selection from search
        cancelPendingScrollSelection()
        setSelectedActId(firstResultId)
      }
    }
    const resetTimer = setTimeout(() => {
      isUserInteractingWithSelection.current = false
    }, 50)
    return () => clearTimeout(resetTimer)
  }, [filteredActs, searchQuery, selectedActId, setSelectedActId, cancelPendingScrollSelection])

  // Track scroll position to position the loading indicator
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const list = scrollRef.current
    if (!list) return

    const handleScroll = () => {
      setScrollTop(list.scrollTop)
    }

    list.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial value

    return () => {
      list.removeEventListener('scroll', handleScroll)
    }
  }, [scrollRef])

  // Calculate the top act's position for indicator placement
  const indicatorTop = useMemo(() => {
    if (!scrollRef.current || !pendingActId) return null

    const list = scrollRef.current
    const items = Array.from(list.children).slice(0, -1) // Exclude spacer

    if (items.length === 0) return null

    // Find the first visible act item at the top
    let cumulativeHeight = 0

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLLIElement
      const isSeparator = item.getAttribute('data-separator') === 'true'
      const isTitle = item.getAttribute('data-title') === 'true'

      if (isSeparator || isTitle) {
        cumulativeHeight += item.clientHeight
      } else {
        const itemTop = cumulativeHeight
        const itemBottom = cumulativeHeight + item.clientHeight

        // Check if this item is visible at or near the top of the scroll container
        if (scrollTop <= itemBottom && scrollTop >= itemTop - item.clientHeight) {
          // Calculate position relative to the bar
          // Bar starts at 4.5rem (72px) from container top
          // Item's position relative to scroll container top
          const itemRelativeToScrollTop = itemTop - scrollTop
          // Position relative to bar (bar is 72px from container top, so subtract that)
          const positionInBar = itemRelativeToScrollTop - 72
          // Center vertically within the item (item is 64px tall, indicator is 16px)
          return Math.max(0, positionInBar + (64 - 16) / 2)
        }
        cumulativeHeight += item.clientHeight
      }
    }

    return null
  }, [scrollRef, pendingActId, scrollTop])

  return (
    <div className={styles.container}>
      <div className={styles.barCropper} />
      <div className={styles.bar}>
        {pendingActId && indicatorTop !== null && (
          <div
            key={pendingActId}
            className={styles.loadingIndicator}
            aria-hidden="true"
            style={{ top: `${indicatorTop}px` }}
          >
            <div className={styles.dialFill} />
          </div>
        )}
      </div>
      <div className={styles.fade} />

      <ActListSearch inputRef={inputRef} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ActListScroll
        scrollRef={scrollRef}
        isClickAllowedRef={isClickAllowedRef}
        isProgrammaticScrollRef={isProgrammaticScrollRef}
        isUserInteractingWithSelection={isUserInteractingWithSelection}
        setIsDragging={setIsDragging}
        onScroll={debouncedUpdateSelected}
        isArrowKeyScrollRef={isArrowKeyScrollRef}
      >
        <ActListDisplay
          acts={filteredActs}
          selectedActId={selectedActId}
          onItemClick={handleItemClick}
          isDragging={isDragging}
          contentRefs={contentRefs}
          eLiveTitleIndex={eLiveTitleIndex}
          separatorRef={separatorRef}
          scrollRef={scrollRef}
          pendingActId={pendingActId}
        />
      </ActListScroll>

      <ActListOverflowEffect contentRefs={contentRefs} filteredActs={filteredActs} selectedActId={selectedActId} />
    </div>
  )
}
