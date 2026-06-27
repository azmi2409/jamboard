import { describe, it, expect } from 'vitest'
import { screenToCanvas, canvasToScreen, clamp, distance, generateId, normalizeRect } from './math'

describe('screenToCanvas', () => {
  it('converts screen coordinates to canvas coordinates', () => {
    const point = { x: 100, y: 100 }
    const viewport = { x: 50, y: 50, zoom: 2 }

    const result = screenToCanvas(point, viewport)

    expect(result.x).toBe(25)
    expect(result.y).toBe(25)
  })

  it('handles zoom level 1', () => {
    const point = { x: 200, y: 150 }
    const viewport = { x: 0, y: 0, zoom: 1 }

    const result = screenToCanvas(point, viewport)

    expect(result.x).toBe(200)
    expect(result.y).toBe(150)
  })
})

describe('canvasToScreen', () => {
  it('converts canvas coordinates to screen coordinates', () => {
    const point = { x: 25, y: 25 }
    const viewport = { x: 50, y: 50, zoom: 2 }

    const result = canvasToScreen(point, viewport)

    expect(result.x).toBe(100)
    expect(result.y).toBe(100)
  })
})

describe('clamp', () => {
  it('clamps value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles exact boundaries', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })
})

describe('distance', () => {
  it('calculates distance between two points', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 3, y: 4 }

    expect(distance(a, b)).toBe(5)
  })

  it('returns 0 for same points', () => {
    const a = { x: 5, y: 5 }
    const b = { x: 5, y: 5 }

    expect(distance(a, b)).toBe(0)
  })
})

describe('generateId', () => {
  it('generates unique ids', () => {
    const id1 = generateId()
    const id2 = generateId()

    expect(id1).not.toBe(id2)
  })

  it('generates string ids', () => {
    const id = generateId()

    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
})

describe('normalizeRect', () => {
  it('normalizes rectangle coordinates', () => {
    const result = normalizeRect(100, 100, 0, 0)

    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
    expect(result.width).toBe(100)
    expect(result.height).toBe(100)
  })

  it('handles already normalized rect', () => {
    const result = normalizeRect(0, 0, 50, 30)

    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
    expect(result.width).toBe(50)
    expect(result.height).toBe(30)
  })
})
