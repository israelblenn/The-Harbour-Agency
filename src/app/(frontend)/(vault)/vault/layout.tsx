import React from 'react'
import '@/app/(frontend)/styles.css'
import Header from '@/components/Header'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="redder">
      <body className="scrollable" style={{ scrollbarWidth: 'auto' }}>
        <Header />
        {children}
      </body>
    </html>
  )
}
