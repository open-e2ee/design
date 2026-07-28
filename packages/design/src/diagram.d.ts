export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlabOptions extends Rect {
  /** Non-zero shear means in transit. Orthogonal forms are at rest. */
  shear?: number;
}

export interface NotchedSlabOptions extends Rect {
  notch?: number;
}

export interface CarrierConstruction {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Stem width. The same value the mark's geometry calls `thickness`. */
  thickness: number;
  /** Arm length. Must be at least `thickness`. */
  arm: number;
}

export interface MetadataTickOptions {
  x: number;
  /** Top edge of the slab the ticks sit above. */
  y: number;
  count: number;
  spacing?: number;
  length?: number;
  width?: number;
  gap?: number;
}

export interface ContentBarOptions {
  x: number;
  y: number;
  width: number;
  count?: number;
  height?: number;
  gap?: number;
  ratios?: readonly number[];
}

export interface DeviceOutlineOptions extends Rect {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  bars?: number;
  barFill?: string;
  padding?: number;
  /** Distance from the top edge to a full-width divider, for stores and vaults. */
  divider?: number | null;
}

export interface BoundaryLineOptions {
  x: number;
  top: number;
  bottom: number;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
}

export interface RatchetOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  count?: number;
  gap?: number;
}

export declare const STROKE_WIDTH: 4;
export declare const ARROW_STROKE_WIDTH: 2;
export declare const TICK_WIDTH: 2;
export declare const TICK_LENGTH: 10;
export declare const TICK_SPACING: 16;
export declare const TICK_GAP: 4;
export declare const BOUNDARY_MIN_GUTTER: 48;
export declare const RATCHET_STEPS: 4;
export declare const RATCHET_FILLS: readonly string[];
export declare const CONTENT_BAR_FILL: string;
export declare const PLAINTEXT_STROKE: string;
export declare const CIPHERTEXT_FILL: string;
export declare const CARRIER_STROKE: string;
export declare const BOUNDARY_STROKE: string;

export declare function slabPath(options: SlabOptions): string;
export declare function notchedSlabPath(options: NotchedSlabOptions): string;
export declare function carrierBracketPaths(
  construction: CarrierConstruction,
): [string, string];
export declare function carrierBrackets(
  options: CarrierConstruction & { fill?: string },
): string;
export declare function metadataTickRects(
  options: MetadataTickOptions,
): Rect[];
export declare function metadataTicks(
  options: MetadataTickOptions & { fill?: string },
): string;
export declare function contentBarRects(options: ContentBarOptions): Rect[];
export declare function deviceOutline(options: DeviceOutlineOptions): string;
export declare function boundaryLine(options: BoundaryLineOptions): string;
export declare function ratchetRects(options: RatchetOptions): Rect[];
export declare function ratchetRamp(
  options: RatchetOptions & { fills?: readonly string[] },
): string;
