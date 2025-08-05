export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import payloadConfig from '@/payload.config'

const ipRequestTimestamps = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60000
const RATE_LIMIT_MAX_REQUESTS = 5

const rateLimiter = (ip: string | null): boolean => {
  if (!ip) {
    console.warn('Could not determine IP for rate limiting.')
    return true
  }

  const now = Date.now()
  const timestamps = ipRequestTimestamps.get(ip) || []

  const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)

  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) return false

  recentTimestamps.push(now)
  ipRequestTimestamps.set(ip, recentTimestamps)

  return true
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  if (!rateLimiter(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const payload = await getPayload({ config: payloadConfig })
  const body = await req.json()
  const { name, email, message, honeypot } = body

  if (honeypot) {
    console.warn('Honeypot field filled, likely a bot submission.')
    return NextResponse.json({ success: true })
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const emailRegex = /\S+@\S+\.\S+/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 })
  }

  if (name.length > 100 || message.length > 5000) {
    return NextResponse.json({ error: 'Input exceeds maximum length.' }, { status: 400 })
  }

  try {
    await payload.sendEmail({
      to: process.env.SEND_TO_ADDRESS,
      from: process.env.SEND_FROM_ADDRESS,
      subject: `New message from ${name}`,
      reply_to: email,
      html: `
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('sendEmail error', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
