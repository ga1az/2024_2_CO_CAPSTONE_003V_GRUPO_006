import 'server-only'

import type { SessionPayload } from '@/types/auth'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const secretKey = process.env.SECRET
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '7d')
    .sign(key)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256']
    })
    return payload
  } catch (error) {
    return null
  }
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookie = cookies().get('session')?.value
  const session = (await decrypt(cookie)) as SessionPayload

  if (!session?.userId) {
    redirect('/login')
  }

  return {
    userId: Number(session.userId),
    email: session.email,
    role: session.role,
    image: session.image,
    name: session.name,
    store: session.store
  }
}

export async function verifySessionMiddleware(): Promise<SessionPayload | null> {
  const cookie = cookies().get('session')?.value
  const session = (await decrypt(cookie)) as SessionPayload

  if (!session?.userId) {
    return null
  }

  return {
    userId: Number(session.userId),
    email: session.email,
    role: session.role,
    image: session.image,
    name: session.name,
    store: session.store
  }
}

export async function updateSession() {
  const session = cookies().get('session')?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  cookies().set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/'
  })
}

export function deleteSession() {
  cookies().delete('session')
  redirect('/login')
}
