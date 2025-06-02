import { revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  try {
    const { tag, secret } = await req.json()

    if (secret !== process.env.REVALIDATE_SECRET) {
      return new Response('Invalid secret', { status: 401 })
    }

    if (!tag) {
      return new Response('Missing tag', { status: 400 })
    }

    revalidateTag(tag)

    return new Response(`Revalidated tag: ${tag}`, { status: 200 })
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 })
  }
}
