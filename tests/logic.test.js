import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slots, workouts, findExercise } from '../js/program.js'
import { seedLog } from '../js/seed.js'
import { suggest, lastEntries, lastSlotEntry, lastExerciseForSlot, nextWorkoutId, parseKg, formatKg } from '../js/logic.js'

const ex = id => findExercise(id)

test('kaikki treenien slotit löytyvät ohjelmasta', () => {
  for (const w of workouts) for (const id of w.slots) assert.ok(slots[id], id)
})

test('seed-historian jokainen liike löytyy ohjelmasta', () => {
  for (const row of seedLog()) assert.ok(ex(row.exerciseId), row.exerciseId)
})

test('tavoite täyttyy -> paino nousee askeleella', () => {
  const { slot, exercise } = ex('pohkeet')
  const s = suggest(slot, exercise, seedLog(), exercise.step)
  assert.equal(s.increase, true)
  assert.equal(s.weight, 40)
  assert.deepEqual(s.reps, [10, 10])
})

test('tavoite ei täyty -> sama paino ja viime toistot', () => {
  const { slot, exercise } = ex('rinta-talja')
  const s = suggest(slot, exercise, seedLog(), exercise.step)
  assert.equal(s.increase, false)
  assert.equal(s.weight, 36)
  assert.deepEqual(s.reps, [9, 6])
})

test('liikekohtainen toistoraja ylikirjoittaa slotin rajan', () => {
  const { slot, exercise } = ex('at-cybex')
  const log = [{ exerciseId: 'at-cybex', weight: 94, reps: [8, 8] }]
  assert.equal(suggest(slot, exercise, log, 9).increase, false)
  log.push({ exerciseId: 'at-cybex', weight: 94, reps: [9, 9] })
  assert.equal(suggest(slot, exercise, log, 9).weight, 103)
})

test('vain yksi sarja kirjattu -> ei nostoa', () => {
  const { slot, exercise } = ex('ks-tbar')
  const s = suggest(slot, exercise, [{ exerciseId: 'ks-tbar', weight: 40, reps: [9] }], 5)
  assert.equal(s.increase, false)
  assert.deepEqual(s.reps, [9, 9])
})

test('kehonpainoliike ei ehdota painoa', () => {
  const { slot, exercise } = ex('yt-leuat')
  const s = suggest(slot, exercise, [{ exerciseId: 'yt-leuat', weight: null, reps: [10, 10] }], 0)
  assert.equal(s.increase, false)
  assert.equal(s.weight, null)
})

test('ei historiaa -> tyhjä paino, toistot alarajasta', () => {
  const { slot, exercise } = ex('pp-smith')
  assert.deepEqual(suggest(slot, exercise, [], 5), { weight: null, reps: [6, 6], increase: false, last: null })
})

test('viimeksi tehty liike slotissa ohittaa vihkodatan', () => {
  const log = seedLog()
  assert.equal(lastExerciseForSlot(log, 'rinta'), null)
  log.push({ slotId: 'rinta', exerciseId: 'rinta-talja', weight: 36, reps: [9, 9], date: '2026-09-30' })
  assert.equal(lastExerciseForSlot(log, 'rinta'), 'rinta-talja')
})

test('treenit vuorottelevat', () => {
  assert.equal(nextWorkoutId([], workouts), null)
  assert.equal(nextWorkoutId([{ workoutId: 'etu' }], workouts), 'taka')
  assert.equal(nextWorkoutId([{ workoutId: 'taka' }], workouts), 'etu')
})

test('painon parsinta ja muotoilu pilkulla', () => {
  assert.equal(parseKg('22,5'), 22.5)
  assert.equal(parseKg('abc'), null)
  assert.equal(formatKg(22.5), '22,5')
})

test('lastEntries palauttaa uusimmat ensin ja enintään n kpl', () => {
  const log = seedLog()
  const two = lastEntries(log, 'rinta-talja', 2)
  assert.deepEqual(two.map(e => e.weight), [36, 40])
  assert.equal(lastEntries(log, 'pohkeet', 2).length, 1)
  assert.equal(lastEntries(log, 'ei-ole', 2).length, 0)
})

test('lastSlotEntry löytää slotin viimeisimmän päivätyn merkinnän, vihkoa ei lasketa', () => {
  assert.equal(lastSlotEntry(seedLog(), 'ylatalja'), null)
  const log = [...seedLog(), { slotId: 'ylatalja', exerciseId: 'yt-tanko', weight: 55, reps: [8, 8], date: '2026-09-30' }]
  assert.equal(lastSlotEntry(log, 'ylatalja').weight, 55)
  assert.equal(lastSlotEntry([], 'ylatalja'), null)
})
