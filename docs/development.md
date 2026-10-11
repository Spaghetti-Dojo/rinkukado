# Development

## Quick start

```bash
composer install
pnpm install
pnpm build
pnpm wp-env start
```

Open `http://localhost:8877`, and point at a link inside a post. The sections
below explain each step.

## Requirements

- WordPress 7.1 or later
- PHP 8.4 or later
- Node 24 and pnpm 10, to build the plugin
- Composer 2, to install the PHP dependencies
- Docker, for `wp-env`

## Install

```bash
composer install
pnpm install
pnpm build
```

## Local environment

Start the local WordPress and the watcher:

```bash
pnpm wp-env start
pnpm start
```

The site runs on `http://localhost:8877`.

## Quality assurance

| Command | Purpose |
| --- | --- |
| `composer cs` | PHP coding standards |
| `composer cs:fix` | Fix the PHP coding standards |
| `composer analysis` | PHPStan, level 9 |
| `composer test:unit` | Pest unit tests |
| `composer test:integration` | Pest integration tests on a real WordPress |
| `pnpm test:unit` | Jest unit tests of the client |
| `composer qa` | Coding standards, analysis and tests |
| `pnpm lint:scripts` | ESLint |
| `pnpm lint:styles` | Stylelint |
| `pnpm lint:types` | TypeScript type check |
| `pnpm test:e2e` | Playwright end to end tests |

Read [Testing](testing.md) before you write a test.

## Documentation site

The site in `website/` is a Docusaurus project. It reads the documents from
`docs/`, and it has its own `package.json` and lockfile.

```bash
cd website
pnpm install
pnpm start
```

`pnpm build` fails on a broken link. The `Deploy Docs` workflow builds the
site on each pull request, and publishes it to GitHub Pages from `main`.

## Layout

```
sources/package.php        The package factory. The public entry point.
sources/server/            PHP. One directory per module.
sources/server/Popover/    Registers the script module and its config.
sources/server/Preview/    The preview endpoint.
sources/server/Rest/       The library for routes and middlewares.
sources/client/preview/    The client of the popover.
sources/client/interactivity/  Shared helpers of the Interactivity API stores.
sources/client/styles/     Shared SCSS.
tests/unit/server/         PHP unit tests. Brain Monkey. No WordPress.
tests/unit/client/         Client unit tests. Jest.
tests/integration/server/  PHP integration tests. Real WordPress on SQLite.
tests/e2e/                 Playwright specs and the mu-plugins of the tests.
tests/bootstrap-integration.php  Installs WordPress for the integration tests.
build/                     Generated. Never edit it by hand.
website/                   The Docusaurus site of this documentation.
```

Each module has its own document in `docs/modules/`:

- [Preview](modules/client/preview.md)
- [Interactivity](modules/client/interactivity.md)
- [Popover](modules/server/popover.md)
- [Preview (server)](modules/server/preview.md)
- [REST](modules/server/rest.md)
