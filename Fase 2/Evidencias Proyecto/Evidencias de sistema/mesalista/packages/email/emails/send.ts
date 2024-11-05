import { Resend } from 'resend'
import { env } from '../env'

export const resend = new Resend(env.RESEND_API_KEY)

export interface Emails {
  react: React.JSX.Element
  subject: string
  to: string[]
  from: string
}

export interface EmailHtml {
  html: string
  subject: string
  to: string[]
  from: string
}

export const sendEmail = async (email: Emails | EmailHtml) => {
  await resend.emails.send(email)
}
