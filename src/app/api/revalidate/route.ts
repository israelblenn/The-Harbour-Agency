// app/api/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  // 1. Get the secret token from the request
  const secret = request.nextUrl.searchParams.get('secret')

  // 2. Check if the secret token is valid
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    // 3. Get the path to revalidate from the request body
    const body = await request.json()
    const path = body.path

    if (!path) {
      return NextResponse.json({ message: 'Path is required' }, { status: 400 })
    }

    // 4. Call the revalidatePath function
    revalidatePath(path)

    console.log(`Revalidated path: ${path}`)
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    console.error('Error revalidating:', err)
    // If there was an error, return a 500 error
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
