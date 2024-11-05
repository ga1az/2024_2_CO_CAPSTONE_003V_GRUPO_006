import { t, Static } from 'elysia'

export const JWTPayloadSchema = t.Object({
  userId: t.Number(),
  email: t.String(),
  store: t.Number(),
  name: t.String(),
  role: t.String(),
  expiresAt: t.Optional(t.Date())
})

export type JWTPayload = Omit<Static<typeof JWTPayloadSchema>, 'expiresAt'> & {
  expiresAt?: string
}
