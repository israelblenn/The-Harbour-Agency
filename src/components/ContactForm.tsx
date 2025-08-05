'use client'

import { useState } from 'react'
import SendButton from './SendButton'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: '',
  })
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', message: '', honeypot: '' })
      } else {
        setStatus('error')
      }
    } catch (_) {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      <label>Email Address</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      <label>Message</label>
      <textarea name="message" value={formData.message} onChange={handleChange} required />

      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        style={{
          display: 'none',
          position: 'absolute',
          left: '-5000px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <SendButton isSubmitting={isSubmitting} isSuccess={status === 'success'} />
      {status === 'error' && <p>Something went wrong. Please try again.</p>}
    </form>
  )
}
