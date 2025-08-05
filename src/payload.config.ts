import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { resendAdapter } from '@payloadcms/email-resend'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
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
  db: mongooseAdapter({ url: process.env.DATABASE_URI || '' }),
  sharp,
  plugins: [payloadCloudPlugin()],
  email: resendAdapter({
    defaultFromAddress: process.env.SEND_FROM_ADDRESS || '',
    defaultFromName: 'Contact Form',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
})
