export const slots = {
  pystypunnerrus: {
    name: 'Pystypunnerrus', repMin: 6, repMax: 9, note: 'Kyynerpäät linjassa kropan kanssa',
    exercises: [
      { id: 'pp-kassari', name: 'Kässäri', step: 2.5 },
      { id: 'pp-laite', name: 'Laite', step: 5 },
      { id: 'pp-smith', name: 'Smith', step: 5 },
    ],
  },
  rinta: {
    name: 'Rinta', repMin: 6, repMax: 9,
    exercises: [
      { id: 'rinta-kp', name: 'Penkki käsipainoilla', step: 2.5 },
      { id: 'rinta-talja', name: 'Rinta taljassa', step: 4 },
    ],
  },
  vipunostot: {
    name: 'Vipunostot', repMin: 10, repMax: 15,
    exercises: [
      { id: 'vipu-laite', name: 'Laite', step: 5 },
      { id: 'vipu-talja', name: 'Talja', step: 1 },
    ],
  },
  takaolkapaa: {
    name: 'Takaolkapää', repMin: 8, repMax: 12,
    exercises: [
      { id: 'to-peckdeck', name: 'Peckdeck', step: 5 },
      { id: 'to-talja', name: 'Taljassa', step: 1 },
    ],
  },
  ylatalja: {
    name: 'Ylätalja', repMin: 6, repMax: 9, note: 'Kyynerpäät lantioon',
    exercises: [
      { id: 'yt-tanko', name: 'Tanko', step: 5 },
      { id: 'yt-kahvat', name: 'Kahvoilla', step: 5 },
      { id: 'yt-laite', name: 'Laite', step: 5 },
      { id: 'yt-laite-kahvat', name: 'Laite kahvoilla', step: 5 },
      { id: 'yt-laite2', name: 'Laite 2', step: 5 },
      { id: 'yt-leuat', name: 'Leuat', step: 0, bodyweight: true },
    ],
  },
  alatalja: {
    name: 'Alatalja', repMin: 6, repMax: 8,
    exercises: [
      { id: 'at-talja', name: 'Taljassa', step: 5 },
      { id: 'at-cybex', name: 'Cybex', step: 9, repMax: 9 },
    ],
  },
  kulmasoutu: {
    name: 'Kulmasoutu', repMin: 6, repMax: 9, optional: true,
    exercises: [{ id: 'ks-tbar', name: 'T-bar', step: 5 }],
  },
  jalat: {
    name: 'Jalat', repMin: 6, repMax: 9,
    exercises: [
      { id: 'jalat-kraftwerk', name: 'Kraftwerk', step: 5 },
      { id: 'jalat-prassi', name: 'Prässi', step: 10 },
      { id: 'jalat-1prassi', name: '1 jalan prässi', step: 10, oneSide: true },
    ],
  },
  pohkeet: {
    name: 'Pohkeet', repMin: 10, repMax: 15,
    exercises: [{ id: 'pohkeet', name: 'Pohkeet', step: 5 }],
  },
  hauis: {
    name: 'Hauis', repMin: 8, repMax: 12,
    exercises: [
      { id: 'hauis-hammer', name: 'Hammer narulla', step: 4 },
      { id: 'hauis-musta', name: 'Musta laite', step: 5 },
      { id: 'hauis-tanko', name: 'Tangolla', step: 2.5 },
    ],
  },
  ojentaja: {
    name: 'Ojentaja', repMin: 8, repMax: 12,
    exercises: [
      { id: 'oj-koysi', name: 'Köysi', step: 4 },
      { id: 'oj-koysi1', name: 'Köysi 1 kädellä', step: 2.5, oneSide: true },
      { id: 'oj-flex', name: 'Flex fitness', step: 5 },
      { id: 'oj-maxpump', name: 'Maxpump', step: 5 },
      { id: 'oj-atlantis', name: 'Atlantis', step: 7 },
    ],
  },
  vatsatKoysi: {
    name: 'Vatsat köydellä', repMin: 10, repMax: 15,
    exercises: [{ id: 'vatsat-koysi', name: 'Vatsat köydellä', step: 4 }],
  },
  jalannostot: {
    name: 'Jalannostot', repMin: null, repMax: null,
    exercises: [{ id: 'jalannostot', name: 'Jalannostot', step: 2 }],
  },
}

const common = ['jalat', 'pohkeet', 'hauis', 'ojentaja', 'vatsatKoysi', 'jalannostot']

export const workouts = [
  { id: 'etu', name: 'ETU', subtitle: 'Olkapää · rinta · jalat · kädet · vatsat', slots: ['pystypunnerrus', 'rinta', 'vipunostot', 'takaolkapaa', ...common] },
  { id: 'taka', name: 'TAKA', subtitle: 'Selkä · jalat · kädet · vatsat', slots: ['ylatalja', 'alatalja', 'kulmasoutu', ...common] },
]

export const SETS = 2

export function findExercise(exerciseId) {
  for (const [slotId, slot] of Object.entries(slots)) {
    const exercise = slot.exercises.find(e => e.id === exerciseId)
    if (exercise) return { slotId, slot, exercise }
  }
  return null
}
