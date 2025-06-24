'use client'

import { useState } from 'react'
import ActList from '@/components/ActList'
import ActGrid from '@/components/ActGrid'
import ActProfile from '@/components/ActProfile'
import { SelectedActProvider } from '@/contexts/SelectedActContext'

interface ClientHomePageProps {
  initialActs: Array<{
    id: string
    name: string
    photo?: { url: string }
  }>
}

export default function ClientHomePage({ initialActs }: ClientHomePageProps) {
  // Maintain acts in client state (optional)
  const [acts] = useState(initialActs)

  return (
    <SelectedActProvider>
      <main>
        <ActList Acts={acts} />
        <ActGrid
          initialActs={acts.map((act) => ({
            ...act,
            photo: act.photo ?? { url: '' },
          }))}
        />
        <ActProfile />
      </main>
    </SelectedActProvider>
  )
}
