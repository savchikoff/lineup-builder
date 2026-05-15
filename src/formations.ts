import type { Formation, FormationSlot, Position } from './types'

// "4-4-2" -> [4, 4, 2] (полевые игроки по линиям от защиты к атаке)
function buildSlots(lines: number[]): FormationSlot[] {
  const slots: FormationSlot[] = []
  slots.push({ id: 'gk', role: 'GK', x: 50, y: 8 })

  const numLines = lines.length
  // y от 28 (защита) до 90 (форварды)
  const yMin = 28
  const yMax = 90

  lines.forEach((count, lineIdx) => {
    const y =
      numLines === 1
        ? (yMin + yMax) / 2
        : yMin + ((yMax - yMin) * lineIdx) / (numLines - 1)

    const role: Position =
      lineIdx === 0 ? 'DEF' : lineIdx === numLines - 1 ? 'FWD' : 'MID'

    // x от 12 до 88 — полный диапазон, но шаг между игроками не больше MAX_SPACING,
    // чтобы пары и тройки сжимались к центру, а не выглядели как фланговые
    const xMin = 12
    const xMax = 88
    const MAX_SPACING = 26
    const span = Math.min(xMax - xMin, MAX_SPACING * (count - 1))
    const left = 50 - span / 2
    for (let i = 0; i < count; i++) {
      const x = count === 1 ? 50 : left + (span * i) / (count - 1)
      slots.push({ id: `${role}-${lineIdx}-${i}`, role, x, y })
    }
  })

  return slots
}

function fm(size: number, name: string): Formation {
  const lines = name.split('-').map(Number)
  return { id: `${size}-${name}`, name, size, slots: buildSlots(lines) }
}

const FORMATIONS_BY_SIZE: Record<number, Formation[]> = {
  11: [
    fm(11, '4-4-2'),
    fm(11, '4-3-3'),
    fm(11, '4-2-3-1'),
    fm(11, '3-5-2'),
    fm(11, '3-4-3'),
    fm(11, '5-3-2'),
    fm(11, '4-5-1'),
  ],
  10: [fm(10, '3-4-2'), fm(10, '3-3-3'), fm(10, '4-3-2'), fm(10, '4-4-1')],
  9: [fm(9, '3-3-2'), fm(9, '3-2-3'), fm(9, '4-3-1'), fm(9, '2-4-2')],
  8: [fm(8, '3-3-1'), fm(8, '2-3-2'), fm(8, '3-2-2'), fm(8, '2-4-1')],
  7: [fm(7, '2-3-1'), fm(7, '3-2-1'), fm(7, '2-2-2'), fm(7, '3-1-2')],
  6: [fm(6, '2-2-1'), fm(6, '1-2-2'), fm(6, '2-1-2'), fm(6, '3-1-1')],
  5: [fm(5, '1-2-1'), fm(5, '2-1-1'), fm(5, '1-1-2')],
}

export const SQUAD_SIZES = [11, 10, 9, 8, 7, 6, 5] as const

export function getFormationsForSize(size: number): Formation[] {
  return FORMATIONS_BY_SIZE[size] ?? []
}

export const ALL_FORMATIONS: Formation[] = Object.values(FORMATIONS_BY_SIZE).flat()

export function getFormation(id: string): Formation | undefined {
  return ALL_FORMATIONS.find((f) => f.id === id)
}
