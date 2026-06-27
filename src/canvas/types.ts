export type Tool =
  | 'select'
  | 'rectangle'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'freehand'
  | 'text'

export interface Point {
  x: number
  y: number
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface CanvasElement {
  id: string
  type:
    | 'rectangle'
    | 'ellipse'
    | 'arrow'
    | 'line'
    | 'freehand'
    | 'text'
    | 'image'
    | 'group'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  strokeColor: string
  backgroundColor?: string
  strokeWidth?: number
  roughness?: number
  seed?: number
  points?: Point[]
  text?: string
  src?: string
  groupChildren?: string[]
  version: number
}
