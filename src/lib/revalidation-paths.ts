export type RevalidatePathTarget = {
  path: string
  type?: 'page' | 'layout'
}

const FRONTEND_BASE_PATHS: RevalidatePathTarget[] = [
  { path: '/', type: 'layout' },
  { path: '/artists', type: 'page' },
  { path: '/e-live', type: 'page' },
]

export const REVALIDATION_PATHS = {
  frontendBase: FRONTEND_BASE_PATHS,
} as const

export const buildActRevalidationTargets = (actId?: string | null): RevalidatePathTarget[] => {
  if (!actId) return [...FRONTEND_BASE_PATHS]

  return [...FRONTEND_BASE_PATHS, { path: `/${actId}`, type: 'page' }]
}

export const dedupeRevalidationTargets = (
  targets: RevalidatePathTarget[],
): RevalidatePathTarget[] => {
  const map = new Map<string, RevalidatePathTarget>()

  for (const target of targets) {
    const path = target.path?.trim()
    if (!path) continue

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const normalizedType = target.type ?? 'page'
    map.set(`${normalizedType}:${normalizedPath}`, { path: normalizedPath, type: normalizedType })
  }

  return [...map.values()]
}
