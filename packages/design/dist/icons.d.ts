export type IconName =
  | 'github'
  | 'sun'
  | 'moon'
  | 'desktop'
  | 'copy'
  | 'check'
  | 'external'
  | 'menu'
  | 'close'
  | 'stack'
  | 'send'
  | 'people'
  | 'clock'
  | 'pulse'
  | 'terminal';
export type ThemePreference = 'light' | 'dark' | 'system';

export declare const ICON_VIEW_BOX: string;
export declare const iconPaths: Record<IconName, string[]>;
export declare const iconNames: IconName[];
export declare const themeIcons: Record<ThemePreference, IconName>;
