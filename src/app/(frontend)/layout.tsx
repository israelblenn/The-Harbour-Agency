import '@/app/(frontend)/styles.css'
import { SelectedActProvider } from '@/contexts/SelectedActContext'
import { ViewTransitions } from 'next-view-transitions'
import { fetchBranding, safeFetch } from '@/lib/api/payload-cms'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const branding = await safeFetch(fetchBranding, {
    label: 'fetchBranding',
    route: '/(frontend)/layout-metadata',
  })

  let ogImageUrl: string | undefined

  if (branding?.logo && typeof branding.logo !== 'string') {
    const logoMedia = branding.logo as Media
    ogImageUrl = logoMedia.url || undefined
  }

  return {
    title: branding?.title || 'The Harbour Agency',
    description: branding?.description || 'POPULATE !!',
    icons: {
      icon:
        branding?.favicon && typeof branding.favicon !== 'string'
          ? branding.favicon.url || '/favicon.ico'
          : '/favicon.ico',
    },
    openGraph: {
      title: branding?.title || 'The Harbour Agency',
      description: branding?.description || 'POPULATE !!',
      url: process.env.NEXT_PUBLIC_SITE_URL,
      siteName: branding?.title || 'The Harbour Agency',
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: branding?.title || 'The Harbour Agency',
      description: branding?.description || 'POPULATE !!',
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
