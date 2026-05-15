import { checkPassword } from './_lib/auth'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  let body: { password?: unknown }
  try {
    body = (await req.json()) as { password?: unknown }
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!checkPassword(password)) {
    return new Response('Unauthorized', { status: 401 })
  }
  return Response.json({ ok: true })
}
