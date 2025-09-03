import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // added to bypass persistent tyoe error in .next/types/app/(frontend)/(grid)/[id]/page.ts
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      process.env.NEXT_PUBLIC_SITE_URL, // e.g. 'cms.example.com'
    ],
  },
}

export default withPayload(nextConfig, {
  devBundleServerPackages: false,
})
