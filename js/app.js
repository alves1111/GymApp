import { slots, workouts, SETS, findExercise } from './program.js'
import { load, save, isValidBackup } from './storage.js'
import {
  suggest, lastEntries, lastSlotEntry, nextWorkoutId,
  formatKg, formatEntry, formatRange, parseKg, round,
} from './logic.js'

let data = load()
let ui = { confirmQuit: false, toast: '', weightError: false, moreOpen: false }
let lastViewKey = null
const app = document.getElementById('app')

function commit() {
  save(data)
  render()
}

function stepFor(exercise) {
  return data.steps[exercise.id] ?? exercise.step
}

function currentWorkout() {
  return workouts.find(w => w.id === data.current.workoutId)
}

function isOverview() {
  const { index } = data.current
  return index == null || index < 0 || index >= currentWorkout().slots.length
}

function makeDraft(slotId, exerciseId) {
  const slot = slots[slotId]
  const entry = data.current.entries[slotId]
  const saved = entry && !entry.skipped ? entry : null
  const id = exerciseId ?? saved?.exerciseId ?? (slot.exercises.length === 1 ? slot.exercises[0].id : null)
  if (!id) return { slotId, exerciseId: null }
  if (saved && saved.exerciseId === id) {
    return { slotId, exerciseId: id, weight: saved.weight, reps: [...saved.reps] }
  }
  const exercise = slot.exercises.find(e => e.id === id)
  const s = suggest(slot, exercise, data.log, stepFor(exercise))
  return { slotId, exerciseId: id, weight: s.weight, reps: s.reps }
}

function openSlot(index) {
  const slotIds = currentWorkout().slots
  const valid = index != null && index >= 0 && index < slotIds.length
  data.current.index = valid ? index : null
  data.current.draft = valid ? makeDraft(slotIds[index]) : null
  ui.weightError = false
  ui.confirmQuit = false
}

function nextOpenIndex(from) {
  const slotIds = currentWorkout().slots
  for (let i = from; i < slotIds.length; i++) {
    if (!data.current.entries[slotIds[i]]) return i
  }
  return null
}

const actions = {
  start(el) {
    data.current = { workoutId: el.dataset.id, startedAt: new Date().toISOString(), index: null, entries: {}, draft: null }
    ui.confirmQuit = false
  },
  begin() {
    openSlot(nextOpenIndex(0) ?? 0)
  },
  overview() {
    openSlot(null)
  },
  prev() {
    openSlot(data.current.index - 1)
  },
  goto(el) {
    openSlot(Number(el.dataset.index))
  },
  choose(el) {
    data.current.draft = makeDraft(data.current.draft.slotId, el.dataset.id)
  },
  change() {
    data.current.draft = { slotId: data.current.draft.slotId, exerciseId: null }
  },
  weight(el) {
    const { exercise } = findExercise(data.current.draft.exerciseId)
    const step = stepFor(exercise) || 1
    const w = data.current.draft.weight ?? 0
    data.current.draft.weight = Math.max(0, round(w + step * Number(el.dataset.d)))
    ui.weightError = false
  },
  reps(el) {
    const reps = data.current.draft.reps
    const i = Number(el.dataset.i)
    reps[i] = Math.max(0, reps[i] + Number(el.dataset.d))
  },
  save() {
    const draft = data.current.draft
    const { exercise } = findExercise(draft.exerciseId)
    if (!exercise.bodyweight && draft.weight == null) {
      ui.weightError = true
      return
    }
    data.current.entries[draft.slotId] = {
      exerciseId: draft.exerciseId,
      weight: exercise.bodyweight ? null : draft.weight,
      reps: [...draft.reps],
    }
    openSlot(nextOpenIndex(data.current.index + 1))
  },
  skip() {
    data.current.entries[data.current.draft.slotId] = { skipped: true }
    openSlot(nextOpenIndex(data.current.index + 1))
  },
  quit() {
    ui.confirmQuit = !ui.confirmQuit
  },
  discard() {
    data.current = null
    ui.confirmQuit = false
  },
  finish() {
    const { workoutId, entries, startedAt } = data.current
    const date = new Date().toISOString()
    const sessionId = startedAt
    for (const slotId of currentWorkout().slots) {
      const entry = entries[slotId]
      if (!entry || entry.skipped) continue
      data.log.push({ slotId, exerciseId: entry.exerciseId, weight: entry.weight, reps: entry.reps, date, sessionId, workoutId })
    }
    data.sessions.push({ id: sessionId, workoutId, date })
    data.current = null
    ui.toast = 'Treeni tallennettu 💪'
    setTimeout(() => { ui.toast = ''; render() }, 2500)
  },
  export() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `gymapp-varmuuskopio-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  },
}

app.addEventListener('click', e => {
  const el = e.target.closest('[data-action]')
  if (!el || !actions[el.dataset.action]) return
  actions[el.dataset.action](el)
  commit()
})

app.addEventListener('input', e => {
  if (e.target.id === 'weightInput') {
    data.current.draft.weight = parseKg(e.target.value)
    ui.weightError = false
    save(data)
  }
  if (e.target.classList.contains('reps-input')) {
    const n = parseInt(e.target.value, 10)
    data.current.draft.reps[Number(e.target.dataset.i)] = Number.isFinite(n) && n >= 0 ? n : 0
    save(data)
  }
})

app.addEventListener('focusin', e => {
  if (e.target.matches('#weightInput, .reps-input')) e.target.select()
})

app.addEventListener('change', e => {
  if (e.target.id === 'stepInput') {
    const n = parseKg(e.target.value)
    if (n != null) data.steps[data.current.draft.exerciseId] = n
    commit()
  }
  if (e.target.id === 'importFile') importBackup(e.target.files[0])
})

app.addEventListener('toggle', e => {
  if (e.target.classList.contains('more')) ui.moreOpen = e.target.open
}, true)

async function importBackup(file) {
  if (!file) return
  try {
    const parsed = JSON.parse(await file.text())
    if (!isValidBackup(parsed)) throw new Error()
    data = parsed
    ui.toast = 'Varmuuskopio palautettu'
  } catch {
    ui.toast = 'Tiedostoa ei voitu lukea'
  }
  setTimeout(() => { ui.toast = ''; render() }, 2500)
  commit()
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fi-FI', { weekday: 'short', day: 'numeric', month: 'numeric' })
}

function homeView() {
  const next = nextWorkoutId(data.sessions, workouts)
  return `
    <header class="top"><h1>GymApp</h1></header>
    <main>
      <p class="lead">Mikä treeni tänään?</p>
      ${workouts.map(w => {
        const last = [...data.sessions].reverse().find(s => s.workoutId === w.id)
        return `
          <button class="big ${next === w.id ? 'is-next' : ''}" data-action="start" data-id="${w.id}">
            <span class="big-row"><span class="big-title">${w.name}</span>${next === w.id ? '<span class="tag">Vuorossa</span>' : ''}</span>
            <span class="big-sub">${w.subtitle}</span>
            <span class="big-meta">${last ? 'Viimeksi ' + formatDate(last.date) : 'Ei vielä tehty sovelluksella'}</span>
          </button>`
      }).join('')}
      <div class="backup">
        <button class="link" data-action="export">Vie varmuuskopio</button>
        <label class="link">Tuo varmuuskopio<input type="file" id="importFile" accept="application/json,.json" hidden></label>
      </div>
    </main>`
}

function slotStatus(slotId) {
  const slot = slots[slotId]
  const entry = data.current.entries[slotId]
  if (entry?.skipped) return { cls: 'is-skipped', mark: '–', text: 'Ohitettu' }
  if (entry) {
    const { exercise } = findExercise(entry.exerciseId)
    return { cls: 'is-done', mark: '✓', text: `${exercise.name} · ${formatEntry(entry, exercise)}` }
  }
  const last = lastSlotEntry(data.log, slotId) ?? (slot.exercises.length === 1 ? lastEntries(data.log, slot.exercises[0].id, 1)[0] : null)
  if (!last) return { cls: '', mark: '', text: slot.exercises.length > 1 ? `${slot.exercises.length} liikevaihtoehtoa` : 'Ei merkintöjä' }
  const { exercise } = findExercise(last.exerciseId)
  const name = slot.exercises.length > 1 ? exercise.name + ' · ' : ''
  return { cls: '', mark: '', text: `Viimeksi ${name}${formatEntry(last, exercise)}` }
}

function overviewView(workout) {
  const entries = data.current.entries
  const started = Object.keys(entries).length > 0
  const anyDone = workout.slots.some(id => entries[id] && !entries[id].skipped)
  const next = nextOpenIndex(0)
  return `
    <ul class="plan">
      ${workout.slots.map((id, i) => {
        const slot = slots[id]
        const st = slotStatus(id)
        return `
          <li>
            <button class="plan-item ${st.cls}" data-action="goto" data-index="${i}">
              <span class="plan-mark">${st.mark || i + 1}</span>
              <span class="plan-text">
                <span class="plan-name">${slot.name}${slot.optional ? ' <span class="opt">valinnainen</span>' : ''}</span>
                <span class="plan-status">${st.text}</span>
              </span>
            </button>
          </li>`
      }).join('')}
    </ul>
    <div class="actions even">
      ${anyDone ? `<button class="${next == null ? 'primary' : 'secondary'}" data-action="finish">Tallenna treeni</button>` : ''}
      ${next != null ? `<button class="primary" data-action="begin">${started ? 'Jatka →' : 'Aloita treeni'}</button>` : ''}
    </div>`
}

function slotHeader(slot, extra = '') {
  return `
    <div class="title-row">
      <h2 class="slot-title">${slot.name}</h2>
      ${extra}
    </div>`
}

function chooserView(slotId) {
  const slot = slots[slotId]
  const last = lastSlotEntry(data.log, slotId)
  return `
    <section class="card">
      ${slotHeader(slot)}
      <p class="meta">Valitse liike · tavoite 2 × ${formatRange(slot, {})}</p>
      <div class="choices">
        ${slot.exercises.map(ex => {
          const [prev] = lastEntries(data.log, ex.id, 1)
          const s = suggest(slot, ex, data.log, stepFor(ex))
          return `
            <button class="choice" data-action="choose" data-id="${ex.id}">
              <span class="choice-row"><span class="choice-name">${ex.name}</span>${last?.exerciseId === ex.id ? '<span class="tag">Viimeksi</span>' : ''}</span>
              <span class="choice-last">${prev ? formatEntry(prev, ex) : 'Ei merkintöjä'}${s.increase ? ' <span class="up">↑ nosta</span>' : ''}</span>
            </button>`
        }).join('')}
      </div>
    </section>
    <div class="actions">
      <button class="secondary back" data-action="prev" aria-label="Edellinen liike">←</button>
      <button class="secondary" data-action="skip">Ohita</button>
    </div>`
}

function recentView(exercise) {
  const recent = lastEntries(data.log, exercise.id, 2)
  return `
    <div class="recent">
      ${[0, 1].map(i => {
        const h = recent[i]
        const label = i === 0 ? 'Viimeksi' : 'Sitä ennen'
        const date = h?.date ? ` <small>${formatDate(h.date)}</small>` : ''
        return `<div class="recent-row"><span>${label}${date}</span><strong>${h ? formatEntry(h, exercise) : '–'}</strong></div>`
      }).join('')}
    </div>`
}

function loggerView(slotId, draft) {
  const slot = slots[slotId]
  const exercise = slot.exercises.find(e => e.id === draft.exerciseId)
  const step = stepFor(exercise)
  const s = suggest(slot, exercise, data.log, step)
  const tags = [exercise.oneSide && 'vasen puoli', slot.optional && 'valinnainen'].filter(Boolean)
  const multi = slot.exercises.length > 1
  const editing = data.current.entries[slotId] && !data.current.entries[slotId].skipped

  return `
    <section class="card">
      ${slotHeader(slot, multi ? '<button class="link" data-action="change">Vaihda liike</button>' : '')}
      ${exercise.name !== slot.name ? `<p class="exercise-name">${exercise.name}</p>` : ''}
      <p class="meta">Tavoite 2 × ${formatRange(slot, exercise)}${tags.length ? ' · ' + tags.join(' · ') : ''}</p>
      ${slot.note ? `<p class="note">${slot.note}</p>` : ''}
      ${s.increase ? `<div class="banner">Tavoite täyttyi viime kerralla → ${formatKg(s.last.weight)} kg nostetaan ${formatKg(s.weight)} kg:aan</div>` : ''}

      ${exercise.bodyweight ? '' : `
        <div class="weight ${ui.weightError ? 'has-error' : ''}">
          <button class="round" data-action="weight" data-d="-1" aria-label="Vähennä painoa">−</button>
          <label class="weight-field">
            <input id="weightInput" inputmode="decimal" autocomplete="off" value="${draft.weight == null ? '' : formatKg(draft.weight)}" placeholder="0">
            <span>kg</span>
          </label>
          <button class="round" data-action="weight" data-d="1" aria-label="Lisää painoa">+</button>
        </div>
        ${ui.weightError ? '<p class="error">Syötä paino</p>' : ''}`}

      <div class="sets">
        ${Array.from({ length: SETS }, (_, i) => `
          <div class="set">
            <span class="set-label">Sarja ${i + 1}</span>
            <button class="round small" data-action="reps" data-i="${i}" data-d="-1" aria-label="Vähemmän toistoja">−</button>
            <input class="reps-input" data-i="${i}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${draft.reps[i]}" aria-label="Sarjan ${i + 1} toistot">
            <button class="round small" data-action="reps" data-i="${i}" data-d="1" aria-label="Enemmän toistoja">+</button>
          </div>`).join('')}
      </div>

      ${recentView(exercise)}

      ${exercise.bodyweight ? '' : `
        <details class="more" ${ui.moreOpen ? 'open' : ''}>
          <summary>Asetukset</summary>
          <label class="step">Painoaskel <input id="stepInput" inputmode="decimal" value="${formatKg(step)}"> kg</label>
        </details>`}
    </section>
    <div class="actions">
      <button class="secondary back" data-action="prev" aria-label="Edellinen liike">←</button>
      <button class="secondary" data-action="skip">Ohita</button>
      <button class="primary" data-action="save">${editing ? 'Päivitä →' : 'Tallenna →'}</button>
    </div>`
}

function workoutView() {
  const workout = currentWorkout()
  const { index, draft, entries } = data.current
  const total = workout.slots.length
  const overview = isOverview()
  const done = workout.slots.filter(id => entries[id]).length

  let body
  if (overview) body = overviewView(workout)
  else if (!draft.exerciseId) body = chooserView(draft.slotId)
  else body = loggerView(draft.slotId, draft)

  return `
    <header class="top">
      ${overview
        ? '<button class="icon" data-action="quit" aria-label="Keskeytä treeni">✕</button>'
        : '<button class="icon" data-action="overview" aria-label="Treenin kaikki liikkeet">☰</button>'}
      <h1>${workout.name}</h1>
      <span class="count">${overview ? `${done} / ${total}` : `${index + 1} / ${total}`}</span>
    </header>
    ${overview && ui.confirmQuit ? `
      <div class="confirm">
        <span>Hylätäänkö treeni? Merkintöjä ei tallenneta.</span>
        <button class="danger" data-action="discard">Hylkää</button>
        <button class="secondary" data-action="quit">Jatka</button>
      </div>` : ''}
    <main>${body}</main>`
}

function render() {
  app.innerHTML = (data.current ? workoutView() : homeView()) + (ui.toast ? `<div class="toast">${ui.toast}</div>` : '')
  const viewKey = data.current ? `${data.current.workoutId}:${isOverview() ? 'overview' : data.current.index}` : 'home'
  if (viewKey !== lastViewKey) window.scrollTo(0, 0)
  lastViewKey = viewKey
}

render()

if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  navigator.serviceWorker.register('./sw.js')
}
