import { insertProductWithPriceSchema } from '@mesalista/database/src/schema'
import { t } from 'elysia'

export const insertProductDTO = t.Omit(insertProductWithPriceSchema, [
  'id',
  'createdAt',
  'updatedAt',
  'isActive',
  'sort',
  'isSoloItem'
])
