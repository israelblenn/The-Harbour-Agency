import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
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
