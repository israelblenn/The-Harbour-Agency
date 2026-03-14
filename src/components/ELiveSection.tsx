'use client'

import styles from '@/styles/ActProfile.module.css'
import type { Act, Elive } from '@/payload-types'
import ActList from '@/components/ActList/ActList'
import SelectedActThumbnail from '@/components/SelectedActThumbnail'

type ELiveSectionProps = {
  elive: Elive
  eLiveActs: Act[]
  internationalActs?: Act[]
}

export default function ELiveSection({ elive, eLiveActs, internationalActs = [] }: ELiveSectionProps) {
  return (
    <>
      {/* Mobile: Show Artists-style layout */}
      <div className="mobile-only">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100svh - 10rem)', // Account for header (6rem) + body padding (4rem)
            overflow: 'hidden',
          }}
        >
          <ActList Acts={[...eLiveActs, ...internationalActs]} hideSearch fillHeight />
          <SelectedActThumbnail acts={[...eLiveActs, ...internationalActs]} />
        </div>
      </div>

      {/* Desktop: Show E-Live info */}
      <div className="desktop-only">
        <div className={styles.container}>
          <h1>{elive.Title}</h1>

          {elive.description && <p className={styles.bio}>{elive.description}</p>}

          {elive.contacts && elive.contacts.length > 0 && (
            <table style={{ alignSelf: 'flex-start', marginTop: 0 }}>
              <tbody>
                {elive.contacts.map(({ id, label, content }) => (
                  <tr key={id}>
                    <td>{label}</td>
                    <td>{content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
