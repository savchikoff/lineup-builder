import { useState } from 'react'
import './App.css'
import type { Lineup, Player } from './types'
import { useLocalStorage } from './storage'
import { PlayersPage } from './components/PlayersPage'
import { LineupsPage } from './components/LineupsPage'
import { LineupEditor } from './components/LineupEditor'

type View =
  | { kind: 'players' }
  | { kind: 'lineups' }
  | { kind: 'editor'; lineupId: string }

export default function App() {
  const [players, setPlayers] = useLocalStorage<Player[]>(
    'lineup-builder.players',
    [],
  )
  const [lineups, setLineups] = useLocalStorage<Lineup[]>(
    'lineup-builder.lineups',
    [],
  )
  const [view, setView] = useState<View>({ kind: 'players' })

  const updateLineup = (updated: Lineup) => {
    setLineups(lineups.map((l) => (l.id === updated.id ? updated : l)))
  }

  const editingLineup =
    view.kind === 'editor' ? lineups.find((l) => l.id === view.lineupId) : null

  return (
    <div className="app">
      <header className="app-header">
        <h1>Lineup Builder</h1>
        <nav className="tabs">
          <button
            className={view.kind === 'players' ? 'active' : ''}
            onClick={() => setView({ kind: 'players' })}
          >
            Игроки ({players.length})
          </button>
          <button
            className={
              view.kind === 'lineups' || view.kind === 'editor' ? 'active' : ''
            }
            onClick={() => setView({ kind: 'lineups' })}
          >
            Составы ({lineups.length})
          </button>
        </nav>
      </header>

      <main>
        {view.kind === 'players' && (
          <PlayersPage players={players} onChange={setPlayers} />
        )}
        {view.kind === 'lineups' && (
          <LineupsPage
            lineups={lineups}
            onChange={setLineups}
            onOpen={(id) => setView({ kind: 'editor', lineupId: id })}
          />
        )}
        {view.kind === 'editor' &&
          (editingLineup ? (
            <LineupEditor
              lineup={editingLineup}
              players={players}
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
    </div>
  )
}
