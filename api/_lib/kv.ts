import { Redis } from '@upstash/redis'

const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? ''
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? ''

if (!url || !token) {
  throw new Error(
    'Redis env vars missing. Provision an Upstash/KV integration in Vercel and pull env vars (vercel env pull).',
  )
}

export const redis = new Redis({ url, token })
