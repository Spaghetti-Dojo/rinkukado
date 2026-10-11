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
| Coupling | The library uses no class of the plugin, no text domain of the plugin and no filter of the plugin. |
| Place of the preview code | `sources/server/Preview/Rest/`, namespace `SpaghettiDojo\Rinkukado\Preview\Rest`. |
| Names of the preview classes | No `Preview` prefix: `Controller`, `Repository`, `Schema`, `Excerpt`. The namespace already names the preview. |
| Owner of the route | `Preview\Module` registers `rinkukado/v1/preview`. |
| Owner of `Config` | `Preview\Module` publishes the `Config` service. |
| Message of `ErrorCatch` | The plugin gives a closure to `Rest\Module::new()`. The closure returns the translated message. |
| `ErrorCatch` service | `Rest\Module` publishes it. |
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

The library has three couplings to the plugin today.

| File | Coupling | Fix |
| --- | --- | --- |
| `Rest/Module.php` | Uses `Config`. Publishes the preview services. Registers the preview route. | Move those parts to `Preview\Module`. |
| `Rest/Middlewares/ErrorCatch.php` | Translates its message with the `rinkukado` text domain. | Get the message as an argument. `Rest\Module` gets it from a closure of the plugin. |
| `Rest/Preview/*` | Plugin code in the namespace of the library. | Move to `Preview/Rest/` and rename. |

`Rest/Middlewares/Caching.php` has no code coupling. Only its doc comment
names the preview, so the comment changes.

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
registers no route. It publishes:

- `ErrorFactory`
- `Middlewares\Caching`
- `Middlewares\ErrorCatch`

`ErrorCatch` gets the message as its second argument:

```php
public static function new(
    Rest\ErrorFactory $errorFactory,
    string $message,
): ErrorCatch
```

The error code `internal_error`, the status `500` and the `WP_DEBUG` details
stay the same.

The library has no text domain, so the message comes from the plugin.
`Rest\Module::new()` gets a closure that returns the message:

```php
/**
 * @param \Closure(): string $errorMessage
 */
public static function new(\Closure $errorMessage): self
```

The factory of the `ErrorCatch` service calls the closure:

```php
Middlewares\ErrorCatch::class => static fn (
    ContainerInterface $container
): Middlewares\ErrorCatch => Middlewares\ErrorCatch::new(
    $container->get(ErrorFactory::class),
    $errorMessage()
),
```

A closure is necessary, and a string is not enough. The plugin adds the module
on `plugins_loaded`, and a translation at that moment loads the text domain
too early. The container builds a service only on the first `get()`. For
`ErrorCatch`, that is inside the `rest_api_init` callback, after `init`.

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
    ->addModule(Rest\Module::new(
        static fn (): string => __(
            'An internal error occurred. Contact the site owner or try again later.',
            'rinkukado'
        )
    ))
    ->addModule(Preview\Module::new())
    ->addModule(Popover\Module::new())
    ->boot();
```

## 5. Tests

The behavior does not change, so no test changes its assertions, with one
exception for `ErrorCatch`.

| Test | Change |
| --- | --- |
| `tests/unit/server/Preview/*` | Move to `tests/unit/server/Preview/Rest/`. Rename to `ControllerTest.php`, `RepositoryTest.php` and `ExcerptTest.php`. Change the namespace, the imports and the class names. |
| `tests/unit/server/Rest/ErrorCatchTest.php` | Give the message to `new()`. Add a test that the error holds that message. |
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

- No file in `sources/server/Rest/` names `Config`, `Preview`, `Popover` or
  the `rinkukado` text domain.
- The architecture test passes.
- `composer qa` passes.
- `PreviewEndpointTest` passes with no change.
- The e2e specs pass with no change.
