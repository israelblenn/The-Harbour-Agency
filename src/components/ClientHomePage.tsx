'use client'

import { useState } from 'react'
import ActList from '@/components/ActList'
import ActGrid from '@/components/ActGrid'
import ActProfile from '@/components/ActProfile'

interface ClientHomePageProps {
  initialActs: Array<{
    id: string
    name: string
    photo?: { url: string }
  }>
}

export default function ClientHomePage({ initialActs }: ClientHomePageProps) {
  const [acts] = useState(initialActs)

  return (
    <>
      <ActList Acts={acts} />
      <ActGrid
        initialActs={acts.map((act) => ({
          ...act,
          photo: act.photo ?? { url: '' },
        }))}
      />
      <ActProfile />
    </>
  )
}
