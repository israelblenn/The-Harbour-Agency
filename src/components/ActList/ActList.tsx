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

  const filteredActs = useMemo(() => {
    if (!Acts) return []
    if (!searchQuery) return Acts
    return search(searchQuery, Acts, { keySelector: (act) => act.name })
  }, [Acts, searchQuery])

  const {
    scrollRef,
    updateSelected: debouncedUpdateSelectedFromScroll,
    handleItemClick: originalHandleItemClick,
    isProgrammaticScrollRef,
    isClickAllowedRef,
  } = useScrollSelection(filteredActs, selectedActId, setSelectedActId)

  const handleItemClick = useCallback(
    (id: string, e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      isUserInteractingWithSelection.current = true
      originalHandleItemClick(id, e)
    },
    [originalHandleItemClick],
  )

  const debouncedUpdateSelected = useCallback(
    (_event: React.UIEvent<HTMLUListElement>) => {
      isUserInteractingWithSelection.current = true
      debouncedUpdateSelectedFromScroll()
    },
    [debouncedUpdateSelectedFromScroll],
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
        setSelectedActId(firstResultId)
      }
    }
    const resetTimer = setTimeout(() => {
      isUserInteractingWithSelection.current = false
    }, 50)
    return () => clearTimeout(resetTimer)
  }, [filteredActs, searchQuery, selectedActId, setSelectedActId])

  return (
    <div className={styles.container}>
      <div className={styles.barCropper} />
      <div className={styles.bar} />
      <div className={`${styles.fade} desktop-only`} />

      <ActListSearch inputRef={inputRef} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <ActListScroll
        scrollRef={scrollRef}
        isClickAllowedRef={isClickAllowedRef}
        isProgrammaticScrollRef={isProgrammaticScrollRef}
        isUserInteractingWithSelection={isUserInteractingWithSelection}
        setIsDragging={setIsDragging}
        onScroll={debouncedUpdateSelected}
      >
        <ActListDisplay
          acts={filteredActs}
          selectedActId={selectedActId}
          onItemClick={handleItemClick}
          isDragging={isDragging}
          contentRefs={contentRefs}
        />
      </ActListScroll>

      <ActListOverflowEffect contentRefs={contentRefs} filteredActs={filteredActs} selectedActId={selectedActId} />
    </div>
  )
}
