import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  api,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from './api'
import { AdminContext } from './AdminContext'

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => getAdminToken() !== null)

  const login = async (password: string) => {
    await api.login(password)
    setAdminToken(password)
    setIsAdmin(true)
  }

  const logout = () => {
    clearAdminToken()
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}
