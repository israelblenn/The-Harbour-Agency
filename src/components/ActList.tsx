'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/ActList.module.css'

export default function Actlist() {
  const [sortedActs, setSortedActs] = useState<{ id: string; name: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isDraggingRef = useRef(false)
  const startYRef = useRef(0)
  const scrollTopRef = useRef(0)
  const isClickAllowedRef = useRef(true)

  // FETCH & SORT ACTS
  useEffect(() => {
    async function fetchActs() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=9999`)
      const data = await res.json()
      const acts: { id: string; name: string }[] = data.docs.map((act: { id: string; name: string }) => ({
        id: act.id,
        name: act.name,
      }))

      acts.sort((a, b) => a.name.localeCompare(b.name))
      setSortedActs(acts)
    }

    fetchActs()
  }, [])

  // DRAG TO SCROLL
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
    }

    const ul = scrollRef.current
    if (ul) {
      ul.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      if (ul) {
        ul.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [])

  // NAVIGATE WITH ARROW KEYS
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const current = scrollRef.current
      if (!current) return

      let delta = 0
      const deltaMap = {
        ArrowUp: -32,
        ArrowLeft: -32,
        ArrowDown: 32,
        ArrowRight: 32,
      } as const
      const key = e.key as keyof typeof deltaMap
      delta = deltaMap[key] ?? delta

      if (delta !== 0) {
        e.preventDefault()
        current.scrollBy({ top: delta, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // FORCE SCROLL TO TOP WHILE SEARCHING
  useEffect(() => {
    const currentInput = inputRef.current
    const currentList = scrollRef.current
    if (currentInput && currentList && document.activeElement === currentInput) {
      currentList.scrollTo({ top: 0 })
    }
  }, [searchQuery])

  // JUMP TO ITEM ON CLICK
  function handleItemClick(e: React.MouseEvent<HTMLLIElement>) {
    if (!isClickAllowedRef.current) return
    const current = scrollRef.current
    if (!current) return
    const item = e.currentTarget
    current.scrollTo({ top: item.offsetTop, behavior: 'smooth' })
  }

  // SORT BY SIMILARITY TO QUERY
  const filteredActs = sortedActs
    .map((act) => ({
      ...act,
      score: searchQuery ? similarityScore(searchQuery.toLowerCase(), act.name.toLowerCase()) : 0,
    }))
    .filter((act) => act.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.score - a.score)

  return (
    <div className={styles.container}>
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

      <ul ref={scrollRef} className={`scrollable ${styles.list}`}>
        {filteredActs.length === 0 ? (
          <li className={styles.item} aria-live="polite" onMouseDown={(e) => e.preventDefault()}>
            No results
          </li>
        ) : (
          filteredActs.map((act) => (
            <li
              key={act.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleItemClick}
              className={styles.item}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              {act.name}
            </li>
          ))
        )}
        <li className={styles.spacer} aria-hidden />
      </ul>

      <div className={styles.barCropper} />
      <div className={styles.bar} />
      <div className={styles.fade} />
    </div>
  )
}

// SIMILARITY SCORING FUNCTION
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
