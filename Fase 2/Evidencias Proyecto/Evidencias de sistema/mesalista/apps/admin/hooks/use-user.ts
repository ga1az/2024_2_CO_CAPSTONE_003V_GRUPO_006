import { useEffect, useState } from 'react'
import { SessionPayload } from '@/types/auth'

export function useUser() {
  const [user, setUser] = useState<SessionPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        const userData = await response.json()
        setUser(userData)
        setError(null)
      } catch (err) {
        console.error('Error fetching user:', err)
        setUser(null)
        setError(err instanceof Error ? err : new Error('Failed to fetch user'))
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}
