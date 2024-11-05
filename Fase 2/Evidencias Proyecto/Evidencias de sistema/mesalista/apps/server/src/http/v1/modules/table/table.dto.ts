import {
  insertTableSchema,
  updateTableSchema
} from '@mesalista/database/src/schema'
import { t } from 'elysia'

export const updateTableDTO = t.Omit(updateTableSchema, [
  'idStore',
  'updatedAt',
  'createdAt',
  'id'
])

export const insertTableDTO = t.Omit(insertTableSchema, [
  'idStore',
  'updatedAt',
  'createdAt',
  'id'
])
