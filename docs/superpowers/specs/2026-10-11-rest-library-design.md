# REST Library — Design

Date: 2026-10-11
Status: approved in chat, waiting for the review of the written spec
Plugin: Rinkukado

## 1. Goal

`sources/server/Rest/` becomes a standalone library inside the project. It
holds the route, the middlewares and the contracts, and it knows nothing about
the plugin. Another plugin can copy the directory and use it.

The code of the preview endpoint leaves the library. It moves to a new
`Preview` module, in `sources/server/Preview/Rest/`.

The change is a refactor. The endpoint, its payload, its errors, its cache
headers and its filters stay the same.

## 2. Decisions

| Topic | Decision |
| --- | --- |
| Place of the library | `sources/server/Rest/`. It does not move. |
| Namespace of the library | `SpaghettiDojo\Rinkukado\Rest`. It does not change. |
| Composer | No new package and no new PSR-4 entry. |
| Coupling | The library uses no class of the plugin and no filter of the plugin. |
| Text domain | `ErrorCatch` keeps the `rinkukado` text domain. See 3.1. |
| Place of the preview code | `sources/server/Preview/Rest/`, namespace `SpaghettiDojo\Rinkukado\Preview\Rest`. |
| Names of the preview classes | No `Preview` prefix: `Controller`, `Repository`, `Schema`, `Excerpt`. The namespace already names the preview. |
| Owner of the route | `Preview\Module` registers `rinkukado/v1/preview`. |
| Owner of `Config` | `Preview\Module` publishes the `Config` service. |
| `ErrorCatch` | No change. `Rest\Module` publishes it, as it does today. |
| Guard | An architecture test of Pest fails when the library uses the plugin. |
| Filter names | `rinkukado.rest.*` stay, because sites can use them already. |
| Out of scope | A separate namespace, a separate Composer package, new HTTP methods, and a change of `Popover`. |

### 2.1 Options that were dropped

- **Own namespace and directory** (`packages/rest/`, `SpaghettiDojo\Rest`).
  It needs a second PSR-4 entry and a change of the tool configuration. A
  later move is only a rename, because the coupling is already gone.
- **Own Composer package** with a `path` repository. Same reason, with more
  setup.

## 3. Couplings to remove

The library has two couplings to the plugin that this change removes.

| File | Coupling | Fix |
| --- | --- | --- |
| `Rest/Module.php` | Uses `Config`. Publishes the preview services. Registers the preview route. | Move those parts to `Preview\Module`. |
| `Rest/Preview/*` | Plugin code in the namespace of the library. | Move to `Preview/Rest/` and rename. |

`Rest/Middlewares/Caching.php` has no code coupling. Only its doc comment
names the preview, so the comment changes.

### 3.1 The text domain stays

`ErrorCatch` translates its message with the `rinkukado` text domain. That is
a coupling, and it stays. The library lives inside the plugin, so the plugin
owns the translation of the string. The other solution gives the message to
`Rest\Module::new()` through a closure. It adds an argument to the module and
to `ErrorCatch`, and it gives no benefit while the library has one consumer.

A project that copies the library must change the text domain in that one
file.

## 4. Structure

### 4.1 The library

```
sources/server/Rest/
  Controller.php
  ErrorFactory.php
  Method.php
  Middleware.php
  MiddlewareProcess.php
  Module.php
  RestRegistTrait.php
  Route.php
  Schema.php
  Middlewares/
    Caching.php
    ErrorCatch.php
```

`Rest\Module` becomes a `ServiceModule` only. It has no `run()` method and it
registers no route. It keeps the services of the library and loses the
others:

| Service | State |
| --- | --- |
| `ErrorFactory` | Stays. |
| `Middlewares\ErrorCatch` | Stays. |
| `Middlewares\Caching` | Stays. |
| `Config` | Moves to `Preview\Module`. |
| `Preview\PreviewRepository` | Moves to `Preview\Module`. |
| `Preview\PreviewController` | Moves to `Preview\Module`. |

`Module::new()` keeps its signature with no argument. No class of the library
changes its code, but for the doc comment of `Caching`.

### 4.2 The Preview module

```
sources/server/Preview/
  Module.php
  Rest/
    Controller.php
    Excerpt.php
    Repository.php
    Schema.php
```

The four classes move with no change of behavior. Their namespace and their
imports change, and three of them lose the `Preview` prefix:

| Before | After |
| --- | --- |
| `Rest\Preview\PreviewController` | `Preview\Rest\Controller` |
| `Rest\Preview\PreviewRepository` | `Preview\Rest\Repository` |
| `Rest\Preview\PreviewSchema` | `Preview\Rest\Schema` |
| `Rest\Preview\Excerpt` | `Preview\Rest\Excerpt` |

`Controller` and `Schema` now have the same short names as the interfaces of
the library. Each class imports the namespace of the library, not the
interface, so the two names do not collide:

```php
namespace SpaghettiDojo\Rinkukado\Preview\Rest;

use SpaghettiDojo\Rinkukado\Rest;

final readonly class Controller implements Rest\Controller
```

In `Preview\Module`, the name `Rest\Controller` resolves to the preview class.
The module imports the classes of the library one by one (`Route`,
`ErrorFactory`, `Middlewares\Caching`, `Middlewares\ErrorCatch`).

`Preview\Module` is a `ServiceModule` and an `ExecutableModule`. It publishes:

- `Config`
- `Preview\Rest\Repository`
- `Preview\Rest\Controller`

Its `run()` method does what `Rest\Module::run()` does today. It calls
`Repository::init()`, and it registers the route on `rest_api_init`:

```php
add_action('rest_api_init', static function () use ($container): void {
    Route::get(
        'rinkukado/v1',
        '/preview',
        Rest\Schema::new(),
        $container->get(Rest\Controller::class)
    )
        ->withMiddleware($container->get(ErrorCatch::class))
        ->withMiddleware($container->get(Caching::class))
        ->register();
});
```

### 4.3 The bootstrap

`rinkukado.php` adds the three modules in this order:

```php
package()
    ->addModule(Rest\Module::new())
    ->addModule(Preview\Module::new())
    ->addModule(Popover\Module::new())
    ->boot();
```

## 5. Tests

The behavior does not change, so no test changes its assertions.

| Test | Change |
| --- | --- |
| `tests/unit/server/Preview/*` | Move to `tests/unit/server/Preview/Rest/`. Rename to `ControllerTest.php`, `RepositoryTest.php` and `ExcerptTest.php`. Change the namespace, the imports and the class names. |
| `tests/unit/server/Rest/ArchTest.php` | New. See below. |
| `tests/integration/server/PreviewEndpointTest.php` | No change. It proves that the endpoint still works through the new module. |

The architecture test is the guard of the library:

```php
arch('the REST library does not use the plugin')
    ->expect('SpaghettiDojo\Rinkukado\Rest')
    ->not->toUse([
        'SpaghettiDojo\Rinkukado\Config',
        'SpaghettiDojo\Rinkukado\Preview',
        'SpaghettiDojo\Rinkukado\Popover',
    ]);
```

The order of the work follows TDD. The architecture test comes first and
fails, then the moves make it pass.

## 6. Documents

| Document | Change |
| --- | --- |
| `docs/modules/server/preview.md` | New. It gets the content of today's `rest.md`: the request, the response, the errors, the cache and the filters. |
| `docs/modules/server/rest.md` | Rewrite. It describes the library: `Route`, `Schema`, `Controller`, `Middleware`, the two middlewares, the module, and the rule that the library does not use the plugin. |
| `README.md` | Change the REST row and add a row for the server Preview module. |
| `docs/development.md` | Update the layout and the list of module documents. |
| `docs/customize.md` | Point `rinkukado.rest.*` to `preview.md`. |
| `docs/modules/client/preview.md` | Fix its link to the endpoint document, if it has one. |
| `.claude/CLAUDE.md` | Add `sources/server/Preview/` to the list of module documents. Keep the `Rest` entry, because `rest.md` holds the rule of no coupling. |

## 7. Success criteria

- No file in `sources/server/Rest/` names `Config`, `Preview` or `Popover`.
- The architecture test passes.
- `composer qa` passes.
- `PreviewEndpointTest` passes with no change.
- The e2e specs pass with no change.
