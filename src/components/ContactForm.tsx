'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    })

    setStatus(res.ok ? 'success' : 'error')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
      <input
        type="email"
        name="email"
        placeholder="Your email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <textarea name="message" placeholder="Your message" value={formData.message} onChange={handleChange} required />
      <button type="submit">Send</button>
      {status === 'success' && <p>Message sent!</p>}
      {status === 'error' && <p>Something went wrong.</p>}
    </form>
  )
}
