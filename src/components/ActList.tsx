'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import styles from '@/styles/ActList.module.css'
import { useSelectedAct } from '@/contexts/SelectedActContext'

interface Act {
  id: string
  name: string
}

export default function Actlist() {
  const [sortedActs, setSortedActs] = useState<Act[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isDraggingRef = useRef(false)
  const startYRef = useRef(0)
  const scrollTopRef = useRef(0)
  const isClickAllowedRef = useRef(true)
  const scrollTimeoutRef = useRef<number | null>(null)
  const isProgrammaticScrollRef = useRef(false)
  const lastInternalSelectedActIdRef = useRef<string | null>(null)
  const spacerClassName = styles.spacer

  const { selectedActId, setSelectedActId } = useSelectedAct()

  const filteredActs = useMemo(() => {
    return sortedActs
      .map((act) => ({
        ...act,
        score: searchQuery ? similarityScore(searchQuery.toLowerCase(), act.name.toLowerCase()) : 0,
      }))
      .filter((act) => act.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.score - a.score)
  }, [sortedActs, searchQuery])

  useEffect(() => {
    async function fetchActs() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=9999&sort=name&depth=0`)
      const data = await res.json()
      const acts: Act[] = data.docs.map((act: Act) => ({
        id: act.id,
        name: act.name,
      }))
      setSortedActs(acts)
    }
    fetchActs()
  }, [])

  useEffect(() => {
    if (filteredActs.length > 0 && !selectedActId) {
      const firstActId = filteredActs[0].id
      setSelectedActId(firstActId)
      lastInternalSelectedActIdRef.current = firstActId
    }
  }, [filteredActs, selectedActId, setSelectedActId])

  // Scroll to externally selected item
  useEffect(() => {
    if (selectedActId === lastInternalSelectedActIdRef.current) {
      lastInternalSelectedActIdRef.current = null
      return
    }

    const list = scrollRef.current
    if (!list || !selectedActId) return

    const index = filteredActs.findIndex((act) => act.id === selectedActId)
    if (index === -1) return

    const items = list.querySelectorAll(`li:not(.${spacerClassName})`)
    if (items.length === 0) return
    const itemHeight = items[0].clientHeight

    isProgrammaticScrollRef.current = true
    list.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth',
    })

    const timeoutId = setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [selectedActId, filteredActs, spacerClassName])

  useEffect(() => {
    const CLICK_MOVE_THRESHOLD = 5
    function handleMouseDown(e: MouseEvent) {
      const current = scrollRef.current
      if (!current) return
      isDraggingRef.current = true
      startYRef.current = e.clientY
      scrollTopRef.current = current.scrollTop
      isClickAllowedRef.current = true
      current.style.scrollSnapType = 'none'
    }

    function handleMouseMove(e: MouseEvent) {
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

    function handleMouseUp() {
      if (!isDraggingRef.current) return
      const current = scrollRef.current
      if (!current) return

      isDraggingRef.current = false
      setIsDragging(false)
      current.style.scrollSnapType = 'y mandatory'
      updateSelected()
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
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
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
        current.scrollBy({ top: delta, behavior: 'smooth' })
        setTimeout(() => {
          updateSelected()
          isProgrammaticScrollRef.current = false
        }, 0) // !! was 200
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const currentInput = inputRef.current
    const currentList = scrollRef.current
    if (currentInput && currentList && document.activeElement === currentInput) {
      isProgrammaticScrollRef.current = true
      currentList.scrollTo({ top: 0 })
      updateSelected()
      setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, 100)
    }
  }, [searchQuery])

  function handleItemClick(actId: string, e: React.MouseEvent<HTMLLIElement>) {
    if (!isClickAllowedRef.current) return
    setSelectedActId(actId)
    lastInternalSelectedActIdRef.current = actId
    isProgrammaticScrollRef.current = true
    const item = e.currentTarget
    item.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 200)
  }

  function handleScroll() {
    if (isProgrammaticScrollRef.current) return
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      updateSelected()
    }, 100)
  }

  function updateSelected() {
    const list = scrollRef.current
    if (!list) return
    const scrollTop = list.scrollTop
    const items = list.querySelectorAll(`li:not(.${spacerClassName})`)
    if (items.length === 0) return
    const itemHeight = items[0].clientHeight
    const index = Math.round(scrollTop / itemHeight)
    const act = filteredActs[index]
    if (act) {
      setSelectedActId(act.id)
      lastInternalSelectedActIdRef.current = act.id
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.barCropper} />
      <div className={styles.bar} />
      <div className={styles.fade} />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onBlur={() => setSearchQuery('')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        placeholder="Search..."
        className={styles.search}
      />

      <ul ref={scrollRef} className={`scrollable ${styles.list}`} onScroll={handleScroll}>
        {filteredActs.length === 0 ? (
          <li className={styles.item} aria-live="polite" onMouseDown={(e) => e.preventDefault()}>
            No results
          </li>
        ) : (
          filteredActs.map((act) => (
            <li
              key={act.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => handleItemClick(act.id, e)}
              className={styles.item}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              {act.name}
            </li>
          ))
        )}
        <li className={styles.spacer} aria-hidden />
      </ul>
    </div>
  )
}

function similarityScore(query: string, target: string) {
  if (target.startsWith(query)) return 100
  let score = 0
  let i = 0
  let j = 0
  while (i < query.length && j < target.length) {
    if (query[i] === target[j]) {
      score++
      i++
    }
    j++
  }
  return score
}
