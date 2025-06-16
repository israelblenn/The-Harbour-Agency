'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import RGL, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

type Act = { id: string; name: string; photo?: { url: string } }

const PAGE_SIZE = 20
const GAP = 16
const MIN_ITEM_WIDTH = 150

export default function ActImageGrid({ selectedActId }: { selectedActId: string }) {
  const [acts, setActs] = useState<Act[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 1) Fetch paging
  const fetchActs = async (page: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=${PAGE_SIZE}&page=${page}&sort=name`)
      if (!res.ok) throw new Error(`Failed to fetch acts: ${res.statusText}`)
      const data = await res.json()
      setActs((prev) => [...prev, ...data.docs])
      setHasNextPage(data.hasNextPage)
    } catch (err) {
      setError((err as Error)?.message || 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActs(pageNum)
  }, [pageNum])
  useEffect(() => {
    if (hasNextPage && !loading) setPageNum((p) => p + 1)
  }, [acts.length])

  // 2) Measure container width
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // 3) Compute number of columns and square cell size
  const numColumns = Math.max(1, Math.floor((containerWidth + GAP) / (MIN_ITEM_WIDTH + GAP)))
  const cellSize = (containerWidth - GAP * (numColumns - 1)) / numColumns

  // 4) Build a *simple* layout: each item in order,
  //    selected one is w=2,h=2; collisions will auto-push later items.
  const layout: Layout[] = acts.map((act, idx) => {
    const isSel = act.id === selectedActId
    return {
      i: act.id,
      x: idx % numColumns,
      y: Math.floor(idx / numColumns),
      w: isSel ? 2 : 1,
      h: isSel ? 2 : 1,
      static: true,
    }
  })

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          width: 'calc(100vw - 128rem)',
          height: '100vh',
          top: 0,
          paddingTop: '24rem',
          overflow: 'auto',
          willChange: 'transform',
        }}
        className="scrollable"
      >
        <RGL
          layout={layout}
          cols={numColumns}
          rowHeight={cellSize}
          width={containerWidth}
          margin={[GAP, GAP]}
          compactType="vertical" // ← let it push collisions down
          preventCollision={false} // ← allow auto-packing
          isDraggable={false}
          isResizable={false}
          useCSSTransforms={true}
        >
          {acts.map((act) => (
            <div
              key={act.id}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                border: act.id === selectedActId ? '2px solid red' : 'none',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <Image
                src={act.photo?.url || '/placeholder.jpg'}
                alt={act.name}
                fill
                style={{ objectFit: 'cover', willChange: 'transform' }}
              />
            </div>
          ))}
        </RGL>
      </div>

      {loading && <div style={{ padding: '16px' }}>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  )
}
