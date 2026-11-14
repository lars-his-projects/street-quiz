# street-quiz – guide for Claude Code

street-quiz is a web app to learn the street names of an area. It shows a real map with no street names, marks a
street and asks its name, or gives a name and asks you to tap the street. The data is OpenStreetMap.

The owner is **Larspolo**. The users are the owner and friends, on a phone first and also on a computer. There is no
account. The agent system: `framework/docs/SYSTEM.md`. The project values: `agent.toml`. The direction:
`steering/project/PRINCIPLES.md`. Write all text in ASD-STE100 Simplified Technical English (short sentences, active
voice, imperative).

## Commands

| Task | Command |
|---|---|
| Install | `python3 -m pip install -r requirements-dev.txt && npm ci` |
| Lint | `ruff check . && npx @biomejs/biome check .` (`--write` fixes the format) |
| Fast tests | `python3 -m pytest -q && npx vitest run` (one file: `npx vitest run tests/a.test.ts`) |
| Build | `npm run build` (checks the types, then makes `dist/`) |
| Development server | `npm run dev` |
| Browser tests | `npx playwright test` (builds the app; a cloud session has the browser, do not run `playwright install`) |

Put scratch output in the scratchpad or in `out/`. Never commit `dist/` or `node_modules/`.

## Code map

A static web app: TypeScript and Vite, with MapLibre GL JS for the map. There is no server and no database. Keep this
map up to date.

- `index.html`, `src/main.ts` – the page and its entry point. `vite.config.ts` sets `base: "/street-quiz/"`: the app is
  served from https://lars-his-projects.github.io/street-quiz/.
- `src/` – the logic and the map code. `src/normalize.ts` compares street names (lower case, no accents, ß as ss, trimmed).
  `src/quiz.ts` is the logic of a round (no map code); `src/main.ts` draws the marked street and the answer form, follows the visual viewport (phone keyboard) and sets marks on `#app` for `tests/browser/`.
  `src/map.ts` makes the map and gives MapLibre the address of its worker file (`tests/build_worker.test.ts`).
- `src/store.ts` – keeps the GeoJSON of an area on the device (IndexedDB, key: OSM relation id): `saveArea`, `loadArea`.
- The design system (#17): `src/style.css` has the tokens (CSS variables) of the look "candy" (#21); a rule uses only
  tokens (`tests/theme_tokens.test.ts`). `src/form.ts` makes the answer form, `src/theme.ts` reads a token.
  `style.html` (`src/style-page.ts`) shows each component in each state with the same CSS and markup as the app.
- `public/areas/<slug>.geojson` – the stored streets of an area, made by `scripts/fetch_area.py` (an agent runs it).
  The top of the script says what a street of the quiz is. The app asks the area `AREA` of `src/main.ts`: the Jordaan.
- `tests/` – Vitest tests (`*.test.ts`) and pytest tests of the agent tools. A pytest file name must not repeat a name in `framework/tests/`.
- `framework/`, `.claude/`, `steering/` – the agent system.

## Rules of the domain

- **P1, a flashcard, not a trivia game:** the quiz asks only for the name of a marked street or the street of a given
  name. It never asks about history or facts (`steering/project/PRINCIPLES.md`).
- **P3, open data and free services:** tests and CI use stored data and send no request to a map or data service.
  An agent can get OpenStreetMap data on purpose for the stored data of an area or of a test, with few and small
  requests (`scripts/fetch_area.py`), and loads the real map for a look at a page (`verify` skill, level 4).
  Keep the data on the device.
- **P6, fun first:** the quiz is fast and feels like a game. A feature that makes it slow or heavy needs a strong reason.
- **P7, start simple:** the first selection is the name of an area, and the first answer is a typed name. Other ways
  come in the sequence of the roadmap.
- **The start of the project (owner, 2026-11-14):** the weekly pace does not limit the runs until the owner can try
  the first version with the name of an area. The PR that sets `area:name` to `[x]` in the roadmap also sets
  `week_guard = true` in `steering/system/system.toml` and removes this line.

@framework/CLAUDE.md
@docs/LEARNINGS.md
