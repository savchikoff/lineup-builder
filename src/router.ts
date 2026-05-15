import { useSyncExternalStore } from 'react'

export type Route =
  | { kind: 'players' }
  | { kind: 'lineups' }
  | { kind: 'editor'; lineupId: string }

function getPath(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, getPath, () => '/')
}

export function navigate(path: string, replace = false): void {
  if (path === getPath()) return
  if (replace) {
    window.history.replaceState({}, '', path)
  } else {
    window.history.pushState({}, '', path)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function matchRoute(path: string): Route {
  if (path === '/' || path === '/players') return { kind: 'players' }
  if (path === '/lineups') return { kind: 'lineups' }
  const m = /^\/lineups\/([^/]+)$/.exec(path)
  if (m) return { kind: 'editor', lineupId: decodeURIComponent(m[1]) }
  return { kind: 'players' }
}
