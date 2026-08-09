/*
 * Tagline registry and annotation enforcement.
 *
 * Each tagline carries its sign-off status. A surface using a *proposed*
 * tagline must annotate it as proposed until founder sign-off lands; an
 * *approved* tagline needs no annotation. The design site asserts this on
 * itself in its own test suite; this module is the same rule packaged so
 * every other surface can run it against its built HTML instead of
 * reimplementing the check or forgetting it exists.
 *
 * Founder review, 2026-08-09: the product hero was approved as shipped; the
 * homepage-hero line ("Your relay carries it. Your relay can't read it.")
 * was retired unshipped — the website homepage leads with its job statement
 * instead; the primary remains proposed.
 *
 * Text-level, not DOM-level: a tagline broken across a <br> or a <span> is
 * still the tagline, and a checker that only matched contiguous source text
 * would pass exactly the pages most likely to be wrong.
 */

export const TAGLINES = Object.freeze([
  Object.freeze({
    id: 'primary',
    role: 'Primary',
    text: 'Opaque to the relay. Open to inspection.',
    status: 'proposed',
  }),
  Object.freeze({
    id: 'product-hero',
    role: 'Product hero',
    text: 'The Signal Protocol, where your app actually runs.',
    status: 'approved',
  }),
]);

/*
 * Any of these reads as "this copy is not final". `pending founder sign-off`
 * is the phrasing DESIGN.md uses; the others are the words a writer reaches
 * for when they mean the same thing.
 */
export const ANNOTATION_PATTERN =
  /\b(proposed|provisional|pending (founder )?sign[- ]?off|not (yet )?approved|draft copy)\b/i;

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  mdash: '—',
  ndash: '–',
  hellip: '…',
};

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body) => {
    if (body.startsWith('#')) {
      const code = body[1] === 'x' || body[1] === 'X'
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[body.toLowerCase()] ?? match;
  });
}

/**
 * Reduce an HTML document to the words a reader sees: script and style
 * contents dropped, tags replaced by a space so adjacent elements do not weld
 * words together, entities decoded, curly quotes flattened, whitespace
 * collapsed.
 */
export function htmlToText(html) {
  return decodeEntities(
    String(html)
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]*>/g, ' '),
  )
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/*
 * Whitespace is discarded rather than collapsed. Markup between words leaves a
 * space behind wherever it stood — `the <em>relay</em>.` reduces to "the relay
 * ." — and a checker that respected those spaces would pass exactly the pages
 * where the tagline is styled, which is most of them.
 */
const normalize = (value) =>
  value
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, '')
    .toLowerCase();

/** The taglines present in a page, in declaration order. */
export function findTaglines(html) {
  const text = normalize(htmlToText(html));
  return TAGLINES.filter((tagline) => text.includes(normalize(tagline.text)));
}

/**
 * Check one page. A page that uses no tagline passes, as does one that uses
 * only approved taglines. A page that uses a proposed tagline must also carry
 * an annotation saying the copy is not final.
 *
 * Returns a result rather than throwing, so a caller can report every page in
 * one pass instead of failing on the first.
 */
export function checkTaglineAnnotation(html, { source = 'input' } = {}) {
  const text = htmlToText(html);
  const found = findTaglines(html);
  const proposed = found.filter((tagline) => tagline.status === 'proposed');
  const annotated = ANNOTATION_PATTERN.test(text);
  const ok = proposed.length === 0 || annotated;
  return {
    source,
    taglines: found.map((tagline) => tagline.id),
    annotated,
    ok,
    message: ok
      ? found.length === 0
        ? `${source}: no tagline used.`
        : `${source}: ${found.length} tagline(s), ${
            proposed.length === 0 ? 'all approved' : 'annotated'
          }.`
      : `${source}: uses ${proposed
          .map((tagline) => `"${tagline.text}"`)
          .join(', ')} with no proposed/provisional annotation. Proposed taglines are pending founder sign-off and every surface using one must say so.`,
  };
}
