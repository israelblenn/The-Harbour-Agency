'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from '@/styles/ActList.module.css'
import { useSelectedAct } from '@/contexts/SelectedActContext'
import { search } from 'fast-fuzzy'
import { useScrollSelection } from '@/hooks/useScrollSelection'

interface ActListProps {
  Acts: Array<{ id: string; name: string }> | undefined
}

export default function ActList({ Acts }: ActListProps) {
  const { selectedActId, setSelectedActId } = useSelectedAct()
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const isUserInteractingWithSelection = useRef(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const contentRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const isDraggingRef = useRef(false)
  const startYRef = useRef(0)
  const scrollTopRef = useRef(0)

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
    const CLICK_MOVE_THRESHOLD = 5

    const handleMouseDown = (e: MouseEvent) => {
      const current = scrollRef.current
      if (!current) return
      isDraggingRef.current = true
      startYRef.current = e.clientY
      scrollTopRef.current = current.scrollTop
      isClickAllowedRef.current = true
      current.style.scrollSnapType = 'none'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const current = scrollRef.current
      if (!current) return
      const deltaY = e.clientY - startYRef.current

      if (isClickAllowedRef.current && Math.abs(deltaY) > CLICK_MOVE_THRESHOLD) {
        isClickAllowedRef.current = false
        setIsDragging(true)
      }

      if (!isClickAllowedRef.current) {
        current.scrollTop = scrollTopRef.current - deltaY
      }
    }

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return
      const current = scrollRef.current
      if (!current) return

      isDraggingRef.current = false
      setIsDragging(false)
      current.style.scrollSnapType = 'y mandatory'
    }

    const ul = scrollRef.current
    if (ul) {
      ul.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      if (ul) ul.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [scrollRef, isClickAllowedRef])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const current = scrollRef.current
      if (!current) return

      const keyDelta: { [key in 'ArrowUp' | 'ArrowLeft' | 'ArrowDown' | 'ArrowRight']?: number } = {
        ArrowUp: -32,
        ArrowLeft: -32,
        ArrowDown: 32,
        ArrowRight: 32,
      }
      const delta = keyDelta[e.key as keyof typeof keyDelta]
      if (delta !== undefined) {
        e.preventDefault()
        isProgrammaticScrollRef.current = true
        isUserInteractingWithSelection.current = true
        current.scrollBy({ top: delta, behavior: 'smooth' })
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scrollRef, isProgrammaticScrollRef])

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
    Object.values(contentRefs.current).forEach((contentEl) => {
      if (!contentEl) return
      const isOverflowing = contentEl.scrollWidth > (contentEl.parentElement?.offsetWidth || 0)
      contentEl.dataset.overflowing = isOverflowing.toString()
    })
  }, [filteredActs, selectedActId])

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

      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onBlur={() => setSearchQuery('')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        placeholder="Search..."
        className={styles.search}
      />

      <ul ref={scrollRef} className={`scrollable ${styles.list}`} onScroll={debouncedUpdateSelected}>
        {filteredActs.length === 0 ? (
          <li className={styles.item}>No results</li>
        ) : (
          filteredActs.map((act) => {
            const isSelected = act.id === selectedActId
            return (
              <li
                key={act.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => handleItemClick(act.id, e)}
                className={styles.item}
                style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
              >
                <span
                  ref={(el) => {
                    contentRefs.current[act.id] = el
                  }}
                  className={`${styles.itemContent} ${isSelected ? styles.selected : ''}`}
                  data-overflowing="false"
                >
                  {act.name}
                </span>
              </li>
            )
          })
        )}
        <li className={styles.spacer} aria-hidden />
      </ul>
    </div>
  )
}
