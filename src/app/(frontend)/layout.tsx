import React from 'react'
import '@/app/(frontend)/styles.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import { SelectedActProvider } from '@/contexts/SelectedActContext'

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
    <html lang="en" className={inter.className}>
      <body>
        <SelectedActProvider>
          <Header />
          {children}
        </SelectedActProvider>
      </body>
    </html>
  )
}
