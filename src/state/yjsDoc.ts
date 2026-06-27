import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import type { CanvasElement } from '../canvas/types.ts'

const WS_URL = 'wss://demos.yjs.dev/ws'
const ROOM_NAME = 'jamboard-collab-room'

export interface CollaborationDoc {
  doc: Y.Doc
  provider: WebsocketProvider
  elements: Y.Array<CanvasElement>
  awareness: WebsocketProvider['awareness']
}

let instance: CollaborationDoc | null = null

export function getCollaborationDoc(room = ROOM_NAME): CollaborationDoc {
  if (instance) return instance

  const doc = new Y.Doc()
  const provider = new WebsocketProvider(WS_URL, room, doc)
  const elements = doc.getArray<CanvasElement>('elements')
  const awareness = provider.awareness

  instance = { doc, provider, elements, awareness }
  return instance
}

export function destroyCollaborationDoc() {
  if (instance) {
    instance.provider.destroy()
    instance.doc.destroy()
    instance = null
  }
}
