export interface Tagline {
  id: 'primary' | 'product-hero';
  role: string;
  text: string;
  /** Sign-off state: an approved tagline needs no annotation. */
  status: 'approved' | 'proposed';
}

export interface TaglineCheckResult {
  source: string;
  /** Ids of the taglines the page uses, approved or proposed. */
  taglines: Tagline['id'][];
  /** Whether the page carries a proposed/provisional annotation anywhere. */
  annotated: boolean;
  ok: boolean;
  message: string;
}

export declare const TAGLINES: readonly Tagline[];
export declare const ANNOTATION_PATTERN: RegExp;
export declare function htmlToText(html: string): string;
export declare function findTaglines(html: string): Tagline[];
export declare function checkTaglineAnnotation(
  html: string,
  options?: { source?: string },
): TaglineCheckResult;
