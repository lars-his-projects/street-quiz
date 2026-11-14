/** The value of a token of the design system (`src/style.css`), for example `--color-street` for the map. */
export function token(name: string, root: HTMLElement = document.documentElement): string {
  return getComputedStyle(root).getPropertyValue(name).trim();
}
