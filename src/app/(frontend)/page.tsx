'use client'

import { useEffect, useRef, useState } from 'react'

const SCROLL_HEIGHT = '32px'
const BACKGROUND_COLOR = '#dfdfdf'

export default function HomePage() {
  const scrollRef = useRef<HTMLUListElement>(null)
  const [sortedActs, setSortedActs] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchActs = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=9999`)
      const data = await res.json()
      const acts = data.docs.map((act: { id: string; name: string }) => ({
        id: act.id,
        name: act.name,
      })) as { id: string; name: string }[]

      const sorted = acts.sort((a, b) => a.name.localeCompare(b.name))
      setSortedActs(sorted)
    }

    fetchActs()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let isDragging = false
    let startY = 0
    let scrollTop = 0

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true
      startY = e.clientY
      scrollTop = el.scrollTop
      el.style.cursor = 'grabbing'
      el.style.userSelect = 'none'
      el.style.scrollSnapType = 'none'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      el.scrollTop = scrollTop - (e.clientY - startY)
    }

    const handleMouseUp = () => {
      isDragging = false
      el.style.cursor = 'grab'
      el.style.removeProperty('user-select')
      el.style.scrollSnapType = 'y mandatory'
    }

    el.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      el.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!scrollRef.current) return

      const scrollAmount = 32
      const direction = e.key.includes('Arrow')
        ? e.key.includes('Up') || e.key.includes('Left')
          ? -scrollAmount
          : scrollAmount
        : 0

      if (direction) {
        e.preventDefault()
        scrollRef.current.scrollBy({ top: direction, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <main>
      <div style={{ position: 'absolute', height: '100%', width: '40rem', left: '-8rem' }}>
        <ul
          ref={scrollRef}
          className="scrollable"
          style={{
            width: '100%',
            position: 'absolute',
            scrollSnapType: 'y mandatory',
            paddingLeft: '8rem',
            listStyle: 'none',
            cursor: 'grab',
          }}
        >
          {sortedActs.map((act) => (
            <li
              key={act.id}
              style={{
                scrollSnapAlign: 'start',
                height: SCROLL_HEIGHT,
                lineHeight: SCROLL_HEIGHT,
                paddingLeft: '1rem',
                boxSizing: 'border-box',
              }}
            >
              {act.name}
            </li>
          ))}
          <li aria-hidden style={{ height: `calc(100% - ${SCROLL_HEIGHT})`, pointerEvents: 'none' }} />
        </ul>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '16rem',
            bottom: 0,
            background: `linear-gradient(180deg, transparent 0%, ${BACKGROUND_COLOR} 100%)`,
          }}
        />
      </div>
      <div style={{ position: 'absolute', background: BACKGROUND_COLOR, height: '0.5rem', width: '32rem' }} />
      <div
        style={{
          position: 'absolute',
          background: BACKGROUND_COLOR,
          height: '3rem',
          top: '0.5rem',
          width: '40rem',
          left: '-8rem',
          mixBlendMode: 'difference',
          pointerEvents: 'none',
        }}
      />
    </main>
  )
}
