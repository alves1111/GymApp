export const round = n => Math.round(n * 100) / 100

export function lastEntry(log, exerciseId) {
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].exerciseId === exerciseId) return log[i]
  }
  return null
}

export function lastEntries(log, exerciseId, n) {
  const found = []
  for (let i = log.length - 1; i >= 0 && found.length < n; i--) {
    if (log[i].exerciseId === exerciseId) found.push(log[i])
  }
  return found
}

export function lastSlotEntry(log, slotId) {
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].slotId === slotId && log[i].date) return log[i]
  }
  return null
}

export function lastExerciseForSlot(log, slotId) {
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].slotId === slotId && log[i].date) return log[i].exerciseId
  }
  return null
}

export function repRange(slot, exercise) {
  return {
    min: exercise.repMin ?? slot.repMin,
    max: exercise.repMax ?? slot.repMax,
  }
}

export function suggest(slot, exercise, log, step) {
  const { min, max } = repRange(slot, exercise)
  const base = min ?? 8
  const last = lastEntry(log, exercise.id)
  if (!last) return { weight: null, reps: [base, base], increase: false, last: null }

  const top = last.reps.slice(0, 2)
  const reps = [top[0] ?? base, top[1] ?? top[0] ?? base]
  const hit = max != null && top.length === 2 && top.every(r => r >= max)

  if (hit && !exercise.bodyweight && last.weight != null && step > 0) {
    return { weight: round(last.weight + step), reps: [base, base], increase: true, last }
  }
  return { weight: last.weight, reps, increase: false, last }
}

export function nextWorkoutId(sessions, workouts) {
  const last = sessions[sessions.length - 1]
  if (!last) return null
  const i = workouts.findIndex(w => w.id === last.workoutId)
  return workouts[(i + 1) % workouts.length].id
}

export function formatKg(n) {
  return n == null ? '–' : String(round(n)).replace('.', ',')
}

export function formatReps(reps) {
  return reps.length ? reps.join(' / ') : '–'
}

export function formatEntry(entry, exercise) {
  if (exercise.bodyweight) return `${formatReps(entry.reps)} toistoa`
  return `${formatKg(entry.weight)} kg · ${formatReps(entry.reps)}`
}

export function formatRange(slot, exercise) {
  const { min, max } = repRange(slot, exercise)
  if (min == null && max == null) return 'max'
  return `${min}–${max}`
}

export function parseKg(text) {
  const n = parseFloat(String(text).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? round(n) : null
}
