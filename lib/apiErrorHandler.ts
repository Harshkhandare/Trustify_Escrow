import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import logger from './logger'

export function handleApiError(error: unknown) {
  // Log error
  logger.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }

  // Handle known errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An error occurred'
        : error.message

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}


