// app/api/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    // Use your env variable name
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { path, paths } = body // Destructure both possible keys

    if (path) {
      // Handle single path revalidation
      revalidatePath(path)
      console.log(`Revalidated single path: ${path}`)
      return NextResponse.json({ revalidated: true, path, now: Date.now() })
    } else if (paths && Array.isArray(paths)) {
      // Handle multiple paths revalidation
      for (const p of paths) {
        revalidatePath(p)
      }
      console.log(`Revalidated multiple paths: ${paths.join(', ')}`)
      return NextResponse.json({ revalidated: true, paths, now: Date.now() })
    } else {
      return NextResponse.json({ message: 'Path or paths are required' }, { status: 400 })
    }
  } catch (err) {
    console.error('Error revalidating:', err)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
