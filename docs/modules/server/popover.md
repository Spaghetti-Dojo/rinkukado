# Popover

The popover module prints the dialog of the preview, loads the client, and
gives the config and the state to the store. The code lives in
`sources/server/Popover/`.

## Classes

| Class | Role |
| --- | --- |
| `Module` | Starts `PopoverRegion` and `ScriptModules`. |
| `PopoverRegion` | Prints the dialog, and sends the config and the state. |
| `ScriptModules` | Registers and loads the script module and the style. |

The module reads its values from `Config`, in `sources/server/Config.php`.

## Dialog

`PopoverRegion` prints one dialog on the `wp_footer` action, and only on a
singular view. Every link of the page uses this one dialog.

The markup uses directives of the Interactivity API with the `rinkukado`
store. The client is in [Preview](../client/preview.md).

## Script module and style

`ScriptModules` registers the script module and the style on `init`, with
the handle `rinkukado-preview`:

| Asset | File |
| --- | --- |
| Script module | `build/preview/index.js` |
| Style | `build/preview/index.css` |

The dependencies and the version come from `build/preview/index.asset.php`.
The module loads both assets on `wp_enqueue_scripts`, but not in the admin
and not in a feed.

## Server data

`PopoverRegion` sends two sets of values to the store. The client checks
both sets against a schema before it uses them. See the section "Server
data" of [Preview](../client/preview.md).

When you add, remove or rename a key here, change the schema in
`sources/client/preview/schemas.ts` in the same commit. The schemas are
strict, so the client refuses a key that it does not know, and the preview
does not start.

### Config

`wp_interactivity_config()` sends the values that do not change while the
page is open. No directive reads them.

| Key | Value |
| --- | --- |
| `endpoint` | The URL of the preview endpoint. See [REST](rest.md). |
| `nonce` | A `wp_rest` nonce for a logged-in user. Empty for a visitor. |
| `rootSelector` | The element that holds the links. |
| `containerSelector` | The element that must hold the link. |
| `denyClass` | A link with this class shows no preview. |
| `timings` | The delays in milliseconds: `prefetch`, `open` and `close`. |
| `sheetQuery` | The media query of the sheet. |
| `hoverQuery` | The media query of the hover popover. |

### State

`wp_interactivity_state()` sends the values that the directives read.

| Key | Value |
| --- | --- |
| `closeLabel` | The label of the close button. |
| `ctaLabel` | The label of the link to the article. |
| `isOpen`, `isSheet`, `hasThumbnail` | `false` at the start. |
| `title`, `excerpt`, `permalink` | Empty at the start. |
| `thumbnailSrc`, `thumbnailSrcset`, `thumbnailAlt` | Empty at the start. |

The client changes every key except the two labels.

## Filters

| Filter | Default | Purpose |
| --- | --- | --- |
| `rinkukado.popover.root-selector` | `main` | The element that holds the links. |
| `rinkukado.popover.container-selector` | `p` | The element that must hold the link. |
| `rinkukado.popover.deny-class` | `no-rinkukado` | A link with this class shows no preview. |
| `rinkukado.popover.timings` | `['prefetch' => 80, 'open' => 300, 'close' => 200]` | The delays in milliseconds. |

```php
add_filter('rinkukado.popover.root-selector', static fn (): string => '.site-content');
```

`Config` keeps the default when a filter returns a value that is not valid:
an empty selector, an empty class, or a timing that is not an integer of 0
or more.

### Where the popover prints

The popover prints only on a singular view, and only for a link inside the
element that `rinkukado.popover.container-selector` names. The default keeps
the popover on the links of the prose, and leaves the date, the author and the
navigation alone.

To exclude one link, add the class of `rinkukado.popover.deny-class` to it:

```html
<a href="/about/" class="no-rinkukado">About</a>
```
