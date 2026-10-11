# REST

The REST library registers a route from a schema, a controller and a list of
middlewares. The code lives in `sources/server/Rest/`.

## Rule

The library does not use the plugin. It uses no class of another module, no
function of the plugin and no filter of the plugin.
`tests/unit/server/Rest/ArchTest.php` guards the rule. It fails when a file of
the library names a symbol of `SpaghettiDojo\Rinkukado` outside the `Rest`
namespace, or a `rinkukado.*` filter.

One coupling stays: `ErrorCatch` translates its message with the `rinkukado`
text domain. A project that copies the library must change the text domain in
that file.

## Classes

| Class | Role |
| --- | --- |
| `Route` | Builds a route and registers it with `register_rest_route`. |
| `Schema` | The contract of a request schema. `toArray()` returns a JSON Schema. |
| `Controller` | The contract of a controller. It gets the request and returns a response or a `WP_Error`. |
| `Middleware` | The contract of a middleware. It gets the request and the next callable. |
| `ErrorFactory` | Makes a `WP_Error`. |
| `Middlewares\ErrorCatch` | Catches a `Throwable` and answers `500` with the code `internal_error`. It adds the details only if `WP_DEBUG` is true. |
| `Middlewares\Caching` | Sets `Cache-Control`: `public, max-age=300` for an anonymous request, `no-store` for a logged-in user. |
| `Module` | Publishes `ErrorFactory`, `Middlewares\ErrorCatch` and `Middlewares\Caching`. |

`Method`, `MiddlewareProcess` and `RestRegistTrait` are internal.

## Use

A consumer module writes a schema and a controller, then registers the route
on `rest_api_init`:

```php
add_action('rest_api_init', static function () use ($container): void {
    $controller = $container->get(ThingController::class);

    Route::get('my-plugin/v1', '/things', ThingSchema::new(), $controller)
        ->withMiddleware($container->get(Middlewares\ErrorCatch::class))
        ->withMiddleware($container->get(Middlewares\Caching::class))
        ->register();
});
```

The first middleware is the outermost one. It gets the request first and the
response last. Add `ErrorCatch` first, so that it also catches an error of
the other middlewares.

## Limits

- `Route` supports only the `GET` method.
- Every route is public. The `permission_callback` is `__return_true`.

The [Preview](preview.md) module is the consumer of the library in this
plugin.
