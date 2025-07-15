import Image from 'next/image'
import { fetchVaultMedia, safeFetch } from '@/lib/api/payload-cms'
import styles from '@/styles/Vault.module.css'

export default async function Vault() {
  const vault = await safeFetch(fetchVaultMedia)
  if (!vault) return <div>Failed to load content</div>

  return (
    <div className={styles.vault}>
      {vault.map((media) => (
        <figure key={media.id} style={{ margin: 0 }}>
          <Image
            src={media.url!}
            alt={media.filename || 'Vault image'}
            width={media.width!}
            height={media.height!}
            className={styles.image}
            sizes="(max-width: 600px) 100vw, 400px" //!!
          />
        </figure>
      ))}
    </div>
  )
}
