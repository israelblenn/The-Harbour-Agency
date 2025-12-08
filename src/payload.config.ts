import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'
import path from 'path'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { About } from '@/collections/About'
import { Acts } from '@/collections/Acts'
import { Contact } from '@/collections/Contact'
import { Branding } from '@/collections/Branding'
import { Legal } from '@/collections/Legal'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  globals: [About, Contact, Branding, Legal],
  collections: [Acts, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    // Optimize connection pooling for M0 cluster
    connectOptions: {
      maxPoolSize: 5, // Limit concurrent connections
      minPoolSize: 1, // Maintain at least 1 connection
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
      socketTimeoutMS: 45000, // Close connections after 45s of inactivity
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET || '',
        },
        region: 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),
  ],
  email: resendAdapter({
    defaultFromAddress: process.env.SEND_FROM_ADDRESS || '',
    defaultFromName: 'Contact Form',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
})
