'use client'

import React from 'react'
import styles from '@/styles/ActList.module.css'

interface ActListSearchProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}

export default function ActListSearch({ inputRef, searchQuery, setSearchQuery }: ActListSearchProps) {
  return (
    <input
      ref={inputRef}
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onBlur={() => setSearchQuery('')}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      placeholder="Search..."
      className={styles.search}
    />
  )
}
