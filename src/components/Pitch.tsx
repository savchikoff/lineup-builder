import type { Formation, Player } from '../types'

interface Props {
  formation: Formation
  assignments: Record<string, string | null>
  playersById: Record<string, Player>
}

export function Pitch({ formation, assignments, playersById }: Props) {
  return (
    <div className="pitch" aria-label="Футбольное поле">
      <div className="pitch-line pitch-halfway" />
      <div className="pitch-circle" />
      <div className="pitch-box pitch-box-bottom" />
      <div className="pitch-box pitch-box-top" />
      <div className="pitch-goal pitch-goal-bottom" />
      <div className="pitch-goal pitch-goal-top" />

      {formation.slots.map((slot) => {
        const playerId = assignments[slot.id]
        const player = playerId ? playersById[playerId] : null
        const last = player ? surname(player.name) : ''
        return (
          <div
            key={slot.id}
            className={`slot ${player ? 'filled' : 'empty'}`}
            style={{
              left: `${slot.x}%`,
              bottom: `${slot.y}%`,
            }}
            title={`${slot.role}${player ? ' — ' + player.name : ''}`}
          >
            <div className={`slot-dot pos-${slot.role}`}>
              {player ? last.slice(0, 2).toUpperCase() : slot.role}
            </div>
            <div className="slot-name">{player ? last : `(${slot.role})`}</div>
          </div>
        )
      })}
    </div>
  )
}

function surname(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return ''
  // выбираем последний токен, который не похож на инициал
  for (let i = tokens.length - 1; i >= 0; i--) {
    const stripped = tokens[i].replace(/\.$/, '')
    if (stripped.length >= 2) return stripped
  }
  return tokens[0]
}
