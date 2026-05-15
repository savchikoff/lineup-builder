import { useMemo, useState } from 'react'
import type { Lineup, Player } from '../types'
import { POSITION_LABEL } from '../types'
import {
  getFormation,
  getFormationsForSize,
  SQUAD_SIZES,
} from '../formations'
import { Pitch } from './Pitch'
import { useAdmin } from '../AdminContext'
import { navigate } from '../router'

interface Props {
  lineup: Lineup
  players: Player[]
  onChange: (lineup: Lineup) => void
}

export function LineupEditor({ lineup, players, onChange }: Props) {
  const { isAdmin } = useAdmin()
  const [shareLabel, setShareLabel] = useState('Поделиться')

  const onBack = () => navigate('/lineups')

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setShareLabel('Скопировано ✓')
    } catch {
      setShareLabel('Ошибка')
    }
    setTimeout(() => setShareLabel('Поделиться'), 1800)
  }

  const formation = getFormation(lineup.formationId)
  const playersById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players],
  )

  const substitutions = lineup.substitutions ?? {}

  const onFieldIds = new Set(
    Object.values(lineup.assignments).filter((v): v is string => Boolean(v)),
  )
  const benchIds = new Set(lineup.bench)
  const subbedIds = new Set(
    Object.values(substitutions).filter((v): v is string => Boolean(v)),
  )

  const renameLineup = (name: string) => {
    onChange({ ...lineup, name })
  }

  const changeSize = (size: number) => {
    const formations = getFormationsForSize(size)
    if (formations.length === 0) return
    const newFormation = formations[0]
    const assignments: Record<string, string | null> = {}
    newFormation.slots.forEach((s) => (assignments[s.id] = null))
    onChange({
      ...lineup,
      formationId: newFormation.id,
      assignments,
      substitutions: {},
    })
  }

  const changeFormation = (formationId: string) => {
    const newFormation = getFormation(formationId)
    if (!newFormation) return
    const assignments: Record<string, string | null> = {}
    newFormation.slots.forEach((s) => (assignments[s.id] = null))
    onChange({ ...lineup, formationId, assignments, substitutions: {} })
  }

  const assignToSlot = (slotId: string, playerId: string | null) => {
    const newAssignments = { ...lineup.assignments }

    if (playerId) {
      for (const sid of Object.keys(newAssignments)) {
        if (newAssignments[sid] === playerId) newAssignments[sid] = null
      }
    }
    newAssignments[slotId] = playerId

    const newBench = playerId
      ? lineup.bench.filter((id) => id !== playerId)
      : lineup.bench

    // если игрок выходит на поле — он больше не может быть запасным
    const newSubs = { ...substitutions }
    let subsChanged = false
    if (playerId) {
      for (const sid of Object.keys(newSubs)) {
        if (newSubs[sid] === playerId) {
          newSubs[sid] = null
          subsChanged = true
        }
      }
    }

    onChange({
      ...lineup,
      assignments: newAssignments,
      bench: newBench,
      substitutions: subsChanged ? newSubs : substitutions,
    })
  }

  const assignSubstitute = (slotId: string, subPlayerId: string | null) => {
    const next: Record<string, string | null> = { ...substitutions }
    if (subPlayerId) {
      // один запасной — не более чем на одной позиции
      for (const sid of Object.keys(next)) {
        if (next[sid] === subPlayerId) next[sid] = null
      }
    }
    next[slotId] = subPlayerId
    onChange({ ...lineup, substitutions: next })
  }

  const addToBench = (playerId: string) => {
    if (!playerId || benchIds.has(playerId)) return
    const newAssignments = { ...lineup.assignments }
    for (const sid of Object.keys(newAssignments)) {
      if (newAssignments[sid] === playerId) newAssignments[sid] = null
    }
    onChange({
      ...lineup,
      assignments: newAssignments,
      bench: [...lineup.bench, playerId],
    })
  }

  const removeFromBench = (playerId: string) => {
    // снимаем игрока с любых назначений на замену
    const nextSubs = { ...substitutions }
    let subsChanged = false
    for (const sid of Object.keys(nextSubs)) {
      if (nextSubs[sid] === playerId) {
        nextSubs[sid] = null
        subsChanged = true
      }
    }
    onChange({
      ...lineup,
      bench: lineup.bench.filter((id) => id !== playerId),
      substitutions: subsChanged ? nextSubs : substitutions,
    })
  }

  if (!formation) {
    return (
      <div className="page">
        <p>Схема не найдена.</p>
        <button onClick={onBack}>Назад</button>
      </div>
    )
  }

  const formationsForSize = getFormationsForSize(formation.size)
  const availablePlayers = players.filter(
    (p) => !onFieldIds.has(p.id) && !benchIds.has(p.id),
  )

  return (
    <div className="page editor">
      <div className="row">
        <button onClick={onBack}>← К списку</button>
        <input
          className="grow"
          value={lineup.name}
          onChange={(e) => renameLineup(e.target.value)}
          readOnly={!isAdmin}
        />
        <button onClick={handleShare} title="Скопировать ссылку на состав">
          {shareLabel}
        </button>
      </div>

      <div className="row">
        <label>
          Размер:&nbsp;
          <select
            value={formation.size}
            onChange={(e) => changeSize(Number(e.target.value))}
            disabled={!isAdmin}
          >
            {SQUAD_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Схема:&nbsp;
          <select
            value={formation.id}
            onChange={(e) => changeFormation(e.target.value)}
            disabled={!isAdmin}
          >
            {formationsForSize.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="editor-grid">
        <div className="pitch-wrap">
          <Pitch
            formation={formation}
            assignments={lineup.assignments}
            playersById={playersById}
          />
        </div>

        <div className="sidebar">
          <section>
            <h3>На поле</h3>
            <ul className="slot-list">
              {formation.slots.map((slot) => {
                const assignedId = lineup.assignments[slot.id]
                const assigned = assignedId ? playersById[assignedId] : null
                const subId = substitutions[slot.id] ?? null
                const sub = subId ? playersById[subId] : null
                const showSubRow = isAdmin || sub != null
                return (
                  <li key={slot.id} className="slot-row-group">
                    <div className="slot-row">
                      <span className={`pos-badge pos-${slot.role}`}>
                        {slot.role}
                      </span>
                      {isAdmin ? (
                        <select
                          className="grow"
                          value={assignedId ?? ''}
                          onChange={(e) =>
                            assignToSlot(slot.id, e.target.value || null)
                          }
                        >
                          <option value="">— пусто —</option>
                          {players.map((p) => {
                            const usedHere = assignedId === p.id
                            const usedElsewhere =
                              !usedHere &&
                              (onFieldIds.has(p.id) || benchIds.has(p.id))
                            const suffix = usedElsewhere
                              ? benchIds.has(p.id)
                                ? ' · скамья'
                                : ' · на поле'
                              : ''
                            return (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.position}){suffix}
                              </option>
                            )
                          })}
                        </select>
                      ) : (
                        <span className="grow">
                          {assigned ? (
                            `${assigned.name} (${assigned.position})`
                          ) : (
                            <span className="muted">— пусто —</span>
                          )}
                        </span>
                      )}
                    </div>
                    {showSubRow && (
                      <div className="slot-sub-row">
                        <span className="sub-prefix">↳ замена</span>
                        {isAdmin ? (
                          <select
                            className="grow"
                            value={subId ?? ''}
                            onChange={(e) =>
                              assignSubstitute(slot.id, e.target.value || null)
                            }
                          >
                            <option value="">— не назначена —</option>
                            {lineup.bench.map((bid) => {
                              const bp = playersById[bid]
                              if (!bp) return null
                              const here = subId === bid
                              const elsewhere = !here && subbedIds.has(bid)
                              return (
                                <option key={bid} value={bid}>
                                  {bp.name} ({bp.position})
                                  {elsewhere ? ' · занят' : ''}
                                </option>
                              )
                            })}
                          </select>
                        ) : sub ? (
                          <span className="grow">
                            {sub.name} ({sub.position})
                          </span>
                        ) : (
                          <span className="muted">— не назначена —</span>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <h3>Скамейка ({lineup.bench.length})</h3>
            {isAdmin && (
              <div className="row">
                <select
                  className="grow"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addToBench(e.target.value)
                      e.target.value = ''
                    }
                  }}
                >
                  <option value="">+ добавить на скамейку…</option>
                  {availablePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.position})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {lineup.bench.length === 0 ? (
              <p className="muted">Скамейка пуста.</p>
            ) : (
              <ul className="list">
                {lineup.bench.map((id) => {
                  const p = playersById[id]
                  if (!p) {
                    return (
                      <li key={id} className="list-item">
                        <span className="grow muted">
                          (игрок удалён из базы)
                        </span>
                        {isAdmin && (
                          <button
                            className="danger"
                            onClick={() => removeFromBench(id)}
                          >
                            Убрать
                          </button>
                        )}
                      </li>
                    )
                  }
                  return (
                    <li key={id} className="list-item">
                      <span className={`pos-badge pos-${p.position}`}>
                        {p.position}
                      </span>
                      <span className="grow">{p.name}</span>
                      {subbedIds.has(id) && (
                        <span className="muted" title="Назначен на замену">
                          ⇄ замена
                        </span>
                      )}
                      {isAdmin && (
                        <button onClick={() => removeFromBench(id)}>
                          Убрать
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {isAdmin && (
            <section>
              <h3>Свободные игроки ({availablePlayers.length})</h3>
              {availablePlayers.length === 0 ? (
                <p className="muted">Все игроки распределены.</p>
              ) : (
                <ul className="list compact">
                  {availablePlayers.map((p) => (
                    <li key={p.id} className="list-item">
                      <span className={`pos-badge pos-${p.position}`}>
                        {p.position}
                      </span>
                      <span className="grow">{p.name}</span>
                      <span className="muted">{POSITION_LABEL[p.position]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
