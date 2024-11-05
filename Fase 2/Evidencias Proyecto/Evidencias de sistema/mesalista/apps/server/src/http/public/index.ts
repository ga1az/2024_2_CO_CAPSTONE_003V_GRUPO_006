import Elysia from 'elysia'
import { AuthController } from './auth/auth.controller'
import { StoreController } from './store/store.controller'
import { SessionController } from './session/session.controller'

export const httpPublic = new Elysia({ prefix: '/public' })
  .use(AuthController)
  .use(StoreController)
  .use(SessionController)
