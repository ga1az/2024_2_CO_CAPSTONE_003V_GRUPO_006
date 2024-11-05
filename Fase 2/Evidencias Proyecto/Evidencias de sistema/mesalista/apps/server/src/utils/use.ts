import { DatabaseError, NotFoundError } from '../middlewares/error.middleware'
import { AdvancedFilters, PaginationParams, QueryParams } from './common.types'

export function first(array: any) {
  return array != null && array.length ? array[0] : undefined
}

export function generateRandomNumber(): string {
  const randomNumber = Math.floor(1000 + Math.random() * 9000)
  return randomNumber.toString()
}

export function generateRandomNumberLength(length: number): string {
  const randomNumber = Math.floor(
    10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)
  )
  return randomNumber.toString()
}

export function getBaseUrl(requestUrl: string): string {
  const url = new URL(requestUrl)
  return `${url.protocol}//${url.host}${url.pathname}`
}

export function getWhereClause(
  column: string,
  filter: { operator: string; value: string | number }
): string {
  const isNumeric =
    typeof filter.value === 'number' || !isNaN(Number(filter.value))

  const isBoolean =
    typeof filter.value === 'boolean' ||
    filter.value === 'true' ||
    filter.value === 'false'

  if (isBoolean) {
    const boolValue =
      typeof filter.value === 'boolean' ? filter.value : filter.value === 'true'
    return `${column} = ${boolValue}`
  }

  switch (filter.operator) {
    case 'eq':
      return isNumeric
        ? `${column} = ${filter.value}`
        : `LOWER(${column}) = LOWER('${filter.value}')`
    case 'like':
      if (isNumeric) {
        throw new Error('LIKE operator is not supported for numeric values')
      }
      return `LOWER(${column}) LIKE LOWER('%${filter.value}%')`
    case 'gt':
      return isNumeric
        ? `${column} > ${filter.value}`
        : `${column} > '${filter.value}'`
    case 'lt':
      return isNumeric
        ? `${column} < ${filter.value}`
        : `${column} < '${filter.value}'`
    case 'gte':
      return isNumeric
        ? `${column} >= ${filter.value}`
        : `${column} >= '${filter.value}'`
    case 'lte':
      return isNumeric
        ? `${column} <= ${filter.value}`
        : `${column} <= '${filter.value}'`
    default:
      throw new Error(`Unsupported operator: ${filter.operator}`)
  }
}
export function buildPaginationUrls(
  baseUrl: string,
  params: PaginationParams,
  totalItems: number,
  currentItems: number,
  advancedFilters?: AdvancedFilters
): { next: string | null; prev: string | null } {
  const hasNext =
    (params.page - 1) * params.pageSize + currentItems < totalItems
  const hasPrev = params.page > 1

  const buildUrl = (pageNum: number) => {
    const url = new URL(baseUrl)
    url.searchParams.set('page', pageNum.toString())
    url.searchParams.set('pageSize', params.pageSize.toString())

    // "category/all?pageSize=1&select=id%2Cname&orderBy=id%3Adesc&filters=name%3Alike%3Al",
    if (advancedFilters) {
      if (advancedFilters.select && advancedFilters.select.length > 0) {
        url.searchParams.set('select', advancedFilters.select.join(','))
      }
      if (advancedFilters.filters) {
        const filters = Object.entries(advancedFilters.filters)
        url.searchParams.set(
          'filters',
          filters
            .map(([column, filter]) => {
              return `${column}:${filter.operator}:${filter.value}`
            })
            .join(',')
        )
      }

      if (advancedFilters.orderBy) {
        url.searchParams.set(
          'orderBy',
          `${advancedFilters.orderBy.column}:${advancedFilters.orderBy.direction}`
        )
      }
    }

    return decodeURIComponent(url.toString())
  }

  return {
    next: hasNext ? buildUrl(params.page + 1) : null,
    prev: hasPrev ? buildUrl(params.page - 1) : null
  }
}

export function parseAdvancedFilters(query: QueryParams): AdvancedFilters {
  const advancedFilters: AdvancedFilters = {}

  if (query.select) {
    advancedFilters.select = query.select.split(',')
  }

  if (query.orderBy) {
    const [column, direction] = query.orderBy.split(':')
    advancedFilters.orderBy = {
      column,
      direction: direction as 'asc' | 'desc'
    }
  }

  if (query.filters) {
    advancedFilters.filters = {}
    const filters = query.filters.split(',')
    for (const filter of filters) {
      const [column, operator, value] = filter.split(':')
      advancedFilters.filters[column] = {
        operator: operator as 'eq' | 'like' | 'gt' | 'lt' | 'gte' | 'lte',
        value
      }
    }
  }

  return advancedFilters
}

export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).trim()
}

export function generateRandomString(length: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function handleError(error: unknown, action: string): never {
  if (error instanceof NotFoundError) throw error
  if (error instanceof Error) {
    console.log(`Failed to ${action}: ${error.message}`)
    throw new DatabaseError(`Failed to ${action}: ${error.message}`)
  }
  console.log(`Unexpected error while ${action}: ${error}`)
  throw new DatabaseError(`Unexpected error while ${action}`)
}
