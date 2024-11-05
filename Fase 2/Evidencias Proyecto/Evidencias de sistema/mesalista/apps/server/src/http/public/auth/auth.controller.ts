import Elysia, { t } from 'elysia'
import { jwtAccessSetup } from '../../../middlewares/jwt.middleware'
import { signinResponseSchema, signinSchema } from './auth.dto'
import { SwaggerResponses } from '../../../utils'
import { getUserForSignin } from '../../v1/modules/user/user.model'
import { NotFoundError } from '../../../middlewares/error.middleware'
import { password } from 'bun'
import { confirmForgotPassword, forgotPassword } from './auth.model'

export const AuthController = new Elysia({ prefix: '/auth' })
  .use(jwtAccessSetup)
  .model({
    signinSchema: signinSchema
  })
  .post(
    '/signin',
    async function handler({ body, jwtAccess }) {
      const user = await getUserForSignin(body.email)
      if (!user) {
        throw new NotFoundError('Email not found')
      }

      const validPassword = await password.verify(body.password, user.password)

      if (!validPassword) {
        throw new NotFoundError('Email or password is incorrect')
      }

      const accessToken = await jwtAccess.sign({
        userId: user.id,
        email: user.email,
        store: 6,
        name: user.name,
        role: user.role
      })

      return {
        status: 200,
        message: 'Signin successful',
        data: {
          accessToken
        }
      }
    },
    {
      detail: {
        tags: ['Auth'],
        responses: SwaggerResponses(signinResponseSchema)
      },
      body: 'signinSchema'
    }
  )
  .post(
    '/forgot-password',
    async function handler({ body }) {
      const result = await forgotPassword(body.email)
      return {
        status: 200,
        message: 'Email send',
        data: result
      }
    },
    {
      detail: {
        tags: ['Auth'],
        responses: SwaggerResponses(t.Object({ message: t.String() }))
      },
      body: t.Object({
        email: t.String()
      })
    }
  )
  .post(
    '/confirm-forgot-password',
    async function handler({ body }) {
      const result = await confirmForgotPassword(
        body.token,
        body.password,
        body.email
      )
      return {
        status: 200,
        message: 'Password updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['Auth'],
        responses: SwaggerResponses(t.Object({ message: t.String() }))
      },
      body: t.Object({
        token: t.String(),
        password: t.String(),
        email: t.String()
      })
    }
  )
