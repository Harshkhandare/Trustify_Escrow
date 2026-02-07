import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Minimal OpenAPI spec (extend as needed)
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Escrow Platform API',
      version: '1.0.0',
      description: 'API documentation for the Escrow Platform',
    },
    servers: [{ url: `${baseUrl}/api` }],
    paths: {
      '/health': {
        get: { summary: 'Health check', responses: { '200': { description: 'OK' } } },
      },
      '/auth/signup': {
        post: { summary: 'Sign up', responses: { '201': { description: 'Created' } } },
      },
      '/auth/login': {
        post: { summary: 'Login', responses: { '200': { description: 'OK' } } },
      },
      '/auth/logout': {
        post: { summary: 'Logout', responses: { '200': { description: 'OK' } } },
      },
      '/auth/me': {
        get: { summary: 'Current user', responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
      },
      '/auth/forgot-password': {
        post: { summary: 'Request password reset', responses: { '200': { description: 'OK' } } },
      },
      '/auth/reset-password': {
        post: { summary: 'Reset password', responses: { '200': { description: 'OK' } } },
      },
      '/auth/verify-email': {
        get: { summary: 'Verify email', responses: { '200': { description: 'OK' } } },
      },
      '/auth/resend-verification': {
        post: { summary: 'Resend verification email', responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
      },
      '/escrows': {
        get: { summary: 'List escrows', responses: { '200': { description: 'OK' } } },
        post: { summary: 'Create escrow', responses: { '201': { description: 'Created' }, '401': { description: 'Unauthorized' } } },
      },
      '/escrows/{id}': {
        get: { summary: 'Get escrow', responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
        put: { summary: 'Update escrow / action', responses: { '200': { description: 'OK' } } },
        delete: { summary: 'Delete escrow', responses: { '200': { description: 'OK' } } },
      },
      '/admin/stats': {
        get: { summary: 'Admin stats', responses: { '200': { description: 'OK' }, '403': { description: 'Forbidden' } } },
      },
      '/notifications': {
        get: { summary: 'List notifications', responses: { '200': { description: 'OK' } } },
        patch: { summary: 'Mark all notifications read', responses: { '200': { description: 'OK' } } },
      },
      '/notifications/{id}': {
        patch: { summary: 'Mark notification read', responses: { '200': { description: 'OK' } } },
        delete: { summary: 'Delete notification', responses: { '200': { description: 'OK' } } },
      },
      '/templates': {
        get: { summary: 'List templates', responses: { '200': { description: 'OK' } } },
        post: { summary: 'Create template', responses: { '201': { description: 'Created' }, '401': { description: 'Unauthorized' } } },
      },
      '/templates/{id}': {
        get: { summary: 'Get template', responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
        delete: { summary: 'Delete template', responses: { '200': { description: 'OK' }, '403': { description: 'Forbidden' } } },
      },
      '/upload': {
        post: { summary: 'Upload file', responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
      },
      '/openapi': {
        get: { summary: 'OpenAPI spec', responses: { '200': { description: 'OK' } } },
      },
    },
  }

  return NextResponse.json(spec)
}


