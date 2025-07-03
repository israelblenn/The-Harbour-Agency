export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import payloadConfig from '@/payload.config'

export async function POST(req: Request) {
  const payload = await getPayload({ config: payloadConfig })
  const { name, email, message } = await req.json()

  try {
    await payload.sendEmail({
      to: 'israelblenn@gmail.com',
      subject: `New message from ${name}`,
      html: `
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('sendEmail error', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
