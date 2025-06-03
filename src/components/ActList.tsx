'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/ActList.module.css'

export default function Actlist() {
  const [sortedActs, setSortedActs] = useState<{ id: string; name: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const scrollRef = useRef<HTMLUListElement>(null)
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

      if (!isClickAllowedRef.current) current.scrollTop = scrollTopRef.current - deltaY
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

  // NAVIGATE WITH ARROWS
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

  // JUMP TO ITEM ON CLICK
  function handleItemClick(e: React.MouseEvent<HTMLLIElement>) {
    if (!isClickAllowedRef.current) return
    const current = scrollRef.current
    if (!current) return
    const item = e.currentTarget
    current.scrollTo({ top: item.offsetTop, behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      <ul ref={scrollRef} className={`${styles.list} scrollable`}>
        {sortedActs.map((act) => (
          <li
            key={act.id}
            onClick={handleItemClick}
            className={styles.item}
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
          >
            {act.name}
          </li>
        ))}
        <li className={styles.spacer} aria-hidden />
      </ul>

      <div className={styles.barCropper} />
      <div className={styles.bar} />
      <div className={styles.fade} />
    </div>
  )
}
