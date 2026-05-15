import { useState } from 'react'
import './App.css'
import type { Lineup } from './types'
import { useAdmin } from './AdminContext'
import { AdminProvider } from './AdminProvider'
import { useLineups, usePlayers } from './remote'
import { matchRoute, navigate, usePath } from './router'
import { Link } from './components/Link'
import { PlayersPage } from './components/PlayersPage'
import { LineupsPage } from './components/LineupsPage'
import { LineupEditor } from './components/LineupEditor'
import { AdminLogin } from './components/AdminLogin'

function AppInner() {
  const { isAdmin, logout } = useAdmin()
  const players = usePlayers()
  const lineups = useLineups()
  const path = usePath()
  const route = matchRoute(path)
  const [showLogin, setShowLogin] = useState(false)

  const updateLineup = (updated: Lineup) => {
    lineups.setItems(
      lineups.items.map((l) => (l.id === updated.id ? updated : l)),
    )
  }

  const editingLineup =
    route.kind === 'editor'
      ? lineups.items.find((l) => l.id === route.lineupId)
      : null

  const error = players.error ?? lineups.error
  const loadingEditor = route.kind === 'editor' && lineups.loading

  return (
    <div className="app">
      <header className="app-header">
        <h1>Lineup Builder</h1>
        <nav className="tabs">
          <Link
            to="/players"
            className={`tab-link ${route.kind === 'players' ? 'active' : ''}`}
          >
            Игроки ({players.items.length})
          </Link>
          <Link
            to="/lineups"
            className={`tab-link ${
              route.kind === 'lineups' || route.kind === 'editor' ? 'active' : ''
            }`}
          >
            Составы ({lineups.items.length})
          </Link>
          {isAdmin ? (
            <button onClick={logout} title="Выйти из режима администратора">
              Админ ✓
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)}>Войти</button>
          )}
        </nav>
      </header>

      {error && (
        <div className="error-banner">
          <span className="grow">{error}</span>
          <button
            onClick={() => {
              players.clearError()
              lineups.clearError()
            }}
          >
            Скрыть
          </button>
        </div>
      )}

      <main>
        {route.kind === 'players' && (
          <PlayersPage players={players.items} onChange={players.setItems} />
        )}
        {route.kind === 'lineups' && (
          <LineupsPage
            lineups={lineups.items}
            onChange={lineups.setItems}
          />
        )}
        {route.kind === 'editor' &&
          (editingLineup ? (
            <LineupEditor
              lineup={editingLineup}
              players={players.items}
              onChange={updateLineup}
            />
          ) : loadingEditor ? (
            <div className="page">
              <p className="muted">Загрузка…</p>
            </div>
          ) : (
            <div className="page">
              <p>Состав не найден.</p>
              <button onClick={() => navigate('/lineups')}>К списку</button>
            </div>
          ))}
      </main>

      {showLogin && <AdminLogin onClose={() => setShowLogin(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AdminProvider>
      <AppInner />
    </AdminProvider>
  )
}
