const STORAGE_KEY = 'oe-theme';
const THEMES = new Set(['light', 'dark', 'system']);

function systemPrefersDark() {
  return typeof matchMedia === 'function' &&
    matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(preference = 'system') {
  return preference === 'dark' ||
    (preference === 'system' && systemPrefersDark())
    ? 'dark'
    : 'light';
}

export function applyTheme(preference = 'system', root = document.documentElement) {
  const resolved = resolveTheme(preference);
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
  return resolved;
}

export function getStoredTheme(storage = localStorage) {
  const value = storage.getItem(STORAGE_KEY) ?? 'system';
  return THEMES.has(value) ? value : 'system';
}

export function applyStoredTheme(options = {}) {
  const storage = options.storage ?? localStorage;
  const root = options.root ?? document.documentElement;
  return applyTheme(getStoredTheme(storage), root);
}

export function setTheme(preference, options = {}) {
  if (!THEMES.has(preference)) {
    throw new TypeError('Theme must be "light", "dark", or "system".');
  }
  const storage = options.storage ?? localStorage;
  const root = options.root ?? document.documentElement;
  storage.setItem(STORAGE_KEY, preference);
  return applyTheme(preference, root);
}

export function watchSystemTheme(options = {}) {
  const storage = options.storage ?? localStorage;
  const root = options.root ?? document.documentElement;
  const query = matchMedia('(prefers-color-scheme: dark)');
  const listener = () => {
    if (getStoredTheme(storage) === 'system') applyTheme('system', root);
  };
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

export { STORAGE_KEY, THEMES };
