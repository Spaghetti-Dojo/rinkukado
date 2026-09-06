# Rinkukado

Shows a popover with the title, the excerpt and the thumbnail of a linked post.

## What it does

A visitor points at a link to a post of this site. A popover shows the title,
the excerpt and the thumbnail of that post. On a touch device the first tap
opens a sheet at the bottom of the screen, and the second tap of the same link
opens the article.

The plugin holds three modes, and the device chooses between them.

| The device | What the visitor gets |
| --- | --- |
| a coarse pointer, at any width | the sheet, opened by a tap |
| a fine pointer, in a window of 782px or more | the anchored popover, opened by a hover |
| a fine pointer, in a narrower window | no popover, and links behave as they do without this plugin |

The third row keeps a promise: a sheet at the bottom of a narrow window loses
the hover before the pointer reaches it, and a click that opens a sheet
swallows the navigation. The popover returns when the window grows, with no
reload.

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

## Development

Start the local WordPress and the watcher:

```bash
pnpm wp-env start
pnpm start
```

The site runs on `http://localhost:8877`.

## Filters

| Filter | Default | Purpose |
| --- | --- | --- |
| `rinkukado.popover.root-selector` | `main` | The element that holds the links. |
| `rinkukado.popover.deny-class` | `no-rinkukado` | A link with this class shows no preview. |
| `rinkukado.popover.timings` | `['prefetch' => 80, 'open' => 300, 'close' => 200]` | The delays in milliseconds. |
| `rinkukado.rest.post-types` | every public type except `attachment` | The types that the endpoint accepts. |
| `rinkukado.rest.excerpt-length` | `30` | The word count of the fallback excerpt. |
| `rinkukado.rest.payload` | the payload | The last change before the response. |

```php
add_filter('rinkukado.popover.root-selector', static fn (): string => '.site-content');
```

The default list of post types excludes `attachment`, so a media page shows
no preview. Add `attachment` back through `rinkukado.rest.post-types` when a
site wants a preview for its media pages.

`rinkukado.rest.payload` receives the payload array and the `WP_Post` object,
just before the endpoint sends the response.

## The endpoint

`GET /wp-json/rinkukado/v1/preview?url=<absolute-url>`

It answers `200` with `id`, `title`, `excerpt`, `permalink` and `thumbnail`.
The `thumbnail` field is `null`, or an object with `src`, `srcset`, `width`,
`height` and `alt`.

Every rejection answers `404` with the code `not_found`. The response never
says which check failed. An anonymous request carries
`Cache-Control: public, max-age=300`. A request from a logged-in user carries
`Cache-Control: no-store`.

## Tests

There are four layers:

| Layer | Files | Command |
| --- | --- | --- |
| PHP unit, on Brain Monkey | `tests/unit/server/*Test.php` | `composer test:unit` |
| PHP integration, on a real WordPress | `tests/integration/server/*Test.php` | `composer test:integration` |
| Client unit, on Jest | `tests/unit/client/*.test.ts` | `pnpm test:unit` |
| End to end, on Playwright | `tests/e2e/specs/*.spec.ts` | `pnpm test:e2e` |

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
sources/server/Popover/    Registers the script module and its config.
sources/server/Rest/       The preview endpoint and its middlewares.
sources/client/preview/    The client of the popover.
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
