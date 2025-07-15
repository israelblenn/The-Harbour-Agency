import ClearSelection from '@/components/ClearSelection'
import type { Contact } from '@/payload-types'
import styles from '@/styles/Contact.module.css'
import ContactForm from '@/components/ContactForm'
import { fetchContact, safeFetch } from '@/lib/api/payload-cms'

export default async function Contact() {
  const contact = await safeFetch(fetchContact)
  if (!contact) return <div>Sorry, something went wrong loading this data.</div>

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
