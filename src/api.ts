import type { Lineup, Player } from './types'

const ADMIN_KEY = 'lineup-builder.admin'

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token: string): void {
  try {
    sessionStorage.setItem(ADMIN_KEY, token)
  } catch {
    // ignore (private mode)
  }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(ADMIN_KEY)
  } catch {
    // ignore
  }
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text || res.statusText)
  }
  return (await res.json()) as T
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export const api = {
  getPlayers: () => request<Player[]>('/api/players'),
  putPlayers: (players: Player[]) =>
    request<{ ok: true }>('/api/players', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(players),
    }),
  getLineups: () => request<Lineup[]>('/api/lineups'),
  putLineups: (lineups: Lineup[]) =>
    request<{ ok: true }>('/api/lineups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(lineups),
    }),
  login: (password: string) =>
    request<{ ok: true }>('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
}
