import { jwt } from '@ga1az/elysiajs-jwt'
import { Elysia, t } from 'elysia'
import { env } from '../../env'
import { JWTPayloadSchema } from '../http/public/auth/auth.types'
import { AuthError } from './error.middleware'

export const basicAuthModel = new Elysia().model({
  basicAuthModel: t.Object({
    email: t.String(),
    password: t.String()
  })
})

const key = new TextEncoder().encode(env.SECRET)

export const jwtAccessSetup = new Elysia({
  name: 'jwtAccess'
}).use(
  jwt({
    name: 'jwtAccess',
    schema: JWTPayloadSchema,
    secret: key,
    exp: env.JWT_EXPIRES_IN
  })
)

export const isAuthenticated = new Elysia()
  .use(jwtAccessSetup)
  .derive(
    { as: 'scoped' },
    async ({ jwtAccess, set, request: { headers } }) => {
      const authorization = headers.get('authorization')
      if (!authorization) {
        set.status = 401
        throw new AuthError('No token provided')
      }
      const token = authorization.split(' ')[1]
      if (!token) {
        set.status = 401
        throw new AuthError('Invalid Token')
      }
      const payload = await jwtAccess.verify(token)
      if (!payload) {
        set.status = 401
        throw new AuthError('Invalid Token')
      }
      return {
        payload
      }
    }
  )
