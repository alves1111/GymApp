import { findExercise } from './program.js'

const history = {
  'pp-kassari': [[22.5, [7, 6]], [22.5, [9, 8]], [25, [5, 5]]],
  'pp-laite': [[30, [8, 5]], [30, [8, 7]]],
  'pp-smith': [[40, [8, 7]], [40, [9, 6]]],
  'rinta-kp': [[22.5, [10, 7]], [22.5, [9, 7]], [25, [8, 7]], [25, [6, 6]]],
  'rinta-talja': [[36, [9, 8]], [40, [8, 8]], [36, [9, 6]]],
  'vipu-laite': [[30, [15, 10]], [40, [15, 8]], [30, [13]]],
  'vipu-talja': [[6, []]],
  'to-peckdeck': [[30, [9, 9]], [35, [8, 5]]],
  'to-talja': [[9, [12, 8]]],
  'yt-tanko': [[50, [12, 8, 10]]],
  'yt-kahvat': [[42.4, [9, 9, 8]]],
  'yt-laite': [[90, [7, 7]], [90, [9, 8]]],
  'yt-laite-kahvat': [[105, [6]], [100, [7]], [100, [8, 7]], [100, [7, 7]]],
  'yt-laite2': [[40, [8, 6]]],
  'yt-leuat': [[null, [6, 4, 4]], [null, [6, 4, 5]]],
  'at-talja': [[60, [6, 5]]],
  'at-cybex': [[103, [6, 5]], [103, [4]], [94, [6]], [94, [8]], [94, [7, 7]]],
  'ks-tbar': [[35, [9]], [40, [7]]],
  'jalat-kraftwerk': [[15, [8, 6]], [20, [8, 7]], [25, [7]]],
  'jalat-prassi': [[110, [10]], [125, [8]], [130, [9, 8]], [140, [7]]],
  'jalat-1prassi': [[70, [7, 7]], [60, [10, 10]], [60, [10, 10]]],
  'pohkeet': [[35, [15, 15]]],
  'hauis-hammer': [[17.5, [12, 10, 9]], [21, [10]], [25, [7]], [25, [8, 7]]],
  'hauis-musta': [[15, [9, 5]], [15, [8]]],
  'hauis-tanko': [[17.5, [8, 7]], [20, [4, 5]]],
  'oj-koysi': [[21, [12, 8]]],
  'oj-koysi1': [[10, [8, 7]]],
  'oj-flex': [[50, [10, 8]], [50, [12, 11]]],
  'oj-maxpump': [[30, [8, 6]], [30, [8, 8]]],
  'oj-atlantis': [[34, [15]], [41, [12]], [41, [12, 6]]],
  'vatsat-koysi': [[36, [13, 12]], [40, [8, 7]], [40, [7, 7]], [40, [9, 11]], [40, [15, 10]], [40, [11]], [40, [13, 10]]],
  'jalannostot': [[4, [8, 6]]],
}

export function seedLog() {
  const log = []
  for (const [exerciseId, rows] of Object.entries(history)) {
    const { slotId } = findExercise(exerciseId)
    for (const [weight, reps] of rows) {
      log.push({ slotId, exerciseId, weight, reps, date: null })
    }
  }
  return log
}
