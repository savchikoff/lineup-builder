import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import type { Lineup, Player } from './types'

interface Options<T> {
  cacheKey: string
  fetcher: () => Promise<T[]>
  writer: (items: T[]) => Promise<unknown>
}

interface Result<T> {
  items: T[]
  setItems: (next: T[]) => void
  loading: boolean
  error: string | null
  clearError: () => void
}

const WRITE_DEBOUNCE_MS = 400

function loadCache<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function saveCache<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / private mode
  }
}

function useRemoteArray<T>({ cacheKey, fetcher, writer }: Options<T>): Result<T> {
  const [items, setItemsState] = useState<T[]>(() => loadCache<T>(cacheKey))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pendingRef = useRef<T[] | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // initial fetch (revalidate from server)
  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((fresh) => {
        if (cancelled) return
        setItemsState(fresh)
        saveCache(cacheKey, fresh)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(formatError(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // fetcher is stable (module-level method); cacheKey is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  const setItems = (next: T[]) => {
    setItemsState(next)
    pendingRef.current = next
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const toSave = pendingRef.current
      if (toSave == null) return
      pendingRef.current = null
      writer(toSave)
        .then(() => {
          saveCache(cacheKey, toSave)
          setError(null)
        })
        .catch((e: unknown) => {
          setError(formatError(e))
        })
    }, WRITE_DEBOUNCE_MS)
  }

  return {
    items,
    setItems,
    loading,
    error,
    clearError: () => setError(null),
  }
}

function formatError(e: unknown): string {
  if (e instanceof Error) {
    if ('status' in e && (e as { status?: number }).status === 401) {
      return 'Нет прав. Войдите как администратор.'
    }
    return e.message
  }
  return String(e)
}

export function usePlayers(): Result<Player> {
  return useRemoteArray<Player>({
    cacheKey: 'lineup-builder.players',
    fetcher: api.getPlayers,
    writer: api.putPlayers,
  })
}

export function useLineups(): Result<Lineup> {
  return useRemoteArray<Lineup>({
    cacheKey: 'lineup-builder.lineups',
    fetcher: api.getLineups,
    writer: api.putLineups,
  })
}
