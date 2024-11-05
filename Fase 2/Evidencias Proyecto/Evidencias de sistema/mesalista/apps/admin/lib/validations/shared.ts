import { z } from 'zod'

export const createSearchParamsSchema = (defaultSort: string = 'id:desc') =>
  z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional().default(defaultSort),
    filters: z.string().optional()
  })

export type SearchParams = z.infer<ReturnType<typeof createSearchParamsSchema>>
