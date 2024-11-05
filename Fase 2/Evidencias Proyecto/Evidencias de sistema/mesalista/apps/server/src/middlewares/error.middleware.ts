import Elysia from 'elysia'
import { OutputResponse } from '../utils'

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export default (app: Elysia) =>
  app.onError(({ error, set }) => {
    let statusCode: number
    let message: string = 'Oops! Something went wrong.'
    let details: string | undefined

    if (error instanceof NotFoundError) {
      set.status = 404
      statusCode = 404
      message = error.message || 'Resource not found'
    } else if (error instanceof DatabaseError) {
      set.status = 500
      statusCode = 500
      message = 'Internal server error'
      details = error.message
    } else if (error instanceof AuthError) {
      set.status = 401
      statusCode = 401
      message = 'Unauthorized'
      details = error.message
    } else if (error instanceof Error) {
      // Handle generic errors
      set.status = 500
      statusCode = 500
      details = error.message
      if (error.message.trim().startsWith('{')) {
        const errObj = JSON.parse(error.message)
        if (errObj.type === 'validation') {
          set.status = 400
          statusCode = 400
          message = `Validation error on ${errObj.on}`
          details = errObj.summary
        }
      }
    } else {
      // Handle unknown errors
      set.status = 500
      statusCode = 500
    }

    return OutputResponse(statusCode, message, null, details)
  })
