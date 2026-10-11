# Customize

The plugin has no settings page. A site changes the behavior through filters,
and a third party can add its own module to the package of the plugin.

## Filters

| Filter | Default | Purpose |
| --- | --- | --- |
| `rinkukado.popover.root-selector` | `main` | The element that holds the links. |
| `rinkukado.popover.container-selector` | `p` | The element that must hold the link. |
| `rinkukado.popover.deny-class` | `no-rinkukado` | A link with this class shows no preview. |
| `rinkukado.popover.timings` | `['prefetch' => 80, 'open' => 300, 'close' => 200]` | The delays in milliseconds. |
| `rinkukado.rest.post-types` | every public type except `attachment` | The types that the endpoint accepts. |
| `rinkukado.rest.excerpt-length` | `30` | The word count of the fallback excerpt. |
| `rinkukado.rest.payload` | the payload | The last change before the response. |

```php
add_filter('rinkukado.popover.root-selector', static fn (): string => '.site-content');
```

Each module document describes its filters:

- [Popover](modules/server/popover.md) for `rinkukado.popover.*`.
- [Preview](modules/server/preview.md) for `rinkukado.rest.*`.

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
