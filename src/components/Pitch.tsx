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
              {player ? initials(player.name) : slot.role}
            </div>
            <div className="slot-name">
              {player ? player.name : `(${slot.role})`}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
