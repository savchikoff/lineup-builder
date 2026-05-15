import { createContext, useContext } from 'react'

export interface AdminContextValue {
  isAdmin: boolean
  login: (password: string) => Promise<void>
  logout: () => void
}

export const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
