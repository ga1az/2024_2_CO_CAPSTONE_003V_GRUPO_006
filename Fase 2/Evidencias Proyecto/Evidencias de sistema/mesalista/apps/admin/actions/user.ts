import 'server-only'
import { verifySession } from '@/actions/session'
import { cache } from 'react'
import { SessionPayload } from '@/types/auth'
import { api } from '@mesalista/api'

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    const data = await api.v1.user
      .email({
        email: session.email
      })
      .get()

    if (!data.data?.data.id) {
      throw new Error('User not found')
    }

    const user = data

    return user
  } catch (error) {
    return null
  }
})

export const getUserFromCookie = cache(
  async (): Promise<SessionPayload | null> => {
    const session = await verifySession()
    if (!session) return null

    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      name: session.name,
      store: session.store,
      image: session.image
    }
  }
)
