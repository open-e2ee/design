/*
 * The spellings this repository rejects, and what to write instead. This list
 * lives in its own file because a British spelling is the correct thing to
 * write here. The lint in `test.mjs` skips this file and `test.mjs` itself,
 * since both spell the words out, and checks every other written surface
 * against the entries below.
 *
 * Each entry carries its own pattern because a bare stem matches correct
 * English. Unbounded, `characteris` matches "characteristic", `organis` matches
 * "organism", and `generalis` matches "generalist". A guard that fails a build
 * over correct spelling gets deleted rather than fixed, so the -ise stems only
 * match the endings that make them verbs.
 *
 * The pairs are the ones this repository drifted on, not a general list. The
 * website keeps a wider list in `tests/spelling.test.mjs`, because it drifted
 * further. Add a pair here when this repository drifts, not before.
 */
export const AMERICAN_SPELLINGS = [
  { pattern: /colour/i, british: 'colour', american: 'color' },
  { pattern: /\bgrey(?:s|scale)?\b/i, british: 'grey', american: 'gray' },
  { pattern: /\bcentre(?:s|d)?\b/i, british: 'centre', american: 'center' },
  { pattern: /defence/i, british: 'defence', american: 'defense' },
  { pattern: /honour/i, british: 'honour', american: 'honor' },
  { pattern: /candour/i, british: 'candour', american: 'candor' },
  { pattern: /licence/i, british: 'licence', american: 'license' },
  { pattern: /judgement/i, british: 'judgement', american: 'judgment' },
  { pattern: /behaviour/i, british: 'behaviour', american: 'behavior' },
  { pattern: /favour/i, british: 'favour', american: 'favor' },
  {
    pattern: /travell(?:ed|ing|er|ers)\b/i,
    british: 'travelling',
    american: 'traveling',
  },
  {
    pattern: /(?:generalis|characteris|organis|recognis)(?:e|es|ed|ing|ation|ations)\b/i,
    british: 'organise',
    american: 'organize',
  },
];
