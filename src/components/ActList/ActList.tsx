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

  const { filteredActs, eLiveStartIndex } = useMemo(() => {
    if (!Acts) return { filteredActs: [], eLiveStartIndex: -1 }

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

    // Calculate where E-Live acts start (only if there are both regular and E-Live acts)
    const eLiveStart = filteredRegular.length > 0 && filteredELive.length > 0 ? filteredRegular.length : -1

    // Return regular acts first, then E-Live acts at the bottom
    return {
      filteredActs: [...filteredRegular, ...filteredELive],
      eLiveStartIndex: eLiveStart,
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
  } = useScrollSelection(filteredActs, selectedActId, setSelectedActId)

  const handleItemClick = useCallback(
    (id: string, e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      isUserInteractingWithSelection.current = true
      originalHandleItemClick(id, e)
    },
    [originalHandleItemClick],
  )

  const handleELiveTitleClick = useCallback(() => {
    if (scrollRef.current && eLiveStartIndex >= 0 && filteredActs.length > eLiveStartIndex) {
      isProgrammaticScrollRef.current = true
      const container = scrollRef.current
      const items = Array.from(container.children).slice(0, -1) // Exclude spacer
      if (items.length === 0) return

      // Find the first E-Live act in the DOM
      const firstELiveAct = filteredActs[eLiveStartIndex]
      if (!firstELiveAct) return

      // Cancel any pending scroll-based selection since this is an instant click
      cancelPendingScrollSelection()
      // Select the first E-Live act
      setSelectedActId(firstELiveAct.id)

      // Calculate scroll position by summing heights up to the first E-Live act
      // This includes: regular acts + gap + title + line
      let scrollTop = 0
      let actItemIndex = 0

      for (let i = 0; i < items.length; i++) {
        const item = items[i] as HTMLLIElement
        const isSeparator = item.getAttribute('data-separator') === 'true'
        const isTitle = item.getAttribute('data-title') === 'true'

        if (isSeparator || isTitle) {
          // Include separator elements (gap, line) and title in the scroll calculation
          scrollTop += item.clientHeight
        } else {
          // This is an act item
          if (actItemIndex === eLiveStartIndex) {
            // Found the first E-Live act, scroll to it
            break
          }
          scrollTop += item.clientHeight
          actItemIndex++
        }
      }

      container.scrollTo({ top: scrollTop, behavior: 'smooth' })
      setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 500)
    }
  }, [scrollRef, eLiveStartIndex, filteredActs, setSelectedActId, cancelPendingScrollSelection])

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

  // Handle keyboard navigation to skip the E-Live title
  useEffect(() => {
    if (eLiveStartIndex === -1) return // No E-Live section, no special handling needed

    const handleKeyDown = (e: KeyboardEvent) => {
      const isArrowKey = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      if (!isArrowKey || !selectedActId) return

      const currentIndex = filteredActs.findIndex((act) => act.id === selectedActId)
      if (currentIndex === -1) return

      const isGoingDown = e.key === 'ArrowDown' || e.key === 'ArrowRight'
      const isGoingUp = e.key === 'ArrowUp' || e.key === 'ArrowLeft'

      // Check if we're at the boundary where we need to skip the title
      const isLastRegularAct = currentIndex === eLiveStartIndex - 1
      const isFirstELiveAct = currentIndex === eLiveStartIndex

      if (isGoingDown && isLastRegularAct) {
        // Skip from last regular act directly to first E-Live act
        e.preventDefault()
        e.stopPropagation()
        const firstELiveAct = filteredActs[eLiveStartIndex]
        if (firstELiveAct) {
          // Cancel any pending scroll-based selection since this is an instant arrow key selection
          cancelPendingScrollSelection()
          isProgrammaticScrollRef.current = true
          isUserInteractingWithSelection.current = true
          setSelectedActId(firstELiveAct.id)
          // Scroll will be handled by the useScrollSelection hook
        }
      } else if (isGoingUp && isFirstELiveAct) {
        // Skip from first E-Live act directly to last regular act
        e.preventDefault()
        e.stopPropagation()
        const lastRegularAct = filteredActs[eLiveStartIndex - 1]
        if (lastRegularAct) {
          // Cancel any pending scroll-based selection since this is an instant arrow key selection
          cancelPendingScrollSelection()
          isProgrammaticScrollRef.current = true
          isUserInteractingWithSelection.current = true
          setSelectedActId(lastRegularAct.id)
          // Scroll will be handled by the useScrollSelection hook
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedActId,
    filteredActs,
    eLiveStartIndex,
    setSelectedActId,
    isProgrammaticScrollRef,
    cancelPendingScrollSelection,
  ])

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

        // Check if this item is visible at or near the top of the scroll container
        if (list.scrollTop <= itemBottom && list.scrollTop >= itemTop - item.clientHeight) {
          // Calculate position relative to the bar
          // Bar starts at 4.5rem (72px) from container top
          // Item's position relative to scroll container top
          const itemRelativeToScrollTop = itemTop - list.scrollTop
          // Position relative to bar (bar is 72px from container top, so subtract that)
          const positionInBar = itemRelativeToScrollTop - 72
          // Center vertically within the item (item is 64px tall, indicator is 16px)
          return Math.max(0, positionInBar + (64 - 16) / 2)
        }
        cumulativeHeight += item.clientHeight
        actIndex++
      }
    }

    return null
  }, [scrollRef, filteredActs, scrollTop, pendingActId])

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
      <div className={`${styles.fade} desktop-only`} />

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
          eLiveStartIndex={eLiveStartIndex}
          separatorRef={separatorRef}
          onELiveTitleClick={handleELiveTitleClick}
          scrollRef={scrollRef}
          pendingActId={pendingActId}
        />
      </ActListScroll>

      <ActListOverflowEffect contentRefs={contentRefs} filteredActs={filteredActs} selectedActId={selectedActId} />
    </div>
  )
}
