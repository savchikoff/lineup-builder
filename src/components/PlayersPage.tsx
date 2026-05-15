import { useState } from 'react'
import { POSITIONS, POSITION_LABEL } from '../types'
import type { Player, Position } from '../types'
import { uid } from '../storage'
import { useAdmin } from '../AdminContext'

interface Props {
  players: Player[]
  onChange: (players: Player[]) => void
}

export function PlayersPage({ players, onChange }: Props) {
  const { isAdmin } = useAdmin()
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Position>('MID')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPos, setEditPos] = useState<Position>('MID')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onChange([...players, { id: uid(), name: trimmed, position }])
    setName('')
  }

  const handleDelete = (id: string) => {
    onChange(players.filter((p) => p.id !== id))
  }

  const startEdit = (p: Player) => {
    setEditingId(p.id)
    setEditName(p.name)
    setEditPos(p.position)
  }

  const saveEdit = () => {
    if (!editingId) return
    const trimmed = editName.trim()
    if (!trimmed) return
    onChange(
      players.map((p) =>
        p.id === editingId ? { ...p, name: trimmed, position: editPos } : p,
      ),
    )
    setEditingId(null)
  }

  const sorted = [...players].sort((a, b) => {
    const pa = POSITIONS.indexOf(a.position)
    const pb = POSITIONS.indexOf(b.position)
    if (pa !== pb) return pa - pb
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="page">
      <h2>Игроки</h2>

      {isAdmin && (
        <form className="row" onSubmit={handleAdd}>
          <input
            className="grow"
            placeholder="ФИО"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as Position)}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {POSITION_LABEL[p]}
              </option>
            ))}
          </select>
          <button type="submit">Добавить</button>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="muted">
          {isAdmin
            ? 'Список пуст. Добавьте первого игрока.'
            : 'Список пуст.'}
        </p>
      ) : (
        <ul className="list">
          {sorted.map((p) => (
            <li key={p.id} className="list-item">
              {isAdmin && editingId === p.id ? (
                <div className="row grow" style={{ marginBottom: 0 }}>
                  <input
                    className="grow"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <select
                    value={editPos}
                    onChange={(e) => setEditPos(e.target.value as Position)}
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {POSITION_LABEL[pos]}
                      </option>
                    ))}
                  </select>
                  <button className="primary" onClick={saveEdit}>
                    Сохранить
                  </button>
                  <button onClick={() => setEditingId(null)}>Отмена</button>
                </div>
              ) : (
                <>
                  <span className={`pos-badge pos-${p.position}`}>
                    {p.position}
                  </span>
                  <span className="grow">{p.name}</span>
                  {isAdmin && (
                    <>
                      <button onClick={() => startEdit(p)}>Изменить</button>
                      <button
                        className="danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
