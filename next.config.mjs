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
    unoptimized: true, // disable sharp completely
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [process.env.NEXT_PUBLIC_SITE_URL],
  },
  webpack: (config) => {
    // Aliases
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    config.resolve.alias['@payload-config'] = path.resolve(__dirname, 'src/payload.config.ts')

    // Bypass Next's image loader for Payload's bundled assets
    config.module.rules.unshift({
      test: /\.(png|jpe?g|webp|gif|svg)$/i,
      include: [path.resolve(__dirname, 'node_modules/@payloadcms/ui/dist/assets')],
      type: 'asset/resource', // emit file URLs instead of processing with sharp
    })

    return config
  },
}

// Wrap with Payload
const finalConfig = withPayload(baseConfig, {
  devBundleServerPackages: false,
})

// Force unoptimized after withPayload
finalConfig.images.unoptimized = true

export default finalConfig
