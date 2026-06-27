import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CanvasElement } from '../canvas/types.ts'

const DB_NAME = 'jamboard-db'
const DB_VERSION = 1
const STORE_NAME = 'canvas'
const KEY = 'state'

interface JamboardDB extends DBSchema {
  canvas: {
    key: string
    value: {
      elements: CanvasElement[]
      updatedAt: string
    }
  }
}

let dbPromise: Promise<IDBPDatabase<JamboardDB>> | null = null

function getDb(): Promise<IDBPDatabase<JamboardDB>> {
  if (!dbPromise) {
    dbPromise = openDB<JamboardDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

export async function saveCanvas(elements: CanvasElement[]): Promise<void> {
  const db = await getDb()
  await db.put(STORE_NAME, { elements, updatedAt: new Date().toISOString() }, KEY)
}

export async function loadCanvas(): Promise<CanvasElement[] | null> {
  const db = await getDb()
  const record = await db.get(STORE_NAME, KEY)
  return record?.elements ?? null
}

export async function clearCanvas(): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, KEY)
}
