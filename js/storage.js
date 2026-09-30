import { seedLog } from './seed.js'

const KEY = 'gymapp:v1'

export function emptyData() {
  return { log: seedLog(), sessions: [], steps: {}, current: null }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return emptyData()
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

export function isValidBackup(data) {
  return data && Array.isArray(data.log) && Array.isArray(data.sessions)
}
