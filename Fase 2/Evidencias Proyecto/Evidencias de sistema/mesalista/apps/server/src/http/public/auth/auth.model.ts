import { and, db, desc, eq, gt } from '@mesalista/database'
import { NotFoundError } from '../../../middlewares/error.middleware'
import { getUserByEmail } from '../../v1/modules/user/user.model'
import {
  forgotPasswordTable,
  orgUserTable
} from '@mesalista/database/src/schema'
import { sendEmail } from '@mesalista/email'
import { generateRandomString, sendForgotPasswordHTML } from '../../../utils'

export async function forgotPassword(email: string) {
  const user = await getUserByEmail(email)
  if (!user) {
    throw new NotFoundError('Email not found')
  }
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  // Evitar que se genere otro token si ya existe uno generado hace menos de 5 minutos
  const existingForgotPassword = await db
    .select()
    .from(forgotPasswordTable)
    .where(
      and(
        eq(forgotPasswordTable.email, email),
        eq(forgotPasswordTable.revoked, false),
        gt(forgotPasswordTable.createdAt, fiveMinutesAgo)
      )
    )
    .orderBy(desc(forgotPasswordTable.createdAt))
    .then((result) => result[0] || null)

  if (existingForgotPassword) {
    throw new NotFoundError(
      'You already have a forgot password token, please try again later'
    )
  }

  await db
    .update(forgotPasswordTable)
    .set({ revoked: true })
    .where(eq(forgotPasswordTable.email, email))
    .returning({ id: forgotPasswordTable.id })

  const randomToken = generateRandomString(5)

  const result = await db
    .insert(forgotPasswordTable)
    .values({
      email: user.email,
      token: randomToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })
    .returning({
      id: forgotPasswordTable.id
    })
    .then((result) => result[0])

  if (!result.id) {
    throw new NotFoundError('Failed to create forgot password')
  }

  await sendEmail({
    from: 'MesaLista <noreply@pidesimple.com>',
    to: [user.email],
    subject: 'Password Reset',
    html: sendForgotPasswordHTML(randomToken)
  })

  return 'Email send to ' + user.email
}

export async function confirmForgotPassword(
  token: string,
  password: string,
  email: string
) {
  const existingForgotPassword = await db
    .select()
    .from(forgotPasswordTable)
    .where(
      and(
        eq(forgotPasswordTable.token, token),
        eq(forgotPasswordTable.email, email),
        eq(forgotPasswordTable.revoked, false)
      )
    )
    .then((result) => result)

  if (!existingForgotPassword || existingForgotPassword.length === 0) {
    throw new NotFoundError('Token not found')
  }

  const result = await db
    .update(forgotPasswordTable)
    .set({
      revoked: true
    })
    .where(
      and(
        eq(forgotPasswordTable.token, token),
        eq(forgotPasswordTable.email, email),
        eq(forgotPasswordTable.revoked, false)
      )
    )
    .returning({
      id: forgotPasswordTable.id
    })
    .then((result) => result[0])

  if (!result.id) {
    throw new NotFoundError('Failed to confirm forgot password')
  }

  const newPassword = await Bun.password.hash(password, 'argon2id')

  const userUpdate = await db
    .update(orgUserTable)
    .set({
      password: newPassword
    })
    .where(eq(orgUserTable.email, email))
    .returning({
      id: orgUserTable.id
    })
    .then((result) => result[0])

  if (!userUpdate.id) {
    throw new NotFoundError('Failed to update user password')
  }

  return 'Password updated successfully'
}
