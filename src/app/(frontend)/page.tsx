'use client'

// pages/index.tsx (HomePage)
import { useState } from 'react'
import Actlist from '@/components/ActList'
import ActGrid from '@/components/ActGrid'
import ActProfile from '@/components/ActProfile'

export default function HomePage() {
  const [selectedActId, setSelectedActId] = useState<string>('')

  return (
    <main>
      <Actlist selectedActId={selectedActId} onSelectedActChange={setSelectedActId} />
      <ActGrid />
      <ActProfile actId={selectedActId} />
    </main>
  )
}
