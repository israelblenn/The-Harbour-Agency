import type { CollectionBeforeChangeHook } from 'payload'
import sharp from 'sharp'

/** Tiny inline LQIP for next/image placeholder="blur". ~200–500B per image. */
export const generateBlurDataURL: CollectionBeforeChangeHook = async ({ data, req }) => {
  const file = req.file
  if (!file?.data || !file.mimetype?.startsWith('image/')) return data

  try {
    const buffer = await sharp(file.data)
      .rotate()
      .resize(16, 16, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer()

    data.blurDataURL = `data:image/webp;base64,${buffer.toString('base64')}`
  } catch {
    // ponytail: skip LQIP if sharp can't decode (e.g. unsupported format); pulse fallback covers it
  }

  return data
}
