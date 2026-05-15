import { useState } from 'react'
import './App.css'
import type { Lineup } from './types'
import { useAdmin } from './AdminContext'
import { AdminProvider } from './AdminProvider'
import { useLineups, usePlayers } from './remote'
import { PlayersPage } from './components/PlayersPage'
import { LineupsPage } from './components/LineupsPage'
import { LineupEditor } from './components/LineupEditor'
import { AdminLogin } from './components/AdminLogin'

type View =
  | { kind: 'players' }
  | { kind: 'lineups' }
  | { kind: 'editor'; lineupId: string }

function AppInner() {
  const { isAdmin, logout } = useAdmin()
  const players = usePlayers()
  const lineups = useLineups()
  const [view, setView] = useState<View>({ kind: 'players' })
  const [showLogin, setShowLogin] = useState(false)

  const updateLineup = (updated: Lineup) => {
    lineups.setItems(
      lineups.items.map((l) => (l.id === updated.id ? updated : l)),
    )
  }

  const editingLineup =
    view.kind === 'editor'
      ? lineups.items.find((l) => l.id === view.lineupId)
      : null

  const error = players.error ?? lineups.error

  return (
    <div className="app">
      <header className="app-header">
        <h1>Lineup Builder</h1>
        <nav className="tabs">
          <button
            className={view.kind === 'players' ? 'active' : ''}
            onClick={() => setView({ kind: 'players' })}
          >
            Игроки ({players.items.length})
          </button>
          <button
            className={
              view.kind === 'lineups' || view.kind === 'editor' ? 'active' : ''
            }
            onClick={() => setView({ kind: 'lineups' })}
          >
            Составы ({lineups.items.length})
          </button>
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
        {view.kind === 'players' && (
          <PlayersPage players={players.items} onChange={players.setItems} />
        )}
        {view.kind === 'lineups' && (
          <LineupsPage
            lineups={lineups.items}
            onChange={lineups.setItems}
            onOpen={(id) => setView({ kind: 'editor', lineupId: id })}
          />
        )}
        {view.kind === 'editor' &&
          (editingLineup ? (
            <LineupEditor
              lineup={editingLineup}
              players={players.items}
              onChange={updateLineup}
              onBack={() => setView({ kind: 'lineups' })}
            />
          ) : (
            <div className="page">
              <p>Состав не найден.</p>
              <button onClick={() => setView({ kind: 'lineups' })}>
                К списку
              </button>
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
