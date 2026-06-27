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

export interface ConnectionBinding {
  elementId: string
  focus: number // -1 to 1, which connection point on the target
  gap: number // distance from element edge
  index: number // which connection point (0=top, 1=right, 2=bottom, 3=left)
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
  startBinding?: ConnectionBinding | null
  endBinding?: ConnectionBinding | null
  version: number
}
