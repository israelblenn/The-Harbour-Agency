import '@/app/(frontend)/styles.css'
import { SelectedActProvider } from '@/contexts/SelectedActContext'
import { ViewTransitions } from 'next-view-transitions'
import { fetchBranding, safeFetch } from '@/lib/api/payload-cms'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

export const revalidate = 3600

const DEFAULT_TITLE = 'The Harbour Agency'
const DEFAULT_DESCRIPTION =
  "Australia's largest booking agency since 1978. Representing established, mid-level and developing talent across metropolitan and regional Australia."

export async function generateMetadata(): Promise<Metadata> {
  const branding = await safeFetch(fetchBranding, {
    label: 'fetchBranding',
    route: '/(frontend)/layout-metadata',
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const title = branding?.title || DEFAULT_TITLE
  const description = branding?.description || DEFAULT_DESCRIPTION

  let ogImageUrl: string | undefined

  if (branding?.logo && typeof branding.logo !== 'string') {
    const logoMedia = branding.logo as Media
    ogImageUrl = logoMedia.url || undefined
  }

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title,
    description,
    icons: {
      icon:
        branding?.favicon && typeof branding.favicon !== 'string'
          ? branding.favicon.url || '/favicon.ico'
          : '/favicon.ico',
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: title,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <ViewTransitions>
      <SelectedActProvider>{children}</SelectedActProvider>
    </ViewTransitions>
  )
}
