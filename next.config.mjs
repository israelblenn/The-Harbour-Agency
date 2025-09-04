import path from 'path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const baseConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Set our preference here
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

// Let withPayload do its thing
const finalConfig = withPayload(baseConfig, {
  devBundleServerPackages: false,
})

// IMPORTANT: Force unoptimized images AFTER withPayload has run,
// overriding any changes it might have made.
finalConfig.images.unoptimized = true

export default finalConfig
