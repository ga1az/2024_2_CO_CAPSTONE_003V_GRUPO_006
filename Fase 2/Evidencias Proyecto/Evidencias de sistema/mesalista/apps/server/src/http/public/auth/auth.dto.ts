import { Static, t } from 'elysia'

export const signinSchema = t.Object({
  email: t.String(),
  password: t.String()
})

export type SigninSchema = Static<typeof signinSchema>

export const signinResponseSchema = t.Object({
  accessToken: t.String()
})

export type SigninResponseSchema = Static<typeof signinResponseSchema>
