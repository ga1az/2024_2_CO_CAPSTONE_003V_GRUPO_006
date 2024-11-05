import { t, TSchema } from 'elysia'

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface QueryParams {
  select?: string
  orderBy?: string
  filters?: string
  [key: string]: any // Para permitir otros parámetros de consulta
}

export interface AdvancedFilters {
  select?: string[]
  orderBy?: {
    column: string
    direction: 'asc' | 'desc'
  }
  filters?: {
    [column: string]: {
      operator: 'eq' | 'like' | 'gt' | 'lt' | 'gte' | 'lte'
      value: string | number
    }
  }
}

export interface PaginationResult<T> {
  data: T[]
  next: string | null
  prev: string | null
  totalItems: number
  currentItems: number
}

export const createPaginationSchema = <T extends TSchema>(itemSchema: T) =>
  t.Object({
    data: t.Array(itemSchema),
    pagination: t.Object({
      next: t.Optional(t.String()),
      prev: t.Optional(t.String()),
      totalItems: t.Number(),
      currentItems: t.Number()
    })
  })

export interface QrCodeSchema {
  tableId: number
  identifier: string
  idStore: number
}
