import { Awareness } from 'y-protocols/awareness'
import type { Point } from '../canvas/types.ts'

export interface UserAwareness {
  id: string
  name: string
  color: string
  x: number
  y: number
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#d946ef',
  '#f43f5e',
]

function generateName(): string {
  return `User ${Math.floor(Math.random() * 1000)}`
}

function generateColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

export function setupAwareness(awareness: Awareness): {
  updateCursor: (point: Point) => void
  getRemoteCursors: () => UserAwareness[]
} {
  const id = awareness.clientID.toString()
  const name = generateName()
  const color = generateColor()

  awareness.setLocalState({
    id,
    name,
    color,
    x: 0,
    y: 0,
  })

  const updateCursor = (point: Point) => {
    awareness.setLocalStateField('x', point.x)
    awareness.setLocalStateField('y', point.y)
  }

  const getRemoteCursors = (): UserAwareness[] => {
    const states = awareness.getStates()
    const remote: UserAwareness[] = []
    states.forEach((state, clientID) => {
      if (clientID === awareness.clientID) return
      if (state && typeof state.x === 'number' && typeof state.y === 'number') {
        remote.push({
          id: String(state.id || clientID),
          name: String(state.name || `User ${clientID}`),
          color: String(state.color || '#3b82f6'),
          x: state.x,
          y: state.y,
        })
      }
    })
    return remote
  }

  return { updateCursor, getRemoteCursors }
}
