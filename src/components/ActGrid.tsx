'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Image from 'next/image'

type Act = { id: string; name: string; photo?: { url: string } }

const PAGE_SIZE = 20
const GAP = 16
const ASPECT_RATIO = 1
const MIN_ITEM_WIDTH = 150

export default function ActImageGrid() {
  const [acts, setActs] = useState<Act[]>([])
  const [pageNum, setPageNum] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const numColumns = Math.max(1, Math.floor((containerWidth + GAP) / (MIN_ITEM_WIDTH + GAP)))
  const itemWidth = (containerWidth - GAP * (numColumns - 1)) / numColumns
  const itemHeight = itemWidth * ASPECT_RATIO

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(acts.length / numColumns) + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + GAP,
    overscan: 5,
  })

  const fetchActs = useCallback(async (page: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/acts?limit=${PAGE_SIZE}&page=${page}`)
      if (!res.ok) throw new Error(`Failed to fetch acts: ${res.statusText}`)
      const data = await res.json()
      setActs((prev) => [...prev, ...data.docs])
      setHasNextPage(data.hasNextPage)
    } catch (err) {
      setError((err as Error)?.message || 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActs(pageNum)
  }, [fetchActs, pageNum])

  useEffect(() => {
    if (!parentRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(parentRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems()
    const lastItem = virtualItems[virtualItems.length - 1]
    if (hasNextPage && !loading && lastItem && lastItem.index >= Math.ceil(acts.length / numColumns) - 1) {
      setPageNum((p) => p + 1)
    }
  }, [acts.length, hasNextPage, loading, numColumns, rowVirtualizer])

  useEffect(() => {
    rowVirtualizer.measure()
  }, [itemHeight, rowVirtualizer])

  const renderRow = (virtualRow: ReturnType<typeof rowVirtualizer.getVirtualItems>[number]) => {
    const startIndex = virtualRow.index * numColumns
    const endIndex = Math.min(startIndex + numColumns, acts.length)

    if (startIndex >= acts.length) return <div key={`loader-${virtualRow.index}`}>{loading ? 'Loading...' : ''}</div>

    return (
      <div
        key={`row-${virtualRow.index}`}
        style={{
          position: 'absolute',
          width: '100%',
          display: 'grid',
          height: itemHeight,
          translate: `0 ${virtualRow.start}px`,
          gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
          gap: `${GAP}px`,
        }}
      >
        {acts.slice(startIndex, endIndex).map((act) => (
          <div key={act.id} style={{ position: 'relative' }}>
            <Image src={act.photo?.url || '/placeholder.jpg'} alt={act.name} fill style={{ objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="scrollable"
      ref={parentRef}
      style={{ height: '100vh', margin: '-24rem 72rem 0 40rem', paddingTop: '24rem' }}
    >
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(renderRow)}
      </div>
      {error && <div>Error: {error}</div>}
    </div>
  )
}
