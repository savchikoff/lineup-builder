import { redis } from './_lib/kv'
import { isAdmin } from './_lib/auth'

export const config = { runtime: 'edge' }

const KEY = 'lineup-builder:players'

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    const data = await redis.get<unknown>(KEY)
    return Response.json(Array.isArray(data) ? data : [])
  }

  if (req.method === 'PUT') {
    if (!isAdmin(req)) {
      return new Response('Unauthorized', { status: 401 })
    }
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return new Response('Invalid JSON', { status: 400 })
    }
    if (!Array.isArray(body)) {
      return new Response('Expected a JSON array', { status: 400 })
    }
    await redis.set(KEY, body)
    return Response.json({ ok: true })
  }

  return new Response('Method not allowed', {
    status: 405,
    headers: { Allow: 'GET, PUT' },
  })
}
