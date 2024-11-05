import { Elysia, t } from 'elysia'
import { selectOrgUserSchema } from '@mesalista/database/src/schema'
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUser
} from './user.model'
import { isAuthenticated } from '../../../../middlewares/jwt.middleware'
import { SwaggerResponses } from '../../../../utils'
import { createUserDTO, updateUserDTO } from './user.dto'

export const UserController = new Elysia({ prefix: '/user' })
  .use(isAuthenticated)
  .model({
    createUser: createUserDTO,
    updateUser: updateUserDTO
  })

  // Get user by id
  .get(
    '/:id',
    async function handler({ params }) {
      const result = await getUserById(params.id)

      return {
        status: 200,
        message: 'User found',
        data: result
      }
    },
    {
      detail: {
        tags: ['User'],
        responses: SwaggerResponses(selectOrgUserSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get user by email
  .get(
    '/email/:email',
    async function handler({ params }) {
      const result = await getUserByEmail(params.email)

      return {
        status: 200,
        message: 'User found',
        data: result
      }
    },
    {
      detail: {
        tags: ['User'],
        responses: SwaggerResponses(selectOrgUserSchema)
      },
      params: t.Object({ email: t.String() })
    }
  )

  // Create new user
  .post(
    '',
    async function handler({ body }) {
      const result = await createUser(body)

      return {
        status: 201,
        message: 'User created',
        data: result
      }
    },
    {
      detail: {
        tags: ['User'],
        responses: SwaggerResponses(selectOrgUserSchema)
      },
      body: 'createUser'
    }
  )

  // Update user
  .put(
    '/:id',
    async function handler({ params, body }) {
      const result = await updateUser(params.id, body)

      return {
        status: 200,
        message: 'User updated',
        data: result
      }
    },
    {
      detail: {
        tags: ['User'],
        responses: SwaggerResponses(selectOrgUserSchema)
      },
      params: t.Object({ id: t.Number() }),
      body: 'updateUser'
    }
  )

  // Delete user
  .delete(
    '/:id',
    async function handler({ params }) {
      const result = await deleteUser(params.id)

      return {
        status: 200,
        message: 'User deleted',
        data: result
      }
    },
    {
      detail: {
        tags: ['User'],
        responses: SwaggerResponses(selectOrgUserSchema)
      },
      params: t.Object({ id: t.Number() })
    }
  )

  // Get all users
  .get(
    '',
    async function handler({}) {
      const result = await getAllUsers()

      return {
        status: 200,
        message: 'Users found',
        data: result
      }
    },
    {
      detail: {
        tags: ['User'],
        responses: SwaggerResponses(selectOrgUserSchema)
      }
    }
  )
