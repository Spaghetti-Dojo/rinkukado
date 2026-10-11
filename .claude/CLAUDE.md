# Rinkukado Project Directives

## Plans and Specs Implementation Flow Constraints

1. When executing a plan or implementing tasks of a spec, always stop at each step / task and ask for confirmation before proceeding to the next one.

## Project Layout

- `sources/server/` — PHP, namespace `SpaghettiDojo\Rinkukado`, one directory per module.
- `sources/client/preview/` — the client of the popover: the `rinkukado` store of the Interactivity API and its modules.
- `sources/client/interactivity/` — the shared helpers of the Interactivity API stores. They are a copy of `.claude/skills/interactivity-server-data/assets/`: change the skill first.
- `tests/` — four layers. Read `docs/testing.md` before you write a test.
  - `tests/unit/server/` — Pest on Brain Monkey. No WordPress.
  - `tests/integration/server/` — Pest on a real WordPress. `tests/bootstrap-integration.php` installs it.
  - `tests/unit/client/` — Jest. Files end with `.test.ts`.
  - `tests/e2e/specs/` — Playwright. Files end with `.spec.ts`.
- `build/` — generated. Never edit it by hand.
- `website/` — the Docusaurus site of the documentation. It reads `docs/`, and excludes `docs/superpowers/`. It has its own `package.json` and lockfile.

## Module Documents

Read the document of a module before you change that module.

- `sources/client/preview/` → `docs/modules/client/preview.md`
- `sources/server/Popover/` → `docs/modules/server/popover.md`
- `sources/server/Preview/` → `docs/modules/server/preview.md`
- `sources/server/Rest/` → `docs/modules/server/rest.md`

Keep the documents in sync with the code, in the same commit:

- If you change the behavior, the server data or a filter of a module, update its document.
- If you add a module, add `docs/modules/<client|server>/<name>.md`, and add its row to the table in `README.md`, to the table in `docs/index.md` and to `website/sidebars.js`. `sources/client/styles/` is not a module and needs no document.
- Add a module to the list above only if its document holds rules that the code does not show.

## Quality Assurance

Run `composer qa` for PHP. Run `pnpm lint:scripts` and `pnpm lint:styles` for the client side.
The `Stop` hook runs `.claude/hooks/qa.sh` automatically.
