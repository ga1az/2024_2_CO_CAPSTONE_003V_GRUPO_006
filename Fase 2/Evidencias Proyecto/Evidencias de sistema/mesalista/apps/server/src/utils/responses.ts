import { t, TSchema } from 'elysia'

type ResponseSchema = {
  status: number
  message: string
  data: any
  error?: string
}

export async function OutputResponse(
  status: number,
  message: string,
  data: any,
  error?: string
): Promise<Object> {
  const response: ResponseSchema = {
    status: status,
    message: message,
    data: ''
  }
  if (status >= 400) {
    response.error = error
  } else {
    response.data = data
  }
  return response
}

export const SwaggerResponses = (object: TSchema) => {
  return {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: t.Object({
            status: t.String(),
            message: t.String(),
            data: object
          })
        }
      }
    },
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: t.Object({
            status: t.String(),
            message: t.String(),
            error: t.String(),
            data: t.String()
          })
        }
      }
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: t.Object({
            status: t.String(),
            message: t.String(),
            error: t.String(),
            data: t.String()
          })
        }
      }
    },
    404: {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: t.Object({
            status: t.String(),
            message: t.String(),
            error: t.String(),
            data: t.String()
          })
        }
      }
    },
    500: {
      description: 'Oops! Something went wrong.',
      content: {
        'application/json': {
          schema: t.Object({
            status: t.String(),
            message: t.String(),
            error: t.String(),
            data: t.String()
          })
        }
      }
    }
  }
}

export type tenantCredentials = {
  databaseName: string
  databaseAuthToken: string
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}
