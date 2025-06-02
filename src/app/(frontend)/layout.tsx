import React from 'react'
import './styles.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'

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
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
