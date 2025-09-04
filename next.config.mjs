import path from 'path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // added to bypass persistent tyoe error in .next/types/app/(frontend)/(grid)/[id]/page.ts
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [process.env.NEXT_PUBLIC_SITE_URL],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    config.resolve.alias['@payload-config'] = path.resolve(__dirname, 'src/payload.config.ts')
    return config
  },
}

export default withPayload(nextConfig, {
  devBundleServerPackages: false,
})
