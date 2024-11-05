import {
  insertOrgUserSchema,
  updateOrgUserSchema
} from '@mesalista/database/src/schema'
import { t } from 'elysia'

export const updateUserDTO = t.Omit(updateOrgUserSchema, [
  'updatedAt',
  'createdAt',
  'id'
])

export const createUserDTO = t.Omit(insertOrgUserSchema, [
  'id',
  'createdAt',
  'updatedAt'
])
