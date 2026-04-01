import 'server-only'
import config from '@payload-config'
import { getPayload } from 'payload'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>

declare global {
  // eslint-disable-next-line no-var
  var __payloadClient: PayloadClient | undefined
  // eslint-disable-next-line no-var
  var __payloadClientPromise: Promise<PayloadClient> | undefined
}

export async function getPayloadClient(): Promise<PayloadClient> {
  if (globalThis.__payloadClient) {
    return globalThis.__payloadClient
  }

  if (!globalThis.__payloadClientPromise) {
    globalThis.__payloadClientPromise = getPayload({ config }).then((client) => {
      globalThis.__payloadClient = client
      return client
    })
  }

  return globalThis.__payloadClientPromise
}
