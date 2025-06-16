'use client'

import ActList from '@/components/ActList'
import ActGrid from '@/components/ActGrid'
import ActProfile from '@/components/ActProfile'
import { SelectedActProvider } from '@/contexts/SelectedActContext'

export default function HomePage() {
  return (
    <SelectedActProvider>
      <main>
        <ActList />
        <ActGrid />
        <ActProfile />
      </main>
    </SelectedActProvider>
  )
}
