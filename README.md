# Rinkukado

Shows a popover with the title, the excerpt and the thumbnail of a linked post.

## Requirements

- PHP 8.4
- Node 24 and pnpm 10
- Composer 2
- Docker, for `wp-env`

## Install

```bash
composer install
pnpm install
pnpm build
```

## Development

Start the local WordPress and the watcher:

```bash
pnpm wp-env start
pnpm start
```

The site runs on `http://localhost:8877`.

## Tests

There are four layers:

| Layer | Files | Command |
| --- | --- | --- |
| PHP unit, on Brain Monkey | `tests/unit/server/*Test.php` | `composer test:unit` |
| PHP integration, on a real WordPress | `tests/integration/server/*Test.php` | `composer test:integration` |
| Client unit, on Jest | `tests/unit/client/*.test.ts` | `pnpm test:unit` |
| End to end, on Playwright | `tests/e2e/specs/*.spec.ts` | `pnpm test:e2e` |

Every command passes when its directory holds no test, so you can delete the
examples of this template.

Read [docs/testing.md](docs/testing.md) before you write a test. It explains
each layer, when to use it, and the rules that apply to it.

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

## Extend the plugin

`sources/package.php` exposes the package of the plugin through the
`package()` function. The function always returns the same instance, so a
third party can add its own module:

```php
add_action('plugins_loaded', static function (): void {
    \SpaghettiDojo\Rinkukado\package()->addModule(MyOwn\Module::new());
}, 5);
```

Add the module before the priority of the `boot()` call, which is 10.

## Layout

```
sources/package.php        The package factory. The public entry point.
sources/server/            PHP. One directory per module.
sources/server/Blocks/     The block module and the registrar.
sources/client/blocks/     One directory per block. All the files of a block.
sources/client/styles/     Shared SCSS.
tests/unit/server/         PHP unit tests. Brain Monkey. No WordPress.
tests/unit/client/         Client unit tests. Jest.
tests/integration/server/  PHP integration tests. Real WordPress on SQLite.
tests/e2e/                 Playwright specs and the mu-plugins of the tests.
tests/bootstrap-integration.php  Installs WordPress for the integration tests.
build/                     Generated. Never edit it by hand.
```

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
