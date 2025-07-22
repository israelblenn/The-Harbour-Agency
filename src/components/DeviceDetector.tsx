// components/DeviceDetector.tsx
'use client'

import { useState, useEffect } from 'react'

export default function DeviceDetector({
  desktopComponent,
  // Make mobileComponent optional and default to null
  mobileComponent = null,
}: {
  desktopComponent: React.ReactNode
  mobileComponent?: React.ReactNode | null // Allow null
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      // You can adjust this breakpoint (e.g., 768px, 1024px) based on your definition of 'mobile'
      setIsMobile(window.innerWidth < 768)
    }

    handleResize() // Set initial value on mount
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (isMobile) {
    return <>{mobileComponent}</> // This will render null if mobileComponent is null
  } else {
    return <>{desktopComponent}</>
  }
}
