const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export function checkPassword(candidate: string): boolean {
  if (!ADMIN_PASSWORD || !candidate) return false
  return timingSafeEqual(candidate, ADMIN_PASSWORD)
}

export function isAdmin(req: Request): boolean {
  const header = req.headers.get('authorization') ?? ''
  if (!header.startsWith('Bearer ')) return false
  return checkPassword(header.slice('Bearer '.length))
}
