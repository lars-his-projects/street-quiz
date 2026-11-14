/** The themes of the design system (`src/style.css`). A is the default. */
export const THEMES = ["a", "b", "c"] as const;
export type Theme = (typeof THEMES)[number];

/** Set the theme of the page: `?theme=b` in the address, else A. Returns the theme. */
export function applyTheme(search: string, root: HTMLElement = document.documentElement): Theme {
  const asked = new URLSearchParams(search).get("theme")?.toLowerCase();
  const theme = THEMES.find((t) => t === asked) ?? "a";
  setTheme(theme, root);
  return theme;
}

export function setTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  if (theme === "a") root.removeAttribute("data-theme");
  else root.dataset.theme = theme;
}

/** The value of a token of the theme, for example `--color-street` for the map. */
export function token(name: string, root: HTMLElement = document.documentElement): string {
  return getComputedStyle(root).getPropertyValue(name).trim();
}
