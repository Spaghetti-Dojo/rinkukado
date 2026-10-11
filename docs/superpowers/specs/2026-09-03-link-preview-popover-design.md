# Link Preview Popover — Design

Date: 2026-09-03
Status: approved, ready for an implementation plan
Plugin: Rinkukado

## 1. Goal

A WordPress plugin shows a preview of an internal link. The preview holds the
title, the excerpt and the thumbnail of the target post.

On a device with a fine pointer, a hover over the link opens an anchored
popover. On a touch device, the first tap opens a sheet at the bottom of the
viewport, and the second tap on the same link navigates.

The reference behavior is the Wikipedia page preview on the desktop, and the
Wikipedia application on the phone.

## 2. Decisions

| Topic | Decision |
| --- | --- |
| Link scope | Every internal link inside the root element. No opt-in. |
| Attachment | Delegated listeners in the Interactivity API store. No server pass. |
| Root element | `main` by default, filterable. |
| Data source | One custom REST endpoint that returns only what the popover shows. |
| URL to post ID | Resolved on the server, on demand, when the visitor shows intent. |
| Desktop intent | Prefetch after 80 ms. Open after 300 ms. Close 200 ms after the pointer leaves. |
| Touch intent | The first tap opens the sheet. The second tap on the same link navigates. |
| Mode switch | The gesture follows the pointer type. The layout follows the pointer type or the width. |
| Positioning | CSS anchor positioning when the browser supports it, a pure function otherwise. |
| Popover DOM | One shared element in the footer. |
| Excerpt | The manual excerpt, else the core fallback, trimmed to a filterable word count. |
| Configuration | PHP filters only. No admin screen. |
| REST layer | The Konomi `Rest` library, copied into the plugin and adapted. |

### 2.1 Why no server pass

The first design added Interactivity API directives to each link through a
`the_content` filter. It was dropped.

A server pass earns its cost only when the server knows something that the
client cannot know. The URL resolution happens on the endpoint, on demand, so
the server knows nothing more than the client. The directives carried no
information.

Delegated listeners add no HTML, add no render cost, have no hook priority
problem, and cover every link on the page, including links in a navigation
block, in a widget, in a comment, and links that another script adds later.

The cost of the decision: a PHP filter cannot accept or reject a single link any
more. PHP still controls the behavior through the seeded state: the root
selector and the deny class.

## 3. Project structure

The plugin starts from the Spaghetti Dojo project template. The template is an
Inpsyde Modularity plugin. The example block is removed, because this plugin
registers no block.

```
rinkukado.php
sources/package.php
sources/server/
  Config.php
  Popover/
    Module.php
    PopoverRegion.php
    ScriptModules.php
  Rest/
    Controller.php ErrorFactory.php Method.php Middleware.php
    MiddlewareProcess.php Module.php RestRegistTrait.php Route.php Schema.php
    Middlewares/ErrorCatch.php
    Middlewares/Caching.php
    Preview/
      PreviewSchema.php
      PreviewController.php
      PreviewRepository.php
      Excerpt.php
sources/client/preview/
  index.module.ts
  context.ts
  dom.ts
  driver.ts
  events.ts
  intent.ts
  network.ts
  policy.ts
  position.ts
  types.ts
  style.scss
```

The client is more than one module. `index.module.ts` holds the store; the
rest of the logic sits behind it in its own file, one concern per file:
`context.ts` (the shared types of the event handlers), `dom.ts` (DOM reads
and writes), `driver.ts` (the scheduler of `intent.ts`), `events.ts` (the
delegated listeners), `intent.ts` (the state machine), `network.ts` (the
fetcher and its cache), and `policy.ts` (which link is previewable). The
repository's own `max-lines` and `max-lines-per-function` ESLint rules
forced the split: a single file of this size would not pass them.

Names from the template initializer: plugin name `Rinkukado`, slug `rinkukado`,
text domain `rinkukado`, namespace `SpaghettiDojo\Rinkukado`, store name
`rinkukado`.

Every feature class follows the template rules: `final readonly`, a static
`new()` factory, a private constructor, and hook registration only inside
`init()`.

## 4. Server

### 4.1 Config

`Config` is a `final readonly` value object. A static factory reads the filters
once. Each module receives it through the constructor. This keeps every module
an `ExecutableModule`.

Filters, in the naming convention of the template:

- `rinkukado.popover.root-selector` — default `main`.
- `rinkukado.popover.deny-class` — default `no-rinkukado`.
- `rinkukado.popover.timings` — the three delays in milliseconds.
- `rinkukado.rest.post-types` — default: every public post type except
  `attachment`. Section 8 keeps an attachment preview out of scope; the
  filter can add `attachment` back for a site that wants it.
- `rinkukado.rest.excerpt-length` — default 30 words.
- `rinkukado.rest.payload` — the payload, before the response.

### 4.2 Popover module

`PopoverRegion` hooks `wp_footer`. It prints the single region and seeds the
store state with `wp_interactivity_state()`: the endpoint URL, the root
selector, the deny class, the timings, the breakpoint, and the translated close
label.

It seeds a REST nonce only when a user is logged in. An anonymous page therefore
holds no nonce, and a full page cache stays valid.

`ScriptModules` registers and enqueues the script module and the view style.

### 4.3 Rest module

The Konomi `Rest` library is copied into `sources/server/Rest/`, with the
namespace changed to `SpaghettiDojo\Rinkukado\Rest`. Three changes:

1. Add a `Route::get()` factory. The `Method` enum already holds the `GET` case,
   and `RestRegistTrait` already reads `$this->method`.
2. Drop `Middlewares\Authentication`. It depends on `Konomi\User\User`, which is
   outside the package, and the preview endpoint is public.
3. In `Middlewares\ErrorCatch`, return the file, the line, the message and the
   stack trace only when `WP_DEBUG` is true. The source carries a `TODO` about
   this leak.

`Rest\Module` stays a `ServiceModule`, because the library is built that way. It
provides `ErrorFactory`, `Middlewares\ErrorCatch` and `Middlewares\Caching`.

`Middlewares\Caching` is new. It sets `Cache-Control: public, max-age=300` for
an anonymous request, and `no-store` for a request of a logged-in user.

Registration:

```php
Rest\Route::get('rinkukado/v1', '/preview', new Preview\PreviewSchema(), $controller)
    ->withMiddleware($errorCatch)
    ->withMiddleware($caching)
    ->register();
```

The attachment order is the nesting order. `ErrorCatch` is attached first, so it
wraps everything.

### 4.4 Endpoint contract

`GET /wp-json/rinkukado/v1/preview?url=<absolute-url>`

The schema declares `url` as a required string, so WordPress validates and
sanitizes it before the controller runs.

The controller checks, in this order:

1. The host of the URL equals the host of the site.
2. `url_to_postid()` returns an ID greater than zero.
3. The post exists, its status is `publish`, and it holds no password.
4. The post type is public and allowed by `Config`.

Any failed check returns the same `404` error with the code `not_found`. The
response never says which check failed, so the endpoint cannot be used to find
draft content.

Success returns `200` with this payload:

```php
[
    'id' => 123,
    'title' => 'Post title',
    'excerpt' => 'Trimmed text…',
    'permalink' => 'https://example.com/post/',
    'thumbnail' => [
        'src' => '…', 'srcset' => '…', 'width' => 320, 'height' => 240, 'alt' => '…',
    ], // or null
]
```

`PreviewRepository` caches the payload in the object cache, group `rinkukado`,
key `preview:{id}:{excerptLength}`. It clears the key on `save_post`,
`delete_post` and `clean_post_cache`.

`Excerpt` returns the manual excerpt when it exists. Otherwise it builds one
from the content the way core does, without blocks, shortcodes and tags, and
trims it to the configured word count.

## 5. Client

### 5.1 The store

`index.module.ts` holds one `store('rinkukado', …)`. The region carries
`data-wp-init="callbacks.init"`.

`init` finds the root element with the seeded selector. When the selector
matches nothing, the function returns at once: no listener, no request, no
popover.

Otherwise it binds one listener per event type to the root: `pointerover`,
`pointerout`, `focusin`, `focusout`, `click` and `keydown`. Events bubble, so no
loop over the links is needed, and a link added later by another script is
covered.

Each event runs `event.target.closest('a')`, then the policy.

The store, through `network.ts`, keeps one request in flight per href, each
with its own `AbortController`, and one `Map` of href to settled result. A
settled result is either a payload or the marker `unavailable`; a href still
in flight or never requested holds no entry.

### 5.2 policy.ts

A pure function. It accepts a link when:

- the scheme is `http` or `https`;
- the host equals the host of the site;
- the path is not the home path;
- the path holds no file extension;
- the element carries no `target`, no `download` and no deny class.

`rel="nofollow"` and `rel="sponsored"` do not reject the link. They instruct a
search engine, not a reader. `rel="bookmark"` and `rel="tag"`, which core
prints, must keep working.

The host check runs before any request, so an external link costs nothing. An
internal URL that is not a post, such as a category or a search result, costs
one `404`, once per href per page. The result is then cached as `unavailable`,
so a second hover is silent.

### 5.3 intent.ts

A pure state machine over three phases, `idle`, `intent` and `open`, plus the
deadlines it schedules: `prefetchAt`, `openAt` and `closeAt`. It holds no DOM
access and no timer of its own; `driver.ts` passes the current time and runs
the commands the machine returns. Jest drives it with a fake clock, at the
level of the reducer and at the level of the driver.

- Pointer enters a link: start the prefetch at 80 ms, the open at 300 ms.
- Pointer leaves the link and the popover: close after 200 ms.
- Pointer returns inside the close delay: cancel the close.
- Pointer leaves before the payload arrives: abort the fetch, never open.
- A link opens while another one is open: close the old one first.
- First tap: open the sheet, stop the navigation.
- Second tap on the same link: navigate.
- Focus on a link: open after the same delay as the hover.
- Escape: close, and return focus to the link.
- A fetch that settles unavailable, while its href is still open: close.

### 5.4 position.ts

One pure function, `computePosition(anchorRect, popoverSize, viewport)`. It
prefers the block start, flips to the block end when there is no room, shifts
inline to stay inside the viewport, and clamps the inline size to
`min(28rem, 100vw - 2rem)`.

It runs only when the browser lacks CSS anchor positioning. Where the support
exists, the store writes `anchor-name` on the active link and the stylesheet
uses `position-anchor`, `position-area: block-start span-inline-end` and
`position-try-fallbacks: flip-block, flip-inline`.

The position is recomputed on scroll and on resize, inside
`requestAnimationFrame`. The popover closes when the link leaves the viewport.

### 5.5 Failure rules

A non-200 response, an invalid payload or a network error marks the href
`unavailable` for the page session. The popover never opens, nothing is logged
for the visitor, and the link keeps its normal behavior.

An abort is not a failure and leaves no mark.

## 6. Markup, layout and accessibility

```html
<div class="rinkukado" data-wp-interactive="rinkukado" data-wp-init="callbacks.init">
  <div class="rinkukado__dialog" role="dialog" aria-modal="false"
       tabindex="-1" aria-labelledby="rinkukado-title"
       data-wp-bind--hidden="!state.isOpen"
       data-wp-class--rinkukado--sheet="state.isSheet"
       data-wp-class--rinkukado--with-media="state.hasThumbnail"
       data-wp-on--keydown="actions.onDialogKeydown">
    <button type="button" class="rinkukado__close"
            data-wp-bind--aria-label="state.closeLabel"
            data-wp-on--click="actions.close"></button>
    <a id="rinkukado-title" class="rinkukado__title"
       data-wp-bind--href="state.permalink" data-wp-text="state.title"></a>
    <p class="rinkukado__excerpt" data-wp-text="state.excerpt"></p>
    <img class="rinkukado__media" alt=""
         data-wp-bind--src="state.thumbnailSrc"
         data-wp-bind--srcset="state.thumbnailSrcset"
         data-wp-bind--alt="state.thumbnailAlt">
    <a class="rinkukado__cta" data-wp-bind--href="state.permalink"
       data-wp-text="state.ctaLabel"></a>
  </div>
</div>
```

### 6.1 Layout

CSS grid, `grid-template-columns: 1fr auto`, areas `title media`,
`excerpt media`, `cta cta`. The modifier `rinkukado--with-media` creates the
second column.

The state of the thumbnail is flat: `state.thumbnailSrc`, `state.thumbnailSrcset`
and `state.thumbnailAlt`. A flat key holds an empty string when the post has no
thumbnail, so no binding reads a property of a null value.

`state.closeLabel` and `state.ctaLabel` hold the translated text of the close
button and of the "Read the article" link. `PopoverRegion` seeds both. Without a thumbnail the grid holds one column, and the text uses
the full width.

Every offset uses a logical property, so RTL needs no extra rule. The close
button sits at `inset-block-start` and `inset-inline-end`, which is the top left
corner in RTL. The excerpt is clamped by line.

### 6.2 Breakpoints

The Gutenberg branches `wp/6.9`, `wp/7.0` and `wp/7.1` ship the same values in
`packages/base-styles/_breakpoints.scss`:

```
$break-huge: 1440px  $break-wide: 1280px  $break-xlarge: 1080px
$break-large: 960px  $break-medium: 782px  $break-small: 600px
$break-mobile: 480px
```

The plugin uses the medium breakpoint, 782px, as the width arm of the rule of
section 6.3.

There is no `wp-7.1` npm distribution tag yet; the newest is `wp-7.0`. The
plugin therefore pins `roots/wordpress` to `^7.1.0` in `composer.json`, and the
`@wordpress/*` packages to `wp-7.0` in `package.json`. The npm pins move to
`wp-7.1` when the tag exists.

The plugin declares the two breakpoints it uses as its own SCSS variables, so it
does not depend on `@wordpress/base-styles` for a value it would copy anyway.

### 6.3 Modes

One rule decides the gesture and the layout together. The feature holds three
modes, and two media queries choose between them.

| Query that matches | Mode |
| --- | --- |
| `(pointer: coarse)` | the sheet, opened by a tap |
| `(hover: hover) and (pointer: fine) and (min-width: 782px)` | the anchored popover, opened by a hover |
| neither | off: no listener acts, no request leaves, no popover opens |

`(pointer: coarse)` reports the primary pointer of the device. Every phone and
every tablet therefore gets the sheet at every width and in both orientations,
including a tablet of 1366px in landscape. A laptop with a touch screen reports
`fine`, so it keeps the anchored popover.

The third mode exists because of a defect of an earlier design, which let the
gesture follow the pointer and the layout follow the pointer or the width. A
mouse in a window below 782px then met the one combination that cannot work:
the sheet sits at the bottom of the window, the pointer leaves the link on the
way to it, and the close delay of 200 ms ends before the pointer arrives. A tap
gesture for a mouse does not solve it either, because a click that opens a
sheet swallows the navigation that the visitor asked for. A link without a
preview is better than a link that does not follow.

`PopoverRegion` seeds both query strings. The store reads them with
`matchMedia`, keeps a listener on each, and holds the mode in one place, so
`state.isSheet`, the stylesheet and the handlers never disagree. A resize that
crosses into the off mode closes an open popover.

As a sheet the dialog uses `position: fixed`, `inset-inline: 0`,
`inset-block-end: 0`, `max-block-size: 60vb`, its own `overflow: auto`, rounded
corners at the block start, and `padding-block-end: env(safe-area-inset-bottom)`.
The stylesheet builds mobile first, so the sheet is the base and the anchored
popover arrives inside the query of the hover mode.

The page is never scroll locked. The visitor can scroll while the sheet stays at
the bottom of the viewport.

The sheet closes on the close button, on a tap outside, and on Escape. A second
tap on the same link navigates.

### 6.4 Keyboard and assistive technology

- The dialog holds `role="dialog"` and `aria-modal="false"`. It is not modal.
- Focus on a link opens the preview after the open delay, and adds
  `aria-describedby` to that link.
- Tab from the focused link moves into the close button. Shift and Tab from the
  close button returns to the link.
- Escape closes the popover and returns focus to the link.
- A hover never takes the focus.
- A tap that opens the sheet moves focus to the dialog, which is why the dialog
  carries `tabindex="-1"`.
- The close button holds a translated `aria-label`.

### 6.5 Motion and color

The open step is a short change of opacity and position. Under
`prefers-reduced-motion: reduce` the change is removed.

Colors come from custom properties, with light values by default and a
`prefers-color-scheme: dark` block. A theme can override the properties without
a change to the stylesheet.

## 7. Testing

### 7.1 PHP unit — Pest with Brain Monkey, `tests/unit/server/`

- `Config`: the defaults, the applied filter values, and the rejection of an
  invalid filter value.
- `Excerpt`: the manual excerpt is kept; an empty one falls back to the content,
  without blocks, shortcodes and tags, trimmed to the word count.
- `PreviewController`: one case for each rejection — foreign host, no post ID,
  draft, password, type not allowed, attachment — each with the same `404`; and
  one success case for the payload shape.
- `Middlewares\Caching`: the header for an anonymous request and for a logged-in
  request.
- The copied library: `Route::get()` registers the `GET` method;
  `MiddlewareProcess` nests in the attachment order; `ErrorCatch` hides the
  file, the line and the stack trace when `WP_DEBUG` is false.

### 7.2 PHP integration — Pest with `syde/wp-phpunit-integration`, `tests/integration/server/`

- The route exists after `rest_api_init`.
- A published post returns `200`, and the payload matches the post, its excerpt
  and its featured image.
- A draft, a password protected post, a post of a type that is not allowed, and
  a category URL each return `404`.
- A second request for the same post runs no extra query, measured with
  `$wpdb->num_queries`.
- `save_post` clears the cached payload.
- `PopoverRegion` prints once on `wp_footer`, and seeds no nonce for an
  anonymous visitor.

### 7.3 TypeScript unit — Jest through `wp-scripts test-unit-js`, `tests/unit/client/`

- `policy.ts`: a table of hrefs and attributes against accept or reject. It
  includes `rel="nofollow"`, which must be accepted, and `download`, `target`,
  a file extension, the home path, a fragment, an external host and the deny
  class, which must be rejected.
- `intent.ts`: a fake clock drives every transition of section 5.3.
- `position.ts`: rectangle fixtures for the preferred place, the flip, the two
  inline shifts, and the width clamp.

### 7.4 End to end — Playwright, `tests/e2e/specs/`

A must-use plugin in `tests/e2e/mu-plugins` creates the fixtures: a post with a
thumbnail, a post without one, a private post, and a page that holds links to
all of them, plus a category link and an external link.

- Desktop: a hover shows the title, the excerpt and the thumbnail; a link near
  the edge of the viewport stays inside it; the pointer away closes the popover;
  Escape closes it; a click on the title navigates.
- Sheet: with an emulated touch device, a tap opens the sheet at the bottom, the
  page still scrolls, the second tap navigates, and the close button dismisses
  the sheet.
- Keyboard: Tab to the link opens the popover, Tab enters the close button, and
  Escape returns the focus to the link.
- Negative: the category link and the external link show no popover, and route
  interception proves that the external link makes no request.
- The post without a thumbnail renders one column.

### 7.5 Quality gates

`composer qa` runs phpcs, phpstan and both PHP suites. The npm side runs
`lint:types`, `lint:scripts`, `lint:styles` and `test:unit`. The three workflows
of the template run them in CI.

## 8. Out of scope

- An admin settings screen. Filters only.
- A block, an editor control, and a `theme.json` style interface.
- A preview of an external URL, of a taxonomy archive, of an author archive, and
  of an attachment.
- A batch endpoint. One request per link, on intent.
- Multilingual support beyond what the object cache key already allows.

## 9. Assumptions and open items

1. The repository is created from the Spaghetti Dojo project template, and
   `node bin/init.mjs` is run with the names of section 3.
2. The entry convention of `wp-scripts` for a script module outside a
   `block.json`, with `WP_EXPERIMENTAL_MODULES=true`, is not verified. The
   template builds a module only through `viewScriptModule`. If there is no
   convention, the plugin declares an explicit webpack entry.
3. The plugin targets WordPress 7.1 and PHP 8.4. The plugin header declares
   `Requires at least: 7.1`.
