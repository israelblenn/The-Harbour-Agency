import React from 'react'
import '@/app/(frontend)/styles.css'
import { Inter } from 'next/font/google'
import { SelectedActProvider } from '@/contexts/SelectedActContext'
import { ViewTransitions } from 'next-view-transitions'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  description: 'POPULATE !!',
  title: 'The Harbour Agency',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <ViewTransitions>
      <SelectedActProvider>{children}</SelectedActProvider>
    </ViewTransitions>
  )
}
