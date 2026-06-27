import { describe, it, expect } from 'vitest'
import { pointNearLine, pointInRect, hitTestElement, getElementBounds } from './geometry'
import type { CanvasElement } from './types'

describe('pointNearLine', () => {
  it('returns true when point is on the line', () => {
    const point = { x: 5, y: 5 }
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 10 }

    expect(pointNearLine(point, a, b)).toBe(true)
  })

  it('returns false when point is far from line', () => {
    const point = { x: 100, y: 100 }
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 10 }

    expect(pointNearLine(point, a, b)).toBe(false)
  })

  it('respects custom threshold', () => {
    const point = { x: 5, y: 10 }
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 0 }

    expect(pointNearLine(point, a, b, 2)).toBe(false)
    expect(pointNearLine(point, a, b, 12)).toBe(true)
  })
})

describe('pointInRect', () => {
  it('returns true when point is inside rect', () => {
    expect(pointInRect({ x: 5, y: 5 }, 0, 0, 10, 10)).toBe(true)
  })

  it('returns false when point is outside rect', () => {
    expect(pointInRect({ x: 15, y: 15 }, 0, 0, 10, 10)).toBe(false)
  })

  it('handles tolerance', () => {
    expect(pointInRect({ x: -2, y: 5 }, 0, 0, 10, 10, 3)).toBe(true)
    expect(pointInRect({ x: -5, y: 5 }, 0, 0, 10, 10, 3)).toBe(false)
  })
})

describe('hitTestElement', () => {
  const rectangle: CanvasElement = {
    id: '1',
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    strokeColor: '#000',
    strokeWidth: 2,
    roughness: 1,
    seed: 123,
    version: 1,
  }

  const ellipse: CanvasElement = {
    id: '2',
    type: 'ellipse',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    strokeColor: '#000',
    strokeWidth: 2,
    roughness: 1,
    seed: 123,
    version: 1,
  }

  it('hits rectangle inside', () => {
    expect(hitTestElement({ x: 50, y: 25 }, rectangle)).toBe(true)
  })

  it('misses rectangle outside', () => {
    expect(hitTestElement({ x: 150, y: 150 }, rectangle)).toBe(false)
  })

  it('hits ellipse inside', () => {
    expect(hitTestElement({ x: 50, y: 50 }, ellipse)).toBe(true)
  })

  it('misses ellipse outside', () => {
    expect(hitTestElement({ x: 100, y: 100 }, ellipse)).toBe(false)
  })

  it('respects tolerance', () => {
    expect(hitTestElement({ x: -5, y: 25 }, rectangle, 10)).toBe(true)
    expect(hitTestElement({ x: -15, y: 25 }, rectangle, 10)).toBe(false)
  })
})

describe('getElementBounds', () => {
  it('returns bounds for rectangle', () => {
    const element: CanvasElement = {
      id: '1',
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      strokeColor: '#000',
      strokeWidth: 2,
      roughness: 1,
      seed: 123,
      version: 1,
    }

    const bounds = getElementBounds(element)

    expect(bounds).toEqual({ x: 10, y: 20, width: 100, height: 50 })
  })

  it('calculates bounds for freehand', () => {
    const element: CanvasElement = {
      id: '1',
      type: 'freehand',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      points: [
        { x: 10, y: 20 },
        { x: 50, y: 80 },
        { x: 30, y: 40 },
      ],
      strokeColor: '#000',
      strokeWidth: 2,
      roughness: 1,
      seed: 123,
      version: 1,
    }

    const bounds = getElementBounds(element)

    expect(bounds.x).toBe(10)
    expect(bounds.y).toBe(20)
    expect(bounds.width).toBe(40)
    expect(bounds.height).toBe(60)
  })
})
