export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export interface ThemeOptions {
  storage?: Storage;
  root?: HTMLElement;
}
export declare function resolveTheme(preference?: ThemePreference): ResolvedTheme;
export declare function applyTheme(
  preference?: ThemePreference,
  root?: HTMLElement,
): ResolvedTheme;
export declare function getStoredTheme(storage?: Storage): ThemePreference;
export declare function applyStoredTheme(options?: ThemeOptions): ResolvedTheme;
export declare function setTheme(
  preference: ThemePreference,
  options?: ThemeOptions,
): ResolvedTheme;
export declare function watchSystemTheme(options?: ThemeOptions): () => void;
export declare const STORAGE_KEY: 'oe-theme';
export declare const THEMES: ReadonlySet<ThemePreference>;
