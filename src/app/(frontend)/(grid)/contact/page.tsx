import ClearSelection from '@/components/ClearSelection'
import type { Contact } from '@/payload-types'
import styles from '@/styles/Contact.module.css'
import ContactForm from '@/components/ContactForm'
import { fetchContact, safeFetch } from '@/lib/api/payload-cms'

// Cache Contact page for 1 hour
export const revalidate = 3600

export default async function Contact() {
  const contact = await safeFetch(fetchContact)
  if (!contact) return <div>Sorry, something went wrong loading this data.</div>

  return (
    <>
      <ClearSelection />
      <h2 className={styles.heading}> Get in touch</h2>
      <ContactForm />
      <div>
        <table>
          <tbody>
            {contact.contacts?.map(({ id, label, content }) => (
              <tr key={id}>
                <td>{label}</td>
                <td>{content}</td>
              </tr>
            ))}
          </tbody>
          <tbody>
            {contact.addresses?.map(({ id, label, content }) => (
              <tr key={id}>
                <td>{label}</td>
                <td>{content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
