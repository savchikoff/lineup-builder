import { useState } from 'react'
import type { Lineup } from '../types'
import { getFormation, getFormationsForSize, SQUAD_SIZES } from '../formations'
import { uid } from '../storage'
import { useAdmin } from '../AdminContext'

interface Props {
  lineups: Lineup[]
  onChange: (lineups: Lineup[]) => void
  onOpen: (id: string) => void
}

export function LineupsPage({ lineups, onChange, onOpen }: Props) {
  const { isAdmin } = useAdmin()
  const [name, setName] = useState('')
  const [size, setSize] = useState<number>(11)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const formations = getFormationsForSize(size)
    if (formations.length === 0) return
    const formation = formations[0]
    const assignments: Record<string, string | null> = {}
    formation.slots.forEach((s) => (assignments[s.id] = null))
    const lineup: Lineup = {
      id: uid(),
      name: trimmed,
      formationId: formation.id,
      assignments,
      bench: [],
    }
    onChange([...lineups, lineup])
    setName('')
    onOpen(lineup.id)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Удалить состав?')) return
    onChange(lineups.filter((l) => l.id !== id))
  }

  return (
    <div className="page">
      <h2>Составы</h2>

      {isAdmin && (
        <form className="row" onSubmit={handleCreate}>
          <input
            className="grow"
            placeholder="Название состава (например: «Матч с Динамо»)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {SQUAD_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} игроков
              </option>
            ))}
          </select>
          <button type="submit">Создать</button>
        </form>
      )}

      {lineups.length === 0 ? (
        <p className="muted">
          {isAdmin ? 'Составов пока нет. Создайте первый.' : 'Составов пока нет.'}
        </p>
      ) : (
        <ul className="list">
          {lineups.map((l) => {
            const f = getFormation(l.formationId)
            const filled = Object.values(l.assignments).filter(Boolean).length
            const total = f?.slots.length ?? 0
            return (
              <li key={l.id} className="list-item">
                <span className="grow">
                  <strong>{l.name}</strong>
                  <span className="muted">
                    {' '}
                    — {f ? `${f.size} (${f.name})` : 'схема не найдена'} ·{' '}
                    {filled}/{total} на поле · {l.bench.length} в запасе
                  </span>
                </span>
                <button className="primary" onClick={() => onOpen(l.id)}>
                  Открыть
                </button>
                {isAdmin && (
                  <button className="danger" onClick={() => handleDelete(l.id)}>
                    Удалить
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
