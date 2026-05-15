export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'FWD']

export const POSITION_LABEL: Record<Position, string> = {
  GK: 'Вратарь',
  DEF: 'Защитник',
  MID: 'Полузащитник',
  FWD: 'Нападающий',
}

export interface Player {
  id: string
  name: string
  position: Position
}

export interface FormationSlot {
  id: string
  role: Position
  x: number // 0..100, по горизонтали
  y: number // 0..100, по вертикали (0 — низ поля, ворота своей команды)
}

export interface Formation {
  id: string // e.g. "11-4-4-2"
  name: string // "4-4-2"
  size: number // 5..11
  slots: FormationSlot[]
}

export interface Lineup {
  id: string
  name: string
  formationId: string
  // slotId -> playerId | null
  assignments: Record<string, string | null>
  // playerIds на скамейке
  bench: string[]
}
