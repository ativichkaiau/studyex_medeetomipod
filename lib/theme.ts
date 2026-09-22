export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "williamspod-theme";
const THEME_CHANGE_EVENT = "williamspod-theme-change";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

function normalizePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

// Run before first paint; keep saved manual choices and default to the device.
export const themeInitScript = `
(() => {
  let preference = "system";
  try {
    const stored = localStorage.getItem("${THEME_KEY}");
    if (stored === "light" || stored === "dark") preference = stored;
  } catch {}
  const theme = preference === "system"
    ? (window.matchMedia("${SYSTEM_THEME_QUERY}").matches ? "dark" : "light")
    : preference;
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
})();
`;

export function getThemePreference(): ThemePreference {
  return normalizePreference(document.documentElement.dataset.themePreference);
}

export function getServerThemePreference(): ThemePreference {
  return "system";
}

function applyTheme(preference: ThemePreference) {
  const theme = preference === "system"
    ? (window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light")
    : preference;
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function setThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(THEME_KEY, preference);
  } catch {
    // The choice still applies to this page if storage is unavailable.
  }
  applyTheme(preference);
}

export function subscribeToTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

// The root layout keeps this active even on routes without a theme switch.
export function syncThemeWithDevice() {
  const media = window.matchMedia(SYSTEM_THEME_QUERY);
  const onSystemChange = () => {
    if (getThemePreference() === "system") applyTheme("system");
  };
  const onStorageChange = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return;
    if (event.storageArea !== localStorage) return;
    applyTheme(normalizePreference(event.newValue));
  };

  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorageChange);
  // Catch a device appearance change between the inline script and hydration.
  applyTheme(getThemePreference());

  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorageChange);
  };
}
