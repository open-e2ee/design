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
 *
 * Where a doubled `l` needs a boundary, it goes at the end and nowhere else.
 * The trailing one already excludes `aria-labelledby`, since `d` and `b` are
 * both word characters. A leading one adds no protection and costs coverage:
 * it passes "unlabelled" and "mislabelled", both of which are misspellings.
 *
 * This list matches the one the SDK repository enforces. Four repositories
 * gate their prose here, and four different word lists is the split the
 * workspace has already paid for once.
 */
export const AMERICAN_SPELLINGS = [
  { pattern: /colour/i, british: 'colour', american: 'color' },
  { pattern: /flavour/i, british: 'flavour', american: 'flavor' },
  { pattern: /neighbour/i, british: 'neighbour', american: 'neighbor' },
  { pattern: /rumour/i, british: 'rumour', american: 'rumor' },
  { pattern: /endeavour/i, british: 'endeavour', american: 'endeavor' },
  { pattern: /\bgrey(?:s|scale)?\b/i, british: 'grey', american: 'gray' },
  { pattern: /\bcentre(?:s|d)?\b/i, british: 'centre', american: 'center' },
  { pattern: /defence/i, british: 'defence', american: 'defense' },
  { pattern: /offence/i, british: 'offence', american: 'offense' },
  { pattern: /pretence/i, british: 'pretence', american: 'pretense' },
  { pattern: /honour/i, british: 'honour', american: 'honor' },
  { pattern: /candour/i, british: 'candour', american: 'candor' },
  { pattern: /licence/i, british: 'licence', american: 'license' },
  { pattern: /judgement/i, british: 'judgement', american: 'judgment' },
  {
    pattern: /acknowledgement/i,
    british: 'acknowledgement',
    american: 'acknowledgment',
  },
  { pattern: /artefact/i, british: 'artefact', american: 'artifact' },
  { pattern: /sceptic/i, british: 'sceptic', american: 'skeptic' },
  { pattern: /behaviour/i, british: 'behaviour', american: 'behavior' },
  { pattern: /favour/i, british: 'favour', american: 'favor' },
  { pattern: /\bprogrammes?\b/i, british: 'programme', american: 'program' },
  {
    pattern: /\banalys(?:e|ed|ing)\b/i,
    british: 'analyse',
    american: 'analyze',
  },
  {
    pattern: /(?:labell|modell|signall|travell)(?:ed|ing|er|ers)\b/i,
    british: 'travelling',
    american: 'traveling',
  },
  {
    pattern:
      /(?:generalis|characteris|organis|recognis|standardis|prioritis|scrutinis|summaris|normalis|serialis|authoris|optimis|initialis|catalogu|stylis)(?:e|es|ed|ing|ation|ations)\b/i,
    british: 'organise',
    american: 'organize',
  },
];
