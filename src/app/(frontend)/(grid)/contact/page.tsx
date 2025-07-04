import ClearSelection from '@/components/ClearSelection'
import type { Contact } from '@/payload-types'
import styles from '@/styles/Contact.module.css'
import ContactForm from '@/components/ContactForm'

export default async function Contact() {
  let contact: Contact | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/globals/contact`)
    if (!res.ok) throw new Error('Failed to fetch data')
    contact = (await res.json()) as Contact
  } catch (err) {
    console.error('Failed to fetch data', err)
    return <div>Failed to load content</div>
  }

  if (!contact) return <div>Loading...</div>

  return (
    <>
      <ClearSelection />
      <h2 style={{ fontWeight: 500, marginBottom: '5rem' }}>Get in touch</h2>
      <ContactForm />
      <div className={styles.methods}>
        <ul className={styles.labels}>
          <div>{contact.contacts?.map(({ id, label }) => <li key={id}>{label}</li>)}</div>
          <div>{contact.adresses?.map(({ id, label }) => <li key={id}>{label}</li>)}</div>
        </ul>
        <ul>
          <div>{contact.contacts?.map(({ id, content }) => <li key={id}>{content}</li>)}</div>
          <div>{contact.adresses?.map(({ id, content }) => <li key={id}>{content}</li>)}</div>
        </ul>
      </div>
    </>
  )
}
