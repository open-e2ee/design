/*
 * The spellings this repository rejects, and what to write instead. The list
 * lives in its own file for one reason. This file is the one place here where a
 * British spelling is the right thing to write. The lint in `test.mjs` skips it
 * and `test.mjs` itself, since both spell the words out, and checks every other
 * written surface against the entries below.
 *
 * Each entry carries its own pattern, because a bare stem also matches correct
 * English. Unbounded, `characteris` matches "characteristic", `organis` matches
 * "organism", and `generalis` matches "generalist". None of those three words
 * appears here today, so a bare stem passes now and fails the first time
 * somebody writes one. A lint that fails a build over correct spelling gets
 * deleted rather than fixed.
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
