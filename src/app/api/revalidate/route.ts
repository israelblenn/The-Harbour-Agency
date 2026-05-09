// app/api/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  dedupeRevalidationTargets,
  type RevalidatePathTarget,
} from '@/lib/revalidation-paths'

const isRevalidateType = (value: unknown): value is 'page' | 'layout' =>
  value === 'page' || value === 'layout'

const normalizeRequestTargets = (body: {
  path?: string
  paths?: string[]
  targets?: RevalidatePathTarget[]
}): RevalidatePathTarget[] => {
  if (Array.isArray(body.targets)) {
    return dedupeRevalidationTargets(
      body.targets.map((target) => ({
        path: target.path,
        type: isRevalidateType(target.type) ? target.type : 'page',
      })),
    )
  }

  if (Array.isArray(body.paths)) {
    return dedupeRevalidationTargets(body.paths.map((path) => ({ path, type: 'page' })))
  }

  if (typeof body.path === 'string') {
    return dedupeRevalidationTargets([{ path: body.path, type: 'page' }])
  }

  return []
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    // Use your env variable name
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const targets = normalizeRequestTargets(body)

    if (targets.length === 0) {
      return NextResponse.json(
        { message: 'path, paths, or targets are required' },
        { status: 400 },
      )
    }

    for (const target of targets) {
      revalidatePath(target.path, target.type)
    }

    console.log(
      '[api/revalidate] Revalidated targets.',
      JSON.stringify({
        targetCount: targets.length,
        targets,
      }),
    )

    return NextResponse.json({
      revalidated: true,
      targets,
      now: Date.now(),
    })
  } catch (err) {
    console.error('Error revalidating:', err)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
