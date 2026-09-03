# Link Preview Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WordPress plugin that shows a popover with the title, the excerpt and the thumbnail of the post that a link targets.

**Architecture:** No server pass over the content. One Interactivity API store binds delegated listeners to a root element, applies a pure policy to the link under the pointer, and asks one REST endpoint for the preview. One shared dialog in the footer is anchored on a desktop and becomes a bottom sheet on a coarse pointer or a narrow window.

**Tech Stack:** PHP 8.4, WordPress 7.1, Inpsyde Modularity, the Konomi REST library, the Interactivity API, TypeScript, SCSS, `wp-scripts` (webpack), Pest, Brain Monkey, Jest, Playwright, `wp-env`.

**Spec:** `docs/superpowers/specs/2026-09-03-link-preview-popover-design.md`

## Global Constraints

- PHP 8.4 or later. WordPress 7.1 or later. The plugin header declares `Requires at least: 7.1`.
- Every PHP file starts with `declare(strict_types=1);` and lives in `SpaghettiDojo\Rinkukado`.
- A feature class is `final readonly`, has a static `new()` factory and a private constructor, and registers its hooks only inside `init()`. Hook callbacks are private methods, passed as `$this->method(...)`.
- A module is an `ExecutableModule` unless it must publish services. `Rest\Module` is the only `ServiceModule`, because the copied library is built that way.
- Custom hook names follow `rinkukado.{package}.{event-name}`, with dashes and no underscore.
- The npm packages of WordPress use the `wp-7.0` distribution tag. No `wp-7.1` tag exists yet.
- The store name, the text domain and the slug are all `rinkukado`.
- Timings: prefetch 80 ms, open 300 ms, close 200 ms.
- The sheet media query is `(pointer: coarse), (max-width: 781px)`. 781px is `$break-medium - 1px`.
- The endpoint is `GET /wp-json/rinkukado/v1/preview?url=<absolute-url>`. Every rejection returns the same `404` with the code `not_found`.
- Cache: `public, max-age=300` for an anonymous request, `no-store` for a logged-in one.
- Commit messages follow Conventional Commits, as `.claude/skills/github-commit/SKILL.md` describes: a title of at most 50 characters, a type, an optional scope from `blocks, server, client, package, tests, e2e, deps, template, claude, wp-env, docs`, and an imperative description in lower case.
- Prose in code comments and in documents follows Simplified Technical English: short sentences, active voice, no `-ing` form, no contraction.

---

## File Structure

**Create, server:**

| File | Responsibility |
| --- | --- |
| `sources/server/Config.php` | Reads every filter once. A value object passed to the feature classes. |
| `sources/server/Popover/Module.php` | Boots the popover feature. |
| `sources/server/Popover/PopoverRegion.php` | Prints the dialog on `wp_footer` and seeds the store state. |
| `sources/server/Popover/ScriptModules.php` | Registers and enqueues the script module and the style. |
| `sources/server/Rest/*.php` | The Konomi library, copied and adapted. |
| `sources/server/Rest/Middlewares/ErrorCatch.php` | The copied middleware, with the details gated behind `WP_DEBUG`. |
| `sources/server/Rest/Middlewares/Caching.php` | Sets `Cache-Control` on the response. |
| `sources/server/Rest/Preview/PreviewSchema.php` | The JSON schema of the request. |
| `sources/server/Rest/Preview/PreviewController.php` | Validates the URL, resolves the post, returns the payload. |
| `sources/server/Rest/Preview/PreviewRepository.php` | Builds the payload and caches it. |
| `sources/server/Rest/Preview/Excerpt.php` | The manual excerpt, else the core fallback. |

**Create, client:**

| File | Responsibility |
| --- | --- |
| `sources/client/preview/types.ts` | The shared types. No logic. |
| `sources/client/preview/policy.ts` | Decides whether a link can show a preview. Pure. |
| `sources/client/preview/intent.ts` | The state machine of the intent. Pure. |
| `sources/client/preview/position.ts` | The fallback positioner. Pure. |
| `sources/client/preview/index.module.ts` | The store: listeners, fetch, cache, focus, mode. |
| `sources/client/preview/style.scss` | The layout, the sheet, RTL, motion, color. |

**Create, build and tests:**

| File | Responsibility |
| --- | --- |
| `webpack.config.js` | Adds the module entry that `wp-scripts` cannot discover. |
| `tests/unit/server/*Test.php` | The PHP unit suite. |
| `tests/integration/server/*Test.php` | The PHP integration suite. |
| `tests/unit/client/*.test.ts` | The Jest suite. |
| `tests/e2e/mu-plugins/rinkukado-fixtures.php` | The content that the browser tests need. |
| `tests/e2e/specs/*.spec.ts` | The Playwright suite. |

**Modify:** `rinkukado.php` (add the two modules to the bootstrap), `README.md`, `docs/testing.md`.

---

## Task 1: The build pipeline and the module entry

`wp-scripts` builds a script module only from a `block.json` field. This plugin registers no block, so the entry must come from a webpack configuration of its own. Without this task no other client task can run.

**Files:**
- Create: `webpack.config.js`
- Create: `sources/client/preview/index.module.ts`
- Create: `sources/client/preview/style.scss`

**Interfaces:**
- Consumes: nothing.
- Produces: `build/preview/index.js`, `build/preview/index.asset.php` and `build/preview/style-index.css`. Task 3 registers those three paths.

- [ ] **Step 1: Install the dependencies**

```bash
composer install
pnpm install
```

- [ ] **Step 2: Write the webpack configuration**

`getWebpackEntryPoints('module')` returns an empty object when no `block.json` declares a module field, so the entry is declared here. The file exports only the module configuration, so the script configuration never runs and never warns about a missing `index.js`.

```js
/**
 * The module entry of this plugin comes from no block.json, so wp-scripts
 * cannot discover it. This configuration takes the module configuration of
 * wp-scripts and adds the entry.
 */

const path = require( 'node:path' );

const configs = require( '@wordpress/scripts/config/webpack.config' );

const moduleConfig = Array.isArray( configs ) ? configs[ 1 ] : configs;

module.exports = {
	...moduleConfig,
	entry: {
		'preview/index': path.resolve(
			process.cwd(),
			'sources/client/preview/index.module.ts'
		),
	},
};
```

- [ ] **Step 3: Write the entry file and the stylesheet**

```ts
// sources/client/preview/index.module.ts
import './style.scss';

// The store arrives in task 12. This file only proves that the build works.
export {};
```

```scss
// sources/client/preview/style.scss
.rinkukado {
	display: contents;
}
```

- [ ] **Step 4: Run the build and verify the output**

```bash
pnpm build
ls build/preview
```

Expected: `index.js`, `index.asset.php` and `style-index.css` exist. The style file comes from the `splitChunks` rule of `wp-scripts`, which names a chunk of `style.scss` as `style-<entry>`.

- [ ] **Step 5: Verify the type check and the linters**

```bash
pnpm lint:types
pnpm lint:styles
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add webpack.config.js sources/client/preview
git commit -m "build(client): add the script module entry"
```

---

## Task 2: Config

**Files:**
- Create: `sources/server/Config.php`
- Test: `tests/unit/server/ConfigTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `Config::new(): self`
  - `rootSelector(): string`, `denyClass(): string`, `excerptLength(): int`
  - `timings(): array{prefetch:int, open:int, close:int}`
  - `postTypes(): list<string>`
  - Constants `DEFAULT_ROOT_SELECTOR = 'main'`, `DEFAULT_DENY_CLASS = 'no-rinkukado'`, `DEFAULT_EXCERPT_LENGTH = 30`.

- [ ] **Step 1: Write the failing test**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Config;

beforeEach(function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed => $value
    );
    Functions\when('get_post_types')->justReturn(['post' => 'post', 'page' => 'page']);
});

it('returns the defaults', function (): void {
    $config = Config::new();

    expect($config->rootSelector())->toBe('main')
        ->and($config->denyClass())->toBe('no-rinkukado')
        ->and($config->excerptLength())->toBe(30)
        ->and($config->timings())->toBe(['prefetch' => 80, 'open' => 300, 'close' => 200])
        ->and($config->postTypes())->toBe(['post', 'page']);
});

it('applies the filter of the root selector', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.root-selector' ? '.site-content' : $value
    );

    expect(Config::new()->rootSelector())->toBe('.site-content');
});

it('rejects an empty root selector', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.root-selector' ? '   ' : $value
    );

    expect(Config::new()->rootSelector())->toBe('main');
});

it('rejects a timing that is not a positive integer', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.popover.timings'
                ? ['prefetch' => -1, 'open' => 'x', 'close' => 250]
                : $value
    );

    expect(Config::new()->timings())
        ->toBe(['prefetch' => 80, 'open' => 300, 'close' => 250]);
});

it('keeps only the post types that exist', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.post-types' ? ['post', 'book', 42] : $value
    );

    expect(Config::new()->postTypes())->toBe(['post']);
});

it('rejects an excerpt length below one', function (): void {
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.excerpt-length' ? 0 : $value
    );

    expect(Config::new()->excerptLength())->toBe(30);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
composer test:unit
```

Expected: FAIL with `Class "SpaghettiDojo\Rinkukado\Config" not found`.

- [ ] **Step 3: Write the implementation**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado;

/**
 * The configuration of the plugin, read from the filters once.
 *
 * @phpstan-type Timings array{prefetch: int, open: int, close: int}
 */
final readonly class Config
{
    public const DEFAULT_ROOT_SELECTOR = 'main';
    public const DEFAULT_DENY_CLASS = 'no-rinkukado';
    public const DEFAULT_EXCERPT_LENGTH = 30;

    private const DEFAULT_TIMINGS = ['prefetch' => 80, 'open' => 300, 'close' => 200];

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function rootSelector(): string
    {
        $value = apply_filters(
            'rinkukado.popover.root-selector',
            self::DEFAULT_ROOT_SELECTOR
        );

        $selector = is_string($value) ? trim($value) : '';

        return $selector === '' ? self::DEFAULT_ROOT_SELECTOR : $selector;
    }

    public function denyClass(): string
    {
        $value = apply_filters('rinkukado.popover.deny-class', self::DEFAULT_DENY_CLASS);

        $class = is_string($value) ? trim($value) : '';

        return $class === '' ? self::DEFAULT_DENY_CLASS : $class;
    }

    /**
     * @return Timings
     */
    public function timings(): array
    {
        $value = apply_filters('rinkukado.popover.timings', self::DEFAULT_TIMINGS);
        $value = is_array($value) ? $value : [];

        $timings = self::DEFAULT_TIMINGS;
        foreach (array_keys(self::DEFAULT_TIMINGS) as $key) {
            $candidate = $value[$key] ?? null;
            if (is_int($candidate) && $candidate >= 0) {
                $timings[$key] = $candidate;
            }
        }

        return $timings;
    }

    /**
     * @return list<string>
     */
    public function postTypes(): array
    {
        $public = get_post_types(['public' => true]);
        $public = array_values(array_map(static fn (mixed $type): string => (string) $type, $public));

        $value = apply_filters('rinkukado.rest.post-types', $public);
        $value = is_array($value) ? $value : $public;

        $types = array_values(array_filter(
            $value,
            static fn (mixed $type): bool => is_string($type) && in_array($type, $public, true)
        ));

        return $types === [] ? $public : $types;
    }

    public function excerptLength(): int
    {
        $value = apply_filters('rinkukado.rest.excerpt-length', self::DEFAULT_EXCERPT_LENGTH);

        return is_int($value) && $value > 0 ? $value : self::DEFAULT_EXCERPT_LENGTH;
    }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
composer test:unit
composer analysis
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add sources/server/Config.php tests/unit/server/ConfigTest.php
git commit -m "feat(server): add the configuration object"
```

---

## Task 3: The popover region and the assets

This task makes the feature visible in the page, with no behavior yet. It ends with real markup in the footer and a loaded module, which every client task then builds on.

**Files:**
- Create: `sources/server/Popover/Module.php`
- Create: `sources/server/Popover/PopoverRegion.php`
- Create: `sources/server/Popover/ScriptModules.php`
- Modify: `rinkukado.php`
- Test: `tests/integration/server/PopoverRegionTest.php`

**Interfaces:**
- Consumes: `Config` from task 2. The build output of task 1.
- Produces:
  - `Popover\Module::new(): self`
  - `PopoverRegion::new(Config $config): self` with `init(): void`
  - `ScriptModules::new(): self` with `init(): void`
  - The script module handle `rinkukado-preview` and the style handle `rinkukado-preview`.
  - The seeded state keys that task 12 reads: `endpoint`, `nonce`, `rootSelector`, `denyClass`, `timings`, `sheetQuery`, plus the render keys `isOpen`, `isSheet`, `hasThumbnail`, `title`, `excerpt`, `permalink`, `thumbnailSrc`, `thumbnailSrcset`, `thumbnailAlt`.

- [ ] **Step 1: Write the failing integration test**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Integration;

it('prints the dialog once in the footer', function (): void {
    ob_start();
    do_action('wp_footer');
    $output = (string) ob_get_clean();

    expect(substr_count($output, 'class="rinkukado"'))->toBe(1)
        ->and($output)->toContain('data-wp-interactive="rinkukado"')
        ->and($output)->toContain('role="dialog"')
        ->and($output)->toContain('data-wp-init="callbacks.init"');
});

it('seeds no nonce for an anonymous visitor', function (): void {
    wp_set_current_user(0);

    ob_start();
    do_action('wp_footer');
    ob_get_clean();

    $state = wp_interactivity_state('rinkukado');

    expect($state['nonce'])->toBe('')
        ->and($state['sheetQuery'])->toBe('(pointer: coarse), (max-width: 781px)')
        ->and($state['rootSelector'])->toBe('main')
        ->and($state['isOpen'])->toBeFalse();
});

it('seeds a nonce for a logged in user', function (): void {
    $user = self::factory()->user->create(['role' => 'editor']);
    wp_set_current_user($user);

    ob_start();
    do_action('wp_footer');
    ob_get_clean();

    expect(wp_interactivity_state('rinkukado')['nonce'])->not->toBe('');
});

it('registers the script module and the style', function (): void {
    do_action('init');
    do_action('wp_enqueue_scripts');

    expect(wp_style_is('rinkukado-preview', 'registered'))->toBeTrue();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
composer test:integration
```

Expected: FAIL. Nothing prints on `wp_footer`.

- [ ] **Step 3: Write the region**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Popover;

use SpaghettiDojo\Rinkukado\Config;

/**
 * Prints the single dialog of the page and seeds the state of the store.
 */
final readonly class PopoverRegion
{
    public const STORE = 'rinkukado';
    private const SHEET_QUERY = '(pointer: coarse), (max-width: 781px)';

    public static function new(Config $config): self
    {
        return new self($config);
    }

    private function __construct(private Config $config)
    {
    }

    public function init(): void
    {
        add_action('wp_footer', $this->render(...));
    }

    private function render(): void
    {
        if (is_admin() || is_feed()) {
            return;
        }

        wp_interactivity_state(self::STORE, $this->state());

        ?>
        <div class="rinkukado" data-wp-interactive="rinkukado" data-wp-init="callbacks.init">
            <div
                class="rinkukado__dialog"
                role="dialog"
                aria-modal="false"
                tabindex="-1"
                aria-labelledby="rinkukado-title"
                data-wp-bind--hidden="!state.isOpen"
                data-wp-class--rinkukado--sheet="state.isSheet"
                data-wp-class--rinkukado--with-media="state.hasThumbnail"
                data-wp-on--keydown="actions.onDialogKeydown"
            >
                <button
                    type="button"
                    class="rinkukado__close"
                    data-wp-bind--aria-label="state.closeLabel"
                    data-wp-on--click="actions.close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
                <a
                    id="rinkukado-title"
                    class="rinkukado__title"
                    data-wp-bind--href="state.permalink"
                    data-wp-text="state.title"
                ></a>
                <p class="rinkukado__excerpt" data-wp-text="state.excerpt"></p>
                <img
                    class="rinkukado__media"
                    alt=""
                    data-wp-bind--src="state.thumbnailSrc"
                    data-wp-bind--srcset="state.thumbnailSrcset"
                    data-wp-bind--alt="state.thumbnailAlt"
                >
                <a
                    class="rinkukado__cta"
                    data-wp-bind--href="state.permalink"
                    data-wp-text="state.ctaLabel"
                ></a>
            </div>
        </div>
        <?php
    }

    /**
     * @return array<string, mixed>
     */
    private function state(): array
    {
        return [
            'endpoint' => rest_url('rinkukado/v1/preview'),
            'nonce' => is_user_logged_in() ? wp_create_nonce('wp_rest') : '',
            'rootSelector' => $this->config->rootSelector(),
            'denyClass' => $this->config->denyClass(),
            'timings' => $this->config->timings(),
            'sheetQuery' => self::SHEET_QUERY,
            'closeLabel' => __('Close the preview', 'rinkukado'),
            'ctaLabel' => __('Read the article', 'rinkukado'),
            'isOpen' => false,
            'isSheet' => false,
            'hasThumbnail' => false,
            'title' => '',
            'excerpt' => '',
            'permalink' => '',
            'thumbnailSrc' => '',
            'thumbnailSrcset' => '',
            'thumbnailAlt' => '',
        ];
    }
}
```

- [ ] **Step 4: Write the asset registration**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Popover;

/**
 * Registers the script module and the style of the popover.
 */
final readonly class ScriptModules
{
    public const HANDLE = 'rinkukado-preview';

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function init(): void
    {
        add_action('init', $this->register(...));
        add_action('wp_enqueue_scripts', $this->enqueue(...));
    }

    private function register(): void
    {
        $asset = $this->asset();

        wp_register_script_module(
            self::HANDLE,
            plugins_url('build/preview/index.js', $this->pluginFile()),
            $asset['dependencies'],
            $asset['version']
        );

        wp_register_style(
            self::HANDLE,
            plugins_url('build/preview/style-index.css', $this->pluginFile()),
            [],
            $asset['version']
        );
    }

    private function enqueue(): void
    {
        if (is_admin() || is_feed()) {
            return;
        }

        wp_enqueue_script_module(self::HANDLE);
        wp_enqueue_style(self::HANDLE);
    }

    /**
     * @return array{dependencies: array<mixed>, version: string}
     */
    private function asset(): array
    {
        $file = dirname($this->pluginFile()) . '/build/preview/index.asset.php';

        $asset = is_readable($file) ? require $file : [];
        $asset = is_array($asset) ? $asset : [];

        $dependencies = $asset['dependencies'] ?? [];
        $version = $asset['version'] ?? '';

        return [
            'dependencies' => is_array($dependencies) ? $dependencies : [],
            'version' => is_string($version) && $version !== '' ? $version : '0.1.0',
        ];
    }

    private function pluginFile(): string
    {
        return dirname(__DIR__, 3) . '/rinkukado.php';
    }
}
```

- [ ] **Step 5: Write the module and wire the bootstrap**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Popover;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Psr\Container\ContainerInterface;
use SpaghettiDojo\Rinkukado\Config;

final class Module implements ExecutableModule
{
    use ModuleClassNameIdTrait;

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function run(ContainerInterface $container): bool
    {
        PopoverRegion::new(Config::new())->init();
        ScriptModules::new()->init();

        return true;
    }
}
```

In `rinkukado.php`, replace `package()->boot();` with:

```php
        package()
            ->addModule(Popover\Module::new())
            ->boot();
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
composer test:integration
composer cs
composer analysis
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add sources/server/Popover rinkukado.php tests/integration/server/PopoverRegionTest.php
git commit -m "feat(server): print the popover region"
```

---

## Task 4: The REST library, copied and adapted

The library comes from `https://github.com/Spaghetti-Dojo/konomi/tree/main/sources/Rest`. Copy the files by hand into `sources/server/Rest/`, change the namespace from `SpaghettiDojo\Konomi\Rest` to `SpaghettiDojo\Rinkukado\Rest`, and apply the three changes of this task. Do not copy `Middlewares/Authentication.php`, and do not copy the `Module.php` of Konomi: task 8 writes a module of this plugin.

**Files:**
- Create: `sources/server/Rest/Controller.php`, `ErrorFactory.php`, `Method.php`, `Middleware.php`, `MiddlewareProcess.php`, `RestRegistTrait.php`, `Route.php`, `Schema.php`
- Create: `sources/server/Rest/Middlewares/ErrorCatch.php`
- Test: `tests/unit/server/Rest/RouteTest.php`, `tests/unit/server/Rest/MiddlewareProcessTest.php`, `tests/unit/server/Rest/ErrorCatchTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `Rest\Route::get(string $namespace, string $route, Schema $schema, Controller $controller): self`
  - `Rest\Route::post(...)`, `withMiddleware(Middleware $middleware): self`, `register(): void`
  - `Rest\Controller` with `__invoke(\WP_REST_Request $request): \WP_REST_Response|\WP_Error`
  - `Rest\Middleware` with `__invoke(\WP_REST_Request $request, callable $next): \WP_REST_Response|\WP_Error`
  - `Rest\Schema` with `toArray(): array`
  - `Rest\ErrorFactory::new(): self` and `create(int|string $code, string $message, mixed $data): \WP_Error`
  - `Rest\Middlewares\ErrorCatch::new(ErrorFactory $errorFactory): self`

- [ ] **Step 1: Copy the files and change the namespace**

```bash
# From a clone of konomi, or from the GitHub web interface.
# Copy: Controller.php ErrorFactory.php Method.php Middleware.php
#       MiddlewareProcess.php RestRegistTrait.php Route.php Schema.php
#       Middlewares/ErrorCatch.php
# Then, in every copied file:
#   namespace SpaghettiDojo\Konomi\Rest  ->  namespace SpaghettiDojo\Rinkukado\Rest
#   use SpaghettiDojo\Konomi\Rest        ->  use SpaghettiDojo\Rinkukado\Rest
```

Change the text domain of the message in `ErrorCatch` from `konomi` to `rinkukado`.

- [ ] **Step 2: Write the failing tests of the three changes**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Rest;

final class FakeSchema implements Rest\Schema
{
    public function toArray(): array
    {
        return ['title' => 'fake', 'type' => 'object', 'properties' => []];
    }
}

final class FakeController implements Rest\Controller
{
    public function __invoke(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        return new \WP_REST_Response(['ok' => true], 200);
    }
}

it('registers a route with the GET method', function (): void {
    Functions\when('rest_get_endpoint_args_for_schema')->justReturn([]);

    Functions\expect('register_rest_route')
        ->once()
        ->with(
            'rinkukado/v1',
            '/preview',
            \Mockery::on(static fn (array $args): bool => $args['methods'] === 'GET')
        );

    Rest\Route::get('rinkukado/v1', '/preview', new FakeSchema(), new FakeController())
        ->register();
});
```

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use SpaghettiDojo\Rinkukado\Rest;

final class TagMiddleware implements Rest\Middleware
{
    /** @param list<string> $log */
    public function __construct(private string $tag, private array &$log)
    {
    }

    public function __invoke(\WP_REST_Request $request, callable $next): \WP_REST_Response|\WP_Error
    {
        $this->log[] = "in:{$this->tag}";
        $response = $next($request);
        $this->log[] = "out:{$this->tag}";

        return $response;
    }
}

it('nests the middlewares in the order of attachment', function (): void {
    $log = [];
    $request = \Mockery::mock(\WP_REST_Request::class);

    Rest\MiddlewareProcess::run(
        [new TagMiddleware('outer', $log), new TagMiddleware('inner', $log)],
        static fn (\WP_REST_Request $request): \WP_REST_Response
            => new \WP_REST_Response([], 200),
        $request
    );

    expect($log)->toBe(['in:outer', 'in:inner', 'out:inner', 'out:outer']);
});
```

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use SpaghettiDojo\Rinkukado\Rest;

it('hides the details when WP_DEBUG is false', function (): void {
    $request = \Mockery::mock(\WP_REST_Request::class);

    $error = Rest\Middlewares\ErrorCatch::new(Rest\ErrorFactory::new())(
        $request,
        static fn (): never => throw new \RuntimeException('the secret path'),
    );

    $data = $error->get_error_data();

    expect($data['status'])->toBe(500)
        ->and($data)->not->toHaveKey('stackTrace')
        ->and($data)->not->toHaveKey('file')
        ->and(json_encode($data))->not->toContain('the secret path');
});
```

`WP_DEBUG` is not defined in the unit suite, so the class must treat a missing constant as false.

- [ ] **Step 3: Run the tests to verify they fail**

```bash
composer test:unit
```

Expected: FAIL. `Route::get()` does not exist, and `ErrorCatch` returns the details.

- [ ] **Step 4: Add the GET factory to `Route`**

```php
    public static function get(
        string $namespace,
        string $route,
        Schema $schema,
        Controller $controller
    ): self {

        return new self($namespace, $route, Method::GET, $schema, $controller);
    }
```

- [ ] **Step 5: Gate the details of `ErrorCatch`**

Replace the `catch` block with:

```php
        } catch (\Throwable $exception) {
            $data = ['status' => 500];

            if (defined('WP_DEBUG') && WP_DEBUG) {
                $data += [
                    'code' => $exception->getCode(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'message' => $exception->getMessage(),
                    'stackTrace' => $exception->getTraceAsString(),
                ];
            }

            return $this->errorFactory->create(
                'internal_error',
                __(
                    'An internal error occurred. Contact the site owner or try again later.',
                    'rinkukado'
                ),
                $data
            );
        }
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
composer test:unit
composer cs
composer analysis
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add sources/server/Rest tests/unit/server/Rest
git commit -m "feat(server): add the rest library"
```

---

## Task 5: The caching middleware

**Files:**
- Create: `sources/server/Rest/Middlewares/Caching.php`
- Test: `tests/unit/server/Rest/CachingTest.php`

**Interfaces:**
- Consumes: `Rest\Middleware` from task 4.
- Produces: `Rest\Middlewares\Caching::new(): self` and the constant `MAX_AGE = 300`.

- [ ] **Step 1: Write the failing test**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Rest;

it('caches the response of an anonymous request', function (): void {
    Functions\when('is_user_logged_in')->justReturn(false);

    $request = \Mockery::mock(\WP_REST_Request::class);
    $response = \Mockery::mock(\WP_REST_Response::class);
    $response->expects('header')->once()->with('Cache-Control', 'public, max-age=300');

    $result = Rest\Middlewares\Caching::new()(
        $request,
        static fn (): \WP_REST_Response => $response
    );

    expect($result)->toBe($response);
});

it('never caches the response of a logged in user', function (): void {
    Functions\when('is_user_logged_in')->justReturn(true);

    $request = \Mockery::mock(\WP_REST_Request::class);
    $response = \Mockery::mock(\WP_REST_Response::class);
    $response->expects('header')->once()->with('Cache-Control', 'no-store');

    Rest\Middlewares\Caching::new()($request, static fn (): \WP_REST_Response => $response);
});

it('sets no header on an error', function (): void {
    Functions\when('is_user_logged_in')->justReturn(false);

    $request = \Mockery::mock(\WP_REST_Request::class);
    $error = \Mockery::mock(\WP_Error::class);

    expect(Rest\Middlewares\Caching::new()($request, static fn (): \WP_Error => $error))
        ->toBe($error);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
composer test:unit
```

Expected: FAIL with `Class "…\Rest\Middlewares\Caching" not found`.

- [ ] **Step 3: Write the implementation**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Middlewares;

use SpaghettiDojo\Rinkukado\Rest;

/**
 * Lets a shared cache keep the preview of an anonymous visitor.
 */
final readonly class Caching implements Rest\Middleware
{
    public const MAX_AGE = 300;

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function __invoke(
        \WP_REST_Request $request,
        callable $next
    ): \WP_REST_Response|\WP_Error {

        $response = $next($request);

        if (!$response instanceof \WP_REST_Response) {
            return $response;
        }

        $response->header(
            'Cache-Control',
            is_user_logged_in() ? 'no-store' : 'public, max-age=' . self::MAX_AGE
        );

        return $response;
    }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
composer test:unit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add sources/server/Rest/Middlewares/Caching.php tests/unit/server/Rest/CachingTest.php
git commit -m "feat(server): add the caching middleware"
```

---

## Task 6: The excerpt

**Files:**
- Create: `sources/server/Rest/Preview/Excerpt.php`
- Test: `tests/unit/server/Preview/ExcerptTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces: `Rest\Preview\Excerpt::new(int $length): self` and `forPost(\WP_Post $post): string`.

- [ ] **Step 1: Write the failing test**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Preview;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Rest\Preview\Excerpt;

function post(string $excerpt, string $content): \WP_Post
{
    $post = \Mockery::mock(\WP_Post::class);
    $post->post_excerpt = $excerpt;
    $post->post_content = $content;

    return $post;
}

beforeEach(function (): void {
    Functions\when('excerpt_remove_blocks')->returnArg();
    Functions\when('strip_shortcodes')->returnArg();
    Functions\when('wp_strip_all_tags')->alias(
        static fn (string $text): string => strip_tags($text)
    );
    Functions\when('wp_trim_words')->alias(
        static function (string $text, int $words, string $more): string {
            $parts = preg_split('/\s+/', trim($text)) ?: [];

            return count($parts) <= $words
                ? implode(' ', $parts)
                : implode(' ', array_slice($parts, 0, $words)) . $more;
        }
    );
});

it('keeps the manual excerpt', function (): void {
    $excerpt = Excerpt::new(3)->forPost(post('The manual excerpt of the post', ''));

    expect($excerpt)->toBe('The manual excerpt of the post');
});

it('builds the excerpt from the content when there is none', function (): void {
    $excerpt = Excerpt::new(3)->forPost(post('', '<p>one two three four</p>'));

    expect($excerpt)->toBe('one two three…');
});

it('removes the tags of a manual excerpt', function (): void {
    expect(Excerpt::new(30)->forPost(post('<em>text</em>', '')))->toBe('text');
});

it('returns an empty string when the post holds no text', function (): void {
    expect(Excerpt::new(30)->forPost(post('', '')))->toBe('');
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
composer test:unit
```

Expected: FAIL with `Class "…\Excerpt" not found`.

- [ ] **Step 3: Write the implementation**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

/**
 * Builds the text of the preview.
 *
 * The manual excerpt wins. Without one, the content becomes an excerpt the way
 * core builds it: no block, no shortcode, no tag, and a word limit.
 */
final readonly class Excerpt
{
    public static function new(int $length): self
    {
        return new self($length);
    }

    private function __construct(private int $length)
    {
    }

    public function forPost(\WP_Post $post): string
    {
        $manual = trim((string) $post->post_excerpt);

        if ($manual !== '') {
            return $this->clean($manual);
        }

        $content = $this->clean((string) $post->post_content);

        if ($content === '') {
            return '';
        }

        return wp_trim_words($content, $this->length, '…');
    }

    private function clean(string $text): string
    {
        $text = excerpt_remove_blocks($text);
        $text = strip_shortcodes($text);
        $text = wp_strip_all_tags($text);

        return trim(preg_replace('/\s+/u', ' ', $text) ?? '');
    }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
composer test:unit
composer analysis
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add sources/server/Rest/Preview/Excerpt.php tests/unit/server/Preview/ExcerptTest.php
git commit -m "feat(server): add the excerpt of the preview"
```

---

## Task 7: The preview repository

**Files:**
- Create: `sources/server/Rest/Preview/PreviewRepository.php`
- Test: `tests/unit/server/Preview/PreviewRepositoryTest.php`

**Interfaces:**
- Consumes: `Excerpt` from task 6.
- Produces:
  - `PreviewRepository::new(Excerpt $excerpt, int $excerptLength): self`
  - `init(): void` — hooks `save_post`, `delete_post` and `clean_post_cache`
  - `forPost(\WP_Post $post): array{id:int, title:string, excerpt:string, permalink:string, thumbnail: array{src:string, srcset:string, width:int, height:int, alt:string}|null}`
  - The constant `CACHE_GROUP = 'rinkukado'`

- [ ] **Step 1: Write the failing test**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Preview;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Rest\Preview\Excerpt;
use SpaghettiDojo\Rinkukado\Rest\Preview\PreviewRepository;

function thumbnailPost(int $id): \WP_Post
{
    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = $id;
    $post->post_title = 'The title';
    $post->post_excerpt = 'The excerpt';
    $post->post_content = '';

    return $post;
}

beforeEach(function (): void {
    Functions\when('wp_cache_get')->justReturn(false);
    Functions\when('wp_cache_set')->justReturn(true);
    Functions\when('get_permalink')->justReturn('https://example.com/post/');
    Functions\when('get_the_title')->justReturn('The title');
    Functions\when('has_post_thumbnail')->justReturn(false);
});

it('builds the payload of a post without a thumbnail', function (): void {
    $excerpt = \Mockery::mock(Excerpt::class);
    $excerpt->expects('forPost')->once()->andReturn('The excerpt');

    $payload = PreviewRepository::new($excerpt, 30)->forPost(thumbnailPost(7));

    expect($payload)->toBe([
        'id' => 7,
        'title' => 'The title',
        'excerpt' => 'The excerpt',
        'permalink' => 'https://example.com/post/',
        'thumbnail' => null,
    ]);
});

it('builds the payload of a post with a thumbnail', function (): void {
    Functions\when('has_post_thumbnail')->justReturn(true);
    Functions\when('get_post_thumbnail_id')->justReturn(99);
    Functions\when('wp_get_attachment_image_src')->justReturn([
        'https://example.com/image.jpg', 320, 240, false,
    ]);
    Functions\when('wp_get_attachment_image_srcset')->justReturn('https://example.com/image.jpg 320w');
    Functions\when('get_post_meta')->justReturn('The alt text');

    $excerpt = \Mockery::mock(Excerpt::class);
    $excerpt->expects('forPost')->once()->andReturn('The excerpt');

    $payload = PreviewRepository::new($excerpt, 30)->forPost(thumbnailPost(7));

    expect($payload['thumbnail'])->toBe([
        'src' => 'https://example.com/image.jpg',
        'srcset' => 'https://example.com/image.jpg 320w',
        'width' => 320,
        'height' => 240,
        'alt' => 'The alt text',
    ]);
});

it('returns the cached payload without a second build', function (): void {
    Functions\when('wp_cache_get')->justReturn([
        'id' => 7,
        'title' => 'Cached',
        'excerpt' => '',
        'permalink' => '',
        'thumbnail' => null,
    ]);

    $excerpt = \Mockery::mock(Excerpt::class);
    $excerpt->expects('forPost')->never();

    expect(PreviewRepository::new($excerpt, 30)->forPost(thumbnailPost(7))['title'])
        ->toBe('Cached');
});

it('registers the hooks that clear the cache', function (): void {
    Functions\expect('add_action')->once()->with('save_post', \Mockery::type('callable'));
    Functions\expect('add_action')->once()->with('delete_post', \Mockery::type('callable'));
    Functions\expect('add_action')->once()->with('clean_post_cache', \Mockery::type('callable'));

    PreviewRepository::new(\Mockery::mock(Excerpt::class), 30)->init();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
composer test:unit
```

Expected: FAIL with `Class "…\PreviewRepository" not found`.

- [ ] **Step 3: Write the implementation**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

/**
 * Builds the payload of a preview and keeps it in the object cache.
 *
 * @phpstan-type Thumbnail array{src: string, srcset: string, width: int, height: int, alt: string}
 * @phpstan-type Payload array{
 *     id: int,
 *     title: string,
 *     excerpt: string,
 *     permalink: string,
 *     thumbnail: Thumbnail|null
 * }
 */
final readonly class PreviewRepository
{
    public const CACHE_GROUP = 'rinkukado';
    private const IMAGE_SIZE = 'medium';

    public static function new(Excerpt $excerpt, int $excerptLength): self
    {
        return new self($excerpt, $excerptLength);
    }

    private function __construct(
        private Excerpt $excerpt,
        private int $excerptLength,
    ) {
    }

    public function init(): void
    {
        add_action('save_post', $this->flush(...));
        add_action('delete_post', $this->flush(...));
        add_action('clean_post_cache', $this->flush(...));
    }

    /**
     * @return Payload
     */
    public function forPost(\WP_Post $post): array
    {
        $key = $this->key((int) $post->ID);
        $cached = wp_cache_get($key, self::CACHE_GROUP);

        if (is_array($cached)) {
            /** @var Payload $cached */
            return $cached;
        }

        $payload = [
            'id' => (int) $post->ID,
            'title' => (string) get_the_title($post),
            'excerpt' => $this->excerpt->forPost($post),
            'permalink' => (string) get_permalink($post),
            'thumbnail' => $this->thumbnail($post),
        ];

        wp_cache_set($key, $payload, self::CACHE_GROUP);

        return $payload;
    }

    /**
     * @return Thumbnail|null
     */
    private function thumbnail(\WP_Post $post): ?array
    {
        if (!has_post_thumbnail($post)) {
            return null;
        }

        $attachmentId = (int) get_post_thumbnail_id($post);
        $image = wp_get_attachment_image_src($attachmentId, self::IMAGE_SIZE);

        if (!is_array($image) || !is_string($image[0] ?? null)) {
            return null;
        }

        $srcset = wp_get_attachment_image_srcset($attachmentId, self::IMAGE_SIZE);
        $alt = get_post_meta($attachmentId, '_wp_attachment_image_alt', true);

        return [
            'src' => (string) $image[0],
            'srcset' => is_string($srcset) ? $srcset : '',
            'width' => (int) ($image[1] ?? 0),
            'height' => (int) ($image[2] ?? 0),
            'alt' => is_string($alt) ? $alt : '',
        ];
    }

    private function flush(int $postId): void
    {
        wp_cache_delete($this->key($postId), self::CACHE_GROUP);
    }

    private function key(int $postId): string
    {
        return "preview:{$postId}:{$this->excerptLength}";
    }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
composer test:unit
composer analysis
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add sources/server/Rest/Preview/PreviewRepository.php tests/unit/server/Preview/PreviewRepositoryTest.php
git commit -m "feat(server): add the preview repository"
```

---

## Task 8: The schema, the controller and the route

**Files:**
- Create: `sources/server/Rest/Preview/PreviewSchema.php`
- Create: `sources/server/Rest/Preview/PreviewController.php`
- Create: `sources/server/Rest/Module.php`
- Modify: `rinkukado.php`
- Test: `tests/unit/server/Preview/PreviewControllerTest.php`
- Test: `tests/integration/server/PreviewEndpointTest.php`

**Interfaces:**
- Consumes: `Config` (task 2), `Rest\Route`, `Rest\ErrorFactory`, `Rest\Middlewares\ErrorCatch` (task 4), `Caching` (task 5), `Excerpt` (task 6), `PreviewRepository` (task 7).
- Produces:
  - `PreviewSchema::new(): self`
  - `PreviewController::new(Config $config, PreviewRepository $repository, Rest\ErrorFactory $errorFactory): self`
  - `Rest\Module::new(): self`, which is both a `ServiceModule` and an `ExecutableModule`
  - The route `GET rinkukado/v1/preview`
  - The filter `rinkukado.rest.payload`, with the payload and the `WP_Post` as arguments

- [ ] **Step 1: Write the failing unit test of the controller**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Preview;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Rest;
use SpaghettiDojo\Rinkukado\Rest\Preview\PreviewController;
use SpaghettiDojo\Rinkukado\Rest\Preview\PreviewRepository;

function request(string $url): \WP_REST_Request
{
    $request = \Mockery::mock(\WP_REST_Request::class);
    $request->allows('get_param')->with('url')->andReturn($url);

    return $request;
}

function config(): Config
{
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed => $value
    );
    Functions\when('get_post_types')->justReturn(['post' => 'post', 'page' => 'page']);

    return Config::new();
}

beforeEach(function (): void {
    Functions\when('home_url')->justReturn('https://example.com');
    Functions\when('wp_parse_url')->alias(
        static fn (string $url, int $component = -1): mixed => parse_url($url, $component)
    );
    Functions\when('url_to_postid')->justReturn(0);
    Functions\when('__')->returnArg();
});

it('rejects a URL of another host', function (): void {
    $repository = \Mockery::mock(PreviewRepository::class);
    $repository->expects('forPost')->never();

    $error = PreviewController::new(config(), $repository, Rest\ErrorFactory::new())(
        request('https://other.test/post/')
    );

    expect($error)->toBeInstanceOf(\WP_Error::class)
        ->and($error->get_error_code())->toBe('not_found')
        ->and($error->get_error_data()['status'])->toBe(404);
});

it('rejects a URL that resolves to no post', function (): void {
    $repository = \Mockery::mock(PreviewRepository::class);

    $error = PreviewController::new(config(), $repository, Rest\ErrorFactory::new())(
        request('https://example.com/category/news/')
    );

    expect($error->get_error_code())->toBe('not_found');
});

it('rejects a post that is not published', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'draft';
    $post->post_password = '';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);

    $error = PreviewController::new(
        config(),
        \Mockery::mock(PreviewRepository::class),
        Rest\ErrorFactory::new()
    )(request('https://example.com/draft/'));

    expect($error->get_error_code())->toBe('not_found');
});

it('rejects a post that holds a password', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = 'secret';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);

    $error = PreviewController::new(
        config(),
        \Mockery::mock(PreviewRepository::class),
        Rest\ErrorFactory::new()
    )(request('https://example.com/secret/'));

    expect($error->get_error_code())->toBe('not_found');
});

it('rejects a post type that is not allowed', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = '';
    $post->post_type = 'attachment';

    Functions\when('get_post')->justReturn($post);

    $error = PreviewController::new(
        config(),
        \Mockery::mock(PreviewRepository::class),
        Rest\ErrorFactory::new()
    )(request('https://example.com/image/'));

    expect($error->get_error_code())->toBe('not_found');
});

it('returns the payload of a published post', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = '';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);

    $payload = [
        'id' => 7,
        'title' => 'The title',
        'excerpt' => 'The excerpt',
        'permalink' => 'https://example.com/post/',
        'thumbnail' => null,
    ];

    $repository = \Mockery::mock(PreviewRepository::class);
    $repository->expects('forPost')->once()->with($post)->andReturn($payload);

    $response = PreviewController::new(config(), $repository, Rest\ErrorFactory::new())(
        request('https://example.com/post/')
    );

    expect($response)->toBeInstanceOf(\WP_REST_Response::class)
        ->and($response->get_status())->toBe(200)
        ->and($response->get_data())->toBe($payload);
});

it('lets a filter change the payload', function (): void {
    Functions\when('url_to_postid')->justReturn(7);

    $post = \Mockery::mock(\WP_Post::class);
    $post->ID = 7;
    $post->post_status = 'publish';
    $post->post_password = '';
    $post->post_type = 'post';

    Functions\when('get_post')->justReturn($post);
    Functions\when('apply_filters')->alias(
        static fn (string $hook, mixed $value): mixed
            => $hook === 'rinkukado.rest.payload'
                ? ['id' => 7, 'title' => 'Filtered', 'excerpt' => '', 'permalink' => '', 'thumbnail' => null]
                : $value
    );

    $repository = \Mockery::mock(PreviewRepository::class);
    $repository->allows('forPost')->andReturn([
        'id' => 7,
        'title' => 'The title',
        'excerpt' => '',
        'permalink' => '',
        'thumbnail' => null,
    ]);

    Functions\when('get_post_types')->justReturn(['post' => 'post', 'page' => 'page']);

    $response = PreviewController::new(
        Config::new(),
        $repository,
        Rest\ErrorFactory::new()
    )(request('https://example.com/post/'));

    expect($response->get_data()['title'])->toBe('Filtered');
});
```

The filter runs after the cache, so a change of a filter never needs a cache
flush.

- [ ] **Step 2: Run the test to verify it fails**

```bash
composer test:unit
```

Expected: FAIL with `Class "…\PreviewController" not found`.

- [ ] **Step 3: Write the schema**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

use SpaghettiDojo\Rinkukado\Rest;

/**
 * The request of the preview endpoint. WordPress validates it before the
 * controller runs.
 */
final readonly class PreviewSchema implements Rest\Schema
{
    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function toArray(): array
    {
        return [
            'title' => 'preview',
            'type' => 'object',
            'properties' => [
                'url' => [
                    'type' => 'string',
                    'format' => 'uri',
                    'required' => true,
                    'description' => __(
                        'The absolute URL of the post to preview.',
                        'rinkukado'
                    ),
                ],
            ],
        ];
    }
}
```

- [ ] **Step 4: Write the controller**

Every rejection returns the same error, so the endpoint tells nothing about the content that it refuses.

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest\Preview;

use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Rest;

/**
 * Turns the URL of a link into the payload of a preview.
 */
final readonly class PreviewController implements Rest\Controller
{
    public static function new(
        Config $config,
        PreviewRepository $repository,
        Rest\ErrorFactory $errorFactory
    ): self {

        return new self($config, $repository, $errorFactory);
    }

    private function __construct(
        private Config $config,
        private PreviewRepository $repository,
        private Rest\ErrorFactory $errorFactory,
    ) {
    }

    public function __invoke(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        $url = (string) $request->get_param('url');

        $post = $this->post($url);

        if ($post === null) {
            return $this->notFound();
        }

        /** @var array<string, mixed> $payload */
        $payload = apply_filters(
            'rinkukado.rest.payload',
            $this->repository->forPost($post),
            $post
        );

        return new \WP_REST_Response($payload, 200);
    }

    private function post(string $url): ?\WP_Post
    {
        if (!$this->isLocal($url)) {
            return null;
        }

        $postId = url_to_postid($url);

        if ($postId < 1) {
            return null;
        }

        $post = get_post($postId);

        if (!$post instanceof \WP_Post) {
            return null;
        }

        if ($post->post_status !== 'publish' || $post->post_password !== '') {
            return null;
        }

        if (!in_array($post->post_type, $this->config->postTypes(), true)) {
            return null;
        }

        return $post;
    }

    private function isLocal(string $url): bool
    {
        $host = wp_parse_url($url, PHP_URL_HOST);
        $home = wp_parse_url(home_url(), PHP_URL_HOST);

        return is_string($host) && is_string($home) && strtolower($host) === strtolower($home);
    }

    private function notFound(): \WP_Error
    {
        return $this->errorFactory->create(
            'not_found',
            __('No preview exists for this link.', 'rinkukado'),
            ['status' => 404]
        );
    }
}
```

- [ ] **Step 5: Write the module and wire the bootstrap**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Inpsyde\Modularity\Module\ServiceModule;
use Psr\Container\ContainerInterface;
use SpaghettiDojo\Rinkukado\Config;

/**
 * Publishes the services of the REST layer and registers the preview route.
 */
final class Module implements ServiceModule, ExecutableModule
{
    use ModuleClassNameIdTrait;

    public static function new(): self
    {
        return new self();
    }

    private function __construct()
    {
    }

    public function services(): array
    {
        return [
            Config::class => static fn (): Config => Config::new(),

            ErrorFactory::class => static fn (): ErrorFactory => ErrorFactory::new(),

            Middlewares\ErrorCatch::class => static fn (
                ContainerInterface $container
            ): Middlewares\ErrorCatch => Middlewares\ErrorCatch::new(
                $container->get(ErrorFactory::class)
            ),

            Middlewares\Caching::class
                => static fn (): Middlewares\Caching => Middlewares\Caching::new(),

            Preview\PreviewRepository::class => static function (
                ContainerInterface $container
            ): Preview\PreviewRepository {
                $config = $container->get(Config::class);

                return Preview\PreviewRepository::new(
                    Preview\Excerpt::new($config->excerptLength()),
                    $config->excerptLength()
                );
            },

            Preview\PreviewController::class => static fn (
                ContainerInterface $container
            ): Preview\PreviewController => Preview\PreviewController::new(
                $container->get(Config::class),
                $container->get(Preview\PreviewRepository::class),
                $container->get(ErrorFactory::class)
            ),
        ];
    }

    public function run(ContainerInterface $container): bool
    {
        $container->get(Preview\PreviewRepository::class)->init();

        add_action('rest_api_init', static function () use ($container): void {
            Route::get(
                'rinkukado/v1',
                '/preview',
                Preview\PreviewSchema::new(),
                $container->get(Preview\PreviewController::class)
            )
                ->withMiddleware($container->get(Middlewares\ErrorCatch::class))
                ->withMiddleware($container->get(Middlewares\Caching::class))
                ->register();
        });

        return true;
    }
}
```

In `rinkukado.php`, add the module before the popover module:

```php
        package()
            ->addModule(Rest\Module::new())
            ->addModule(Popover\Module::new())
            ->boot();
```

- [ ] **Step 6: Write the failing integration test**

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Integration;

function get(string $url): \WP_REST_Response
{
    $request = new \WP_REST_Request('GET', '/rinkukado/v1/preview');
    $request->set_param('url', $url);

    return rest_get_server()->dispatch($request);
}

beforeEach(function (): void {
    do_action('rest_api_init');
});

it('registers the route', function (): void {
    expect(rest_get_server()->get_routes())
        ->toHaveKey('/rinkukado/v1/preview');
});

it('returns the payload of a published post', function (): void {
    $postId = self::factory()->post->create([
        'post_title' => 'The title',
        'post_excerpt' => 'The excerpt',
        'post_status' => 'publish',
    ]);

    $response = get(get_permalink($postId));

    expect($response->get_status())->toBe(200)
        ->and($response->get_data()['id'])->toBe($postId)
        ->and($response->get_data()['title'])->toBe('The title')
        ->and($response->get_data()['excerpt'])->toBe('The excerpt')
        ->and($response->get_data()['thumbnail'])->toBeNull()
        ->and($response->get_headers()['Cache-Control'])->toBe('public, max-age=300');
});

it('refuses a draft', function (): void {
    $postId = self::factory()->post->create(['post_status' => 'draft']);

    expect(get(get_permalink($postId))->get_status())->toBe(404);
});

it('refuses a post that holds a password', function (): void {
    $postId = self::factory()->post->create([
        'post_status' => 'publish',
        'post_password' => 'secret',
    ]);

    expect(get(get_permalink($postId))->get_status())->toBe(404);
});

it('refuses a category', function (): void {
    $termId = self::factory()->category->create(['name' => 'news']);

    expect(get(get_category_link($termId))->get_status())->toBe(404);
});

it('refuses a URL of another host', function (): void {
    expect(get('https://other.test/post/')->get_status())->toBe(404);
});

it('runs no query for the second request of the same post', function (): void {
    global $wpdb;

    $postId = self::factory()->post->create(['post_status' => 'publish']);
    $url = get_permalink($postId);

    get($url);
    $before = $wpdb->num_queries;
    get($url);

    expect($wpdb->num_queries - $before)->toBeLessThan(3);
});

it('clears the cached payload when the post changes', function (): void {
    $postId = self::factory()->post->create([
        'post_status' => 'publish',
        'post_title' => 'First title',
    ]);
    $url = get_permalink($postId);

    get($url);

    wp_update_post(['ID' => $postId, 'post_title' => 'Second title']);

    expect(get($url)->get_data()['title'])->toBe('Second title');
});

it('never caches the response of a logged in user', function (): void {
    $user = self::factory()->user->create(['role' => 'editor']);
    wp_set_current_user($user);

    $postId = self::factory()->post->create(['post_status' => 'publish']);

    expect(get(get_permalink($postId))->get_headers()['Cache-Control'])->toBe('no-store');
});
```

The second request still runs the query of `url_to_postid()`, so the assertion allows a small number of queries and proves only that the payload does not get built again.

- [ ] **Step 7: Run every PHP test**

```bash
composer test:unit
composer test:integration
composer cs
composer analysis
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add sources/server/Rest rinkukado.php tests/unit/server/Preview tests/integration/server/PreviewEndpointTest.php
git commit -m "feat(server): add the preview endpoint"
```

---

## Task 9: The client policy

**Files:**
- Create: `sources/client/preview/types.ts`
- Create: `sources/client/preview/policy.ts`
- Test: `tests/unit/client/policy.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `types.ts`: `Preview`, `Thumbnail`, `Timings`, `ServerState`
  - `policy.ts`: `LinkFacts`, `PolicyOptions`, `factsFromLink( link: HTMLAnchorElement ): LinkFacts`, `isPreviewable( facts: LinkFacts, options: PolicyOptions ): boolean`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/client/policy.test.ts
import { isPreviewable } from '../../../sources/client/preview/policy';
import type {
	LinkFacts,
	PolicyOptions,
} from '../../../sources/client/preview/policy';

const options: PolicyOptions = {
	siteOrigin: 'https://example.com',
	homePath: '/',
	currentPath: '/blog/current-post/',
	denyClass: 'no-rinkukado',
};

const facts = ( overrides: Partial< LinkFacts > = {} ): LinkFacts => ( {
	href: 'https://example.com/blog/other-post/',
	target: null,
	hasDownload: false,
	classes: [],
	...overrides,
} );

describe( 'isPreviewable', () => {
	it( 'accepts an internal link to another post', () => {
		expect( isPreviewable( facts(), options ) ).toBe( true );
	} );

	it( 'accepts a link that carries rel nofollow, which the facts ignore', () => {
		expect( isPreviewable( facts( { classes: [ 'wp-block-post' ] } ), options ) ).toBe(
			true
		);
	} );

	it( 'rejects another origin', () => {
		expect(
			isPreviewable( facts( { href: 'https://other.test/post/' } ), options )
		).toBe( false );
	} );

	it( 'rejects a scheme that is not http', () => {
		expect(
			isPreviewable( facts( { href: 'mailto:someone@example.com' } ), options )
		).toBe( false );
	} );

	it( 'rejects the home page', () => {
		expect( isPreviewable( facts( { href: 'https://example.com/' } ), options ) ).toBe(
			false
		);
	} );

	it( 'rejects a link to the current page', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://example.com/blog/current-post/#section' } ),
				options
			)
		).toBe( false );
	} );

	it( 'rejects a file', () => {
		expect(
			isPreviewable( facts( { href: 'https://example.com/report.pdf' } ), options )
		).toBe( false );
	} );

	it( 'rejects a link that opens a new tab', () => {
		expect( isPreviewable( facts( { target: '_blank' } ), options ) ).toBe( false );
	} );

	it( 'rejects a download', () => {
		expect( isPreviewable( facts( { hasDownload: true } ), options ) ).toBe( false );
	} );

	it( 'rejects the deny class', () => {
		expect(
			isPreviewable( facts( { classes: [ 'no-rinkukado' ] } ), options )
		).toBe( false );
	} );

	it( 'rejects an href that is not a URL', () => {
		expect( isPreviewable( facts( { href: '' } ), options ) ).toBe( false );
	} );
} );
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL. The module does not exist.

- [ ] **Step 3: Write the types**

```ts
// sources/client/preview/types.ts
export type Thumbnail = {
	src: string;
	srcset: string;
	width: number;
	height: number;
	alt: string;
};

export type Preview = {
	id: number;
	title: string;
	excerpt: string;
	permalink: string;
	thumbnail: Thumbnail | null;
};

export type Timings = {
	prefetch: number;
	open: number;
	close: number;
};

export type ServerState = {
	endpoint: string;
	nonce: string;
	rootSelector: string;
	denyClass: string;
	timings: Timings;
	sheetQuery: string;
	closeLabel: string;
	ctaLabel: string;
};
```

- [ ] **Step 4: Write the policy**

```ts
// sources/client/preview/policy.ts

/**
 * The facts of a link that the decision needs. The DOM stays outside of the
 * decision, so the rules are testable without a document.
 */
export type LinkFacts = {
	href: string;
	target: string | null;
	hasDownload: boolean;
	classes: readonly string[];
};

export type PolicyOptions = {
	siteOrigin: string;
	homePath: string;
	currentPath: string;
	denyClass: string;
};

const FILE_EXTENSION = /\.[a-z0-9]{2,5}$/i;

export function factsFromLink( link: HTMLAnchorElement ): LinkFacts {
	return {
		href: link.href,
		target: link.getAttribute( 'target' ),
		hasDownload: link.hasAttribute( 'download' ),
		classes: Array.from( link.classList ),
	};
}

export function isPreviewable( facts: LinkFacts, options: PolicyOptions ): boolean {
	if ( facts.target !== null && facts.target !== '' ) {
		return false;
	}

	if ( facts.hasDownload ) {
		return false;
	}

	if ( facts.classes.includes( options.denyClass ) ) {
		return false;
	}

	let url: URL;

	try {
		url = new URL( facts.href );
	} catch {
		return false;
	}

	if ( url.protocol !== 'http:' && url.protocol !== 'https:' ) {
		return false;
	}

	if ( url.origin !== options.siteOrigin ) {
		return false;
	}

	if ( url.pathname === options.homePath || url.pathname === options.currentPath ) {
		return false;
	}

	return ! FILE_EXTENSION.test( url.pathname );
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
pnpm test:unit
pnpm lint:types
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add sources/client/preview/types.ts sources/client/preview/policy.ts tests/unit/client/policy.test.ts
git commit -m "feat(client): add the policy of the links"
```

---

## Task 10: The intent machine

**Files:**
- Create: `sources/client/preview/intent.ts`
- Test: `tests/unit/client/intent.test.ts`

**Interfaces:**
- Consumes: `Timings` from task 9.
- Produces:
  - `Phase`, `Machine`, `IntentEvent`, `Command`, `Result`
  - `initial: Machine`
  - `reduce( machine: Machine, event: IntentEvent, timings: Timings ): Result`
  - `nextDeadline( machine: Machine ): number | null`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/client/intent.test.ts
import {
	initial,
	nextDeadline,
	reduce,
} from '../../../sources/client/preview/intent';
import type { Machine } from '../../../sources/client/preview/intent';
import type { Timings } from '../../../sources/client/preview/types';

const timings: Timings = { prefetch: 80, open: 300, close: 200 };
const href = 'https://example.com/post/';

const enter = ( machine: Machine, at: number ) =>
	reduce( machine, { type: 'enter', href, at }, timings );

const tick = ( machine: Machine, at: number ) =>
	reduce( machine, { type: 'tick', at }, timings );

describe( 'reduce', () => {
	it( 'prefetches after the prefetch delay', () => {
		const entered = enter( initial, 1000 ).machine;

		expect( tick( entered, 1079 ).commands ).toEqual( [] );
		expect( tick( entered, 1080 ).commands ).toEqual( [ { type: 'prefetch', href } ] );
	} );

	it( 'opens after the open delay', () => {
		let machine = enter( initial, 1000 ).machine;
		machine = tick( machine, 1080 ).machine;

		const result = tick( machine, 1300 );

		expect( result.commands ).toEqual( [ { type: 'open', href } ] );
		expect( result.machine.phase ).toBe( 'open' );
	} );

	it( 'aborts when the pointer leaves before the popover opens', () => {
		const machine = enter( initial, 1000 ).machine;

		const result = reduce( machine, { type: 'leave', at: 1100 }, timings );

		expect( result.commands ).toEqual( [ { type: 'abort' } ] );
		expect( result.machine ).toEqual( initial );
	} );

	it( 'closes after the close delay', () => {
		let machine = enter( initial, 1000 ).machine;
		machine = tick( machine, 1300 ).machine;
		machine = reduce( machine, { type: 'leave', at: 2000 }, timings ).machine;

		expect( tick( machine, 2199 ).commands ).toEqual( [] );

		const result = tick( machine, 2200 );

		expect( result.commands ).toEqual( [ { type: 'close' } ] );
		expect( result.machine ).toEqual( initial );
	} );

	it( 'cancels the close when the pointer returns', () => {
		let machine = enter( initial, 1000 ).machine;
		machine = tick( machine, 1300 ).machine;
		machine = reduce( machine, { type: 'leave', at: 2000 }, timings ).machine;
		machine = enter( machine, 2100 ).machine;

		expect( tick( machine, 2300 ).commands ).toEqual( [] );
		expect( machine.phase ).toBe( 'open' );
	} );

	it( 'opens on the first tap and stops the navigation', () => {
		const result = reduce( initial, { type: 'tap', href }, timings );

		expect( result.commands ).toEqual( [
			{ type: 'prefetch', href },
			{ type: 'open', href },
		] );
		expect( result.machine.phase ).toBe( 'open' );
	} );

	it( 'navigates on the second tap of the same link', () => {
		const machine = reduce( initial, { type: 'tap', href }, timings ).machine;

		expect( reduce( machine, { type: 'tap', href }, timings ).commands ).toEqual( [
			{ type: 'navigate', href },
		] );
	} );

	it( 'opens the preview of another link on a tap', () => {
		const machine = reduce( initial, { type: 'tap', href }, timings ).machine;
		const other = 'https://example.com/other/';

		expect( reduce( machine, { type: 'tap', href: other }, timings ).commands ).toEqual(
			[
				{ type: 'prefetch', href: other },
				{ type: 'open', href: other },
			]
		);
	} );

	it( 'closes on escape', () => {
		const machine = reduce( initial, { type: 'tap', href }, timings ).machine;

		const result = reduce( machine, { type: 'escape' }, timings );

		expect( result.commands ).toEqual( [ { type: 'close' } ] );
		expect( result.machine ).toEqual( initial );
	} );

	it( 'closes at once on a click outside', () => {
		const machine = reduce( initial, { type: 'tap', href }, timings ).machine;

		expect( reduce( machine, { type: 'outside' }, timings ).commands ).toEqual( [
			{ type: 'close' },
		] );
	} );

	it( 'opens on focus like on hover', () => {
		const machine = reduce( initial, { type: 'focus', href, at: 1000 }, timings )
			.machine;

		expect( tick( machine, 1300 ).commands ).toEqual( [ { type: 'open', href } ] );
	} );
} );

describe( 'nextDeadline', () => {
	it( 'returns nothing when no timer runs', () => {
		expect( nextDeadline( initial ) ).toBeNull();
	} );

	it( 'returns the earliest deadline', () => {
		expect( nextDeadline( enter( initial, 1000 ).machine ) ).toBe( 1080 );
	} );
} );
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL. The module does not exist.

- [ ] **Step 3: Write the machine**

```ts
// sources/client/preview/intent.ts
import type { Timings } from './types';

export type Phase = 'idle' | 'intent' | 'open';

export type Machine = {
	phase: Phase;
	href: string | null;
	prefetchAt: number | null;
	openAt: number | null;
	closeAt: number | null;
};

export type IntentEvent =
	| { type: 'enter'; href: string; at: number }
	| { type: 'focus'; href: string; at: number }
	| { type: 'leave'; at: number }
	| { type: 'tick'; at: number }
	| { type: 'tap'; href: string }
	| { type: 'escape' }
	| { type: 'outside' };

export type Command =
	| { type: 'prefetch'; href: string }
	| { type: 'open'; href: string }
	| { type: 'close' }
	| { type: 'abort' }
	| { type: 'navigate'; href: string };

export type Result = {
	machine: Machine;
	commands: Command[];
};

export const initial: Machine = {
	phase: 'idle',
	href: null,
	prefetchAt: null,
	openAt: null,
	closeAt: null,
};

export function nextDeadline( machine: Machine ): number | null {
	const deadlines = [ machine.prefetchAt, machine.openAt, machine.closeAt ].filter(
		( value ): value is number => value !== null
	);

	return deadlines.length > 0 ? Math.min( ...deadlines ) : null;
}

function start( machine: Machine, href: string, at: number, timings: Timings ): Result {
	// The pointer came back to the link that the popover already shows.
	if ( machine.phase === 'open' && machine.href === href ) {
		return { machine: { ...machine, closeAt: null }, commands: [] };
	}

	return {
		machine: {
			phase: 'intent',
			href,
			prefetchAt: at + timings.prefetch,
			openAt: at + timings.open,
			closeAt: null,
		},
		commands: [],
	};
}

function tick( machine: Machine, at: number ): Result {
	const commands: Command[] = [];
	let next = machine;

	if ( next.prefetchAt !== null && at >= next.prefetchAt && next.href !== null ) {
		commands.push( { type: 'prefetch', href: next.href } );
		next = { ...next, prefetchAt: null };
	}

	if ( next.openAt !== null && at >= next.openAt && next.href !== null ) {
		commands.push( { type: 'open', href: next.href } );
		next = { ...next, phase: 'open', openAt: null };
	}

	if ( next.closeAt !== null && at >= next.closeAt ) {
		commands.push( { type: 'close' } );
		next = initial;
	}

	return { machine: next, commands };
}

export function reduce(
	machine: Machine,
	event: IntentEvent,
	timings: Timings
): Result {
	switch ( event.type ) {
		case 'enter':
		case 'focus':
			return start( machine, event.href, event.at, timings );

		case 'leave':
			if ( machine.phase === 'intent' ) {
				return { machine: initial, commands: [ { type: 'abort' } ] };
			}

			if ( machine.phase === 'open' ) {
				return {
					machine: { ...machine, closeAt: event.at + timings.close },
					commands: [],
				};
			}

			return { machine, commands: [] };

		case 'tick':
			return tick( machine, event.at );

		case 'tap':
			if ( machine.phase === 'open' && machine.href === event.href ) {
				return { machine, commands: [ { type: 'navigate', href: event.href } ] };
			}

			return {
				machine: {
					phase: 'open',
					href: event.href,
					prefetchAt: null,
					openAt: null,
					closeAt: null,
				},
				commands: [
					{ type: 'prefetch', href: event.href },
					{ type: 'open', href: event.href },
				],
			};

		case 'escape':
		case 'outside':
			if ( machine.phase === 'idle' ) {
				return { machine, commands: [] };
			}

			return { machine: initial, commands: [ { type: 'close' } ] };
	}
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test:unit
pnpm lint:types
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add sources/client/preview/intent.ts tests/unit/client/intent.test.ts
git commit -m "feat(client): add the intent machine"
```

---

## Task 11: The fallback positioner

**Files:**
- Create: `sources/client/preview/position.ts`
- Test: `tests/unit/client/position.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Rect`, `Size`, `Viewport`, `Placement`, `computePosition( anchor: Rect, popover: Size, viewport: Viewport, gap?: number ): Placement`, and the constant `MARGIN = 8`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/client/position.test.ts
import { computePosition } from '../../../sources/client/preview/position';

const viewport = { width: 1000, height: 800 };
const popover = { width: 400, height: 200 };

describe( 'computePosition', () => {
	it( 'places the popover above the link when there is room', () => {
		const placement = computePosition(
			{ top: 400, left: 300, width: 100, height: 20 },
			popover,
			viewport
		);

		expect( placement.side ).toBe( 'above' );
		expect( placement.top ).toBe( 192 );
		expect( placement.left ).toBe( 150 );
	} );

	it( 'flips below when there is no room above', () => {
		const placement = computePosition(
			{ top: 40, left: 300, width: 100, height: 20 },
			popover,
			viewport
		);

		expect( placement.side ).toBe( 'below' );
		expect( placement.top ).toBe( 68 );
	} );

	it( 'shifts to the inline start edge', () => {
		const placement = computePosition(
			{ top: 400, left: 0, width: 60, height: 20 },
			popover,
			viewport
		);

		expect( placement.left ).toBe( 8 );
	} );

	it( 'shifts to the inline end edge', () => {
		const placement = computePosition(
			{ top: 400, left: 960, width: 40, height: 20 },
			popover,
			viewport
		);

		expect( placement.left ).toBe( 592 );
	} );

	it( 'keeps the popover inside a short viewport', () => {
		const placement = computePosition(
			{ top: 100, left: 300, width: 100, height: 20 },
			{ width: 400, height: 700 },
			{ width: 1000, height: 400 }
		);

		expect( placement.top ).toBe( 8 );
	} );
} );
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL. The module does not exist.

- [ ] **Step 3: Write the positioner**

```ts
// sources/client/preview/position.ts

export type Rect = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };
export type Viewport = { width: number; height: number };
export type Placement = { top: number; left: number; side: 'above' | 'below' };

export const MARGIN = 8;

function clamp( value: number, min: number, max: number ): number {
	if ( max < min ) {
		return min;
	}

	return Math.min( Math.max( value, min ), max );
}

/**
 * Places the popover near the link, inside the viewport.
 *
 * The browsers that support CSS anchor positioning never call this function.
 */
export function computePosition(
	anchor: Rect,
	popover: Size,
	viewport: Viewport,
	gap: number = MARGIN
): Placement {
	const spaceAbove = anchor.top;
	const spaceBelow = viewport.height - ( anchor.top + anchor.height );
	const needed = popover.height + gap;

	let side: 'above' | 'below' = 'above';

	if ( spaceAbove < needed ) {
		side = spaceBelow >= needed || spaceBelow > spaceAbove ? 'below' : 'above';
	}

	const top =
		side === 'above'
			? anchor.top - gap - popover.height
			: anchor.top + anchor.height + gap;

	const left = anchor.left + anchor.width / 2 - popover.width / 2;

	return {
		side,
		top: clamp( top, MARGIN, viewport.height - popover.height - MARGIN ),
		left: clamp( left, MARGIN, viewport.width - popover.width - MARGIN ),
	};
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm test:unit
pnpm lint:types
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add sources/client/preview/position.ts tests/unit/client/position.test.ts
git commit -m "feat(client): add the fallback positioner"
```

---

## Task 12: The store

This task joins the three pure modules to the DOM. It binds the delegated listeners, runs the fetch, fills the state, moves the focus and places the dialog.

**Files:**
- Modify: `sources/client/preview/index.module.ts`
- Test: `tests/unit/client/store.test.ts`

**Interfaces:**
- Consumes: `policy.ts`, `intent.ts`, `position.ts`, `types.ts`, and the state that `PopoverRegion` seeds.
- Produces: the store `rinkukado`, with `callbacks.init`, `actions.close`, `actions.onDialogKeydown`, and the two exported helpers `resolveRoot` and `readPreview`.

- [ ] **Step 1: Write the failing test of the two helpers**

```ts
// tests/unit/client/store.test.ts
import { readPreview, resolveRoot } from '../../../sources/client/preview/index.module';

describe( 'resolveRoot', () => {
	it( 'finds the root of the selector', () => {
		document.body.innerHTML = '<main id="content"></main>';

		expect( resolveRoot( document, 'main' ) ).toBe(
			document.getElementById( 'content' )
		);
	} );

	it( 'returns nothing when the selector matches no element', () => {
		document.body.innerHTML = '<div></div>';

		expect( resolveRoot( document, 'main' ) ).toBeNull();
	} );

	it( 'returns nothing when the selector is not valid', () => {
		document.body.innerHTML = '<main></main>';

		expect( resolveRoot( document, '::::' ) ).toBeNull();
	} );
} );

describe( 'readPreview', () => {
	it( 'accepts a payload of the endpoint', () => {
		const payload = {
			id: 7,
			title: 'The title',
			excerpt: 'The excerpt',
			permalink: 'https://example.com/post/',
			thumbnail: null,
		};

		expect( readPreview( payload ) ).toEqual( payload );
	} );

	it( 'refuses a payload without a title', () => {
		expect( readPreview( { id: 7, permalink: 'https://example.com/' } ) ).toBeNull();
	} );

	it( 'refuses a value that is not an object', () => {
		expect( readPreview( 'nope' ) ).toBeNull();
	} );
} );
```

The Interactivity API package must not break the Jest run. Add the mock below to `package.json` under the `jest` key, so `wp-scripts test-unit-js` replaces the package with a small double.

```json
	"jest": {
		"moduleNameMapper": {
			"^@wordpress/interactivity$": "<rootDir>/tests/unit/client/interactivity-mock.ts"
		}
	}
```

```ts
// tests/unit/client/interactivity-mock.ts
export const store = ( _name: string, definition: unknown ): unknown => definition;
export const getElement = () => ( { ref: document.body } );
export const getContext = () => ( {} );
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:unit
```

Expected: FAIL. `resolveRoot` is not exported.

- [ ] **Step 3: Write the store**

```ts
// sources/client/preview/index.module.ts
import { getElement, store } from '@wordpress/interactivity';

import { factsFromLink, isPreviewable } from './policy';
import { initial, nextDeadline, reduce } from './intent';
import { computePosition } from './position';

import type { Command, IntentEvent, Machine } from './intent';
import type { Preview, ServerState, Timings } from './types';

import './style.scss';

type State = ServerState & {
	isOpen: boolean;
	isSheet: boolean;
	hasThumbnail: boolean;
	title: string;
	excerpt: string;
	permalink: string;
	thumbnailSrc: string;
	thumbnailSrcset: string;
	thumbnailAlt: string;
};

type LoadResult = Preview | 'unavailable' | 'aborted';

const ANCHOR_NAME = '--rinkukado-anchor';

const cache = new Map< string, Preview | 'unavailable' >();

let machine: Machine = initial;
let timer: number | null = null;
let frame: number | null = null;
let controller: AbortController | null = null;
let root: Element | null = null;
let dialog: HTMLElement | null = null;
let closeButton: HTMLButtonElement | null = null;
let activeLink: HTMLAnchorElement | null = null;

/**
 * Finds the element that holds the links. A selector that matches nothing
 * turns the whole feature off.
 */
export function resolveRoot( document: Document, selector: string ): Element | null {
	try {
		return document.querySelector( selector );
	} catch {
		return null;
	}
}

/**
 * Accepts only a payload that holds every field the dialog renders.
 */
export function readPreview( value: unknown ): Preview | null {
	if ( typeof value !== 'object' || value === null ) {
		return null;
	}

	const candidate = value as Record< string, unknown >;

	if (
		typeof candidate.id !== 'number' ||
		typeof candidate.title !== 'string' ||
		typeof candidate.excerpt !== 'string' ||
		typeof candidate.permalink !== 'string'
	) {
		return null;
	}

	return candidate as unknown as Preview;
}

const { state } = store( 'rinkukado', {
	state: {} as State,

	actions: {
		close(): void {
			send( { type: 'escape' } );
		},

		onDialogKeydown( event: KeyboardEvent ): void {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				send( { type: 'escape' } );

				return;
			}

			// Shift and Tab on the close button returns to the link.
			if (
				event.key === 'Tab' &&
				event.shiftKey &&
				event.target === closeButton &&
				activeLink !== null
			) {
				event.preventDefault();
				activeLink.focus();
			}
		},
	},

	callbacks: {
		init(): void {
			const region = getElement().ref as HTMLElement | null;

			if ( region === null ) {
				return;
			}

			dialog = region.querySelector< HTMLElement >( '.rinkukado__dialog' );
			closeButton = region.querySelector< HTMLButtonElement >( '.rinkukado__close' );
			root = resolveRoot( document, state.rootSelector );

			if ( root === null || dialog === null ) {
				return;
			}

			bind( root );
		},
	},
} );

function timings(): Timings {
	return state.timings;
}

function bind( element: Element ): void {
	element.addEventListener( 'pointerover', onPointerOver );
	element.addEventListener( 'pointerout', onPointerOut );
	element.addEventListener( 'focusin', onFocusIn );
	element.addEventListener( 'focusout', onFocusOut );
	element.addEventListener( 'click', onClick );
	element.addEventListener( 'keydown', onKeyDown );

	dialog?.addEventListener( 'pointerover', cancelClose );
	dialog?.addEventListener( 'pointerout', onDialogPointerOut );

	document.addEventListener( 'click', onDocumentClick );
	window.addEventListener( 'scroll', onViewportChange, { passive: true } );
	window.addEventListener( 'resize', onViewportChange );
}

function previewable( target: EventTarget | null ): HTMLAnchorElement | null {
	if ( ! ( target instanceof Element ) ) {
		return null;
	}

	const link = target.closest< HTMLAnchorElement >( 'a[href]' );

	if ( link === null ) {
		return null;
	}

	const options = {
		siteOrigin: window.location.origin,
		homePath: new URL( state.endpoint ).pathname.replace( /wp-json.*$/, '' ),
		currentPath: window.location.pathname,
		denyClass: state.denyClass,
	};

	return isPreviewable( factsFromLink( link ), options ) ? link : null;
}

function isCoarse(): boolean {
	return window.matchMedia( '(pointer: coarse)' ).matches;
}

function onPointerOver( event: Event ): void {
	if ( isCoarse() ) {
		return;
	}

	const link = previewable( event.target );

	if ( link === null ) {
		return;
	}

	activeLink = link;
	send( { type: 'enter', href: link.href, at: Date.now() } );
}

function onPointerOut( event: Event ): void {
	if ( isCoarse() ) {
		return;
	}

	const related = ( event as PointerEvent ).relatedTarget;

	if ( related instanceof Node && dialog?.contains( related ) ) {
		return;
	}

	if ( previewable( event.target ) === null ) {
		return;
	}

	send( { type: 'leave', at: Date.now() } );
}

function onDialogPointerOut( event: Event ): void {
	const related = ( event as PointerEvent ).relatedTarget;

	if ( related instanceof Node && dialog?.contains( related ) ) {
		return;
	}

	send( { type: 'leave', at: Date.now() } );
}

function cancelClose(): void {
	if ( machine.phase === 'open' && machine.href !== null ) {
		send( { type: 'enter', href: machine.href, at: Date.now() } );
	}
}

function onFocusIn( event: Event ): void {
	const link = previewable( event.target );

	if ( link === null ) {
		return;
	}

	activeLink = link;
	send( { type: 'focus', href: link.href, at: Date.now() } );
}

function onFocusOut( event: Event ): void {
	const related = ( event as FocusEvent ).relatedTarget;

	if ( related instanceof Node && dialog?.contains( related ) ) {
		return;
	}

	if ( previewable( event.target ) === null ) {
		return;
	}

	send( { type: 'leave', at: Date.now() } );
}

function onClick( event: Event ): void {
	if ( ! isCoarse() ) {
		return;
	}

	const link = previewable( event.target );

	if ( link === null ) {
		return;
	}

	// The first tap opens the sheet. The second tap of the same link navigates.
	if ( ! ( machine.phase === 'open' && machine.href === link.href ) ) {
		event.preventDefault();
	}

	activeLink = link;
	send( { type: 'tap', href: link.href } );
}

function onKeyDown( event: Event ): void {
	const keyboard = event as KeyboardEvent;

	if ( keyboard.key === 'Escape' ) {
		send( { type: 'escape' } );

		return;
	}

	// Tab from the link enters the dialog.
	if (
		keyboard.key === 'Tab' &&
		! keyboard.shiftKey &&
		state.isOpen &&
		keyboard.target === activeLink &&
		closeButton !== null
	) {
		keyboard.preventDefault();
		closeButton.focus();
	}
}

function onDocumentClick( event: Event ): void {
	if ( ! state.isOpen ) {
		return;
	}

	const target = event.target;

	if ( target instanceof Node && dialog?.contains( target ) ) {
		return;
	}

	if ( previewable( target ) !== null ) {
		return;
	}

	send( { type: 'outside' } );
}

function onViewportChange(): void {
	if ( ! state.isOpen || frame !== null ) {
		return;
	}

	frame = window.requestAnimationFrame( () => {
		frame = null;

		if ( activeLink === null || state.isSheet ) {
			return;
		}

		const rect = activeLink.getBoundingClientRect();

		if ( rect.bottom < 0 || rect.top > window.innerHeight ) {
			send( { type: 'escape' } );

			return;
		}

		place( activeLink );
	} );
}

function send( event: IntentEvent ): void {
	const result = reduce( machine, event, timings() );
	machine = result.machine;

	result.commands.forEach( run );

	schedule();
}

function schedule(): void {
	if ( timer !== null ) {
		window.clearTimeout( timer );
		timer = null;
	}

	const deadline = nextDeadline( machine );

	if ( deadline === null ) {
		return;
	}

	const delay = Math.max( 0, deadline - Date.now() );

	timer = window.setTimeout( () => {
		timer = null;
		send( { type: 'tick', at: Date.now() } );
	}, delay );
}

function run( command: Command ): void {
	switch ( command.type ) {
		case 'prefetch':
			void load( command.href );
			break;

		case 'open':
			void open( command.href );
			break;

		case 'close':
			close();
			break;

		case 'abort':
			controller?.abort();
			controller = null;
			break;

		case 'navigate':
			window.location.assign( command.href );
			break;
	}
}

async function load( href: string ): Promise< LoadResult > {
	const cached = cache.get( href );

	if ( cached !== undefined ) {
		return cached;
	}

	controller?.abort();
	controller = new AbortController();

	const headers: Record< string, string > = {};

	if ( state.nonce !== '' ) {
		headers[ 'X-WP-Nonce' ] = state.nonce;
	}

	try {
		const response = await window.fetch(
			`${ state.endpoint }?url=${ encodeURIComponent( href ) }`,
			{ headers, credentials: 'same-origin', signal: controller.signal }
		);

		if ( ! response.ok ) {
			cache.set( href, 'unavailable' );

			return 'unavailable';
		}

		const preview = readPreview( await response.json() );

		if ( preview === null ) {
			cache.set( href, 'unavailable' );

			return 'unavailable';
		}

		cache.set( href, preview );

		return preview;
	} catch ( error ) {
		if ( error instanceof DOMException && error.name === 'AbortError' ) {
			return 'aborted';
		}

		cache.set( href, 'unavailable' );

		return 'unavailable';
	}
}

async function open( href: string ): Promise< void > {
	const result = await load( href );

	if ( result === 'unavailable' || result === 'aborted' ) {
		machine = initial;

		return;
	}

	// The visitor moved on while the payload arrived.
	if ( machine.href !== href ) {
		return;
	}

	state.title = result.title;
	state.excerpt = result.excerpt;
	state.permalink = result.permalink;
	state.hasThumbnail = result.thumbnail !== null;
	state.thumbnailSrc = result.thumbnail?.src ?? '';
	state.thumbnailSrcset = result.thumbnail?.srcset ?? '';
	state.thumbnailAlt = result.thumbnail?.alt ?? '';
	state.isSheet = window.matchMedia( state.sheetQuery ).matches;
	state.isOpen = true;

	if ( activeLink !== null ) {
		activeLink.setAttribute( 'aria-describedby', 'rinkukado-title' );
		place( activeLink );
	}

	if ( state.isSheet ) {
		dialog?.focus();
	}
}

function place( link: HTMLAnchorElement ): void {
	if ( dialog === null || state.isSheet ) {
		return;
	}

	if ( window.CSS?.supports?.( 'anchor-name: --a' ) ) {
		link.style.setProperty( 'anchor-name', ANCHOR_NAME );

		return;
	}

	const rect = link.getBoundingClientRect();

	const placement = computePosition(
		{ top: rect.top, left: rect.left, width: rect.width, height: rect.height },
		{ width: dialog.offsetWidth, height: dialog.offsetHeight },
		{ width: window.innerWidth, height: window.innerHeight }
	);

	dialog.style.top = `${ placement.top }px`;
	dialog.style.left = `${ placement.left }px`;
	dialog.dataset.side = placement.side;
}

function close(): void {
	controller?.abort();
	controller = null;

	state.isOpen = false;

	if ( activeLink !== null ) {
		activeLink.removeAttribute( 'aria-describedby' );
		activeLink.style.removeProperty( 'anchor-name' );

		if ( dialog?.contains( document.activeElement ) ) {
			activeLink.focus();
		}
	}

	activeLink = null;
}
```

- [ ] **Step 4: Run the tests and the build**

```bash
pnpm test:unit
pnpm lint:types
pnpm lint:scripts
pnpm build
```

Expected: all pass, and `build/preview/index.js` exists.

- [ ] **Step 5: Commit**

```bash
git add sources/client/preview/index.module.ts tests/unit/client package.json
git commit -m "feat(client): add the store of the popover"
```

---

## Task 13: The stylesheet

**Files:**
- Modify: `sources/client/preview/style.scss`

**Interfaces:**
- Consumes: the class names of task 3 and the `data-side` attribute of task 12.
- Produces: the anchored layout, the sheet layout, the RTL behavior, the motion rule and the color tokens.

- [ ] **Step 1: Write the stylesheet**

```scss
// sources/client/preview/style.scss

// The breakpoint of WordPress. $break-medium is 782px in the branches wp/6.9,
// wp/7.0 and wp/7.1. The value lives here, so the plugin needs no package for
// one number.
$break-medium: 782px;

.rinkukado {
	--rinkukado-background: #fff;
	--rinkukado-text: #1e1e1e;
	--rinkukado-muted: #50575e;
	--rinkukado-border: #e0e0e0;
	--rinkukado-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	--rinkukado-radius: 8px;
	--rinkukado-z-index: 100000;

	display: contents;
}

.rinkukado__dialog {
	position: fixed;
	z-index: var(--rinkukado-z-index);
	inline-size: min(28rem, calc(100vw - 2rem));
	padding: 1rem;
	display: grid;
	grid-template-columns: 1fr;
	grid-template-areas:
		"title"
		"excerpt"
		"cta";
	gap: 0.5rem 1rem;
	background: var(--rinkukado-background);
	color: var(--rinkukado-text);
	border: 1px solid var(--rinkukado-border);
	border-radius: var(--rinkukado-radius);
	box-shadow: var(--rinkukado-shadow);

	&[hidden] {
		display: none;
	}
}

// The second column exists only when the post holds a thumbnail.
.rinkukado--with-media {
	grid-template-columns: 1fr auto;
	grid-template-areas:
		"title media"
		"excerpt media"
		"cta cta";
}

.rinkukado__close {
	position: absolute;
	inset-block-start: 0.25rem;
	inset-inline-end: 0.25rem;
	inline-size: 2rem;
	block-size: 2rem;
	padding: 0;
	background: transparent;
	border: 0;
	color: var(--rinkukado-muted);
	cursor: pointer;
	font-size: 1.25rem;
	line-height: 1;
}

.rinkukado__title {
	grid-area: title;
	padding-inline-end: 2rem;
	font-weight: 600;
	text-decoration: none;
	color: inherit;
}

.rinkukado__excerpt {
	grid-area: excerpt;
	margin: 0;
	color: var(--rinkukado-muted);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 4;
	overflow: hidden;
}

.rinkukado__media {
	grid-area: media;
	inline-size: 7.5rem;
	block-size: 7.5rem;
	object-fit: cover;
	border-radius: calc(var(--rinkukado-radius) / 2);

	.rinkukado__dialog:not(.rinkukado--with-media) & {
		display: none;
	}
}

.rinkukado__cta {
	grid-area: cta;
	justify-self: start;
	font-weight: 600;
}

// The browsers that support anchor positioning place the dialog themselves.
@supports (anchor-name: --a) {
	.rinkukado__dialog:not(.rinkukado--sheet) {
		position-anchor: --rinkukado-anchor;
		position-area: block-start span-inline-end;
		position-try-fallbacks: flip-block, flip-inline;
		margin: 0.5rem;
	}
}

// The sheet serves every coarse pointer, at any width, and a narrow window on
// a desktop.
@media (pointer: coarse), (max-width: #{$break-medium - 1px}) {
	.rinkukado__dialog {
		position: fixed;
		inset-inline: 0;
		inset-block-end: 0;
		inset-block-start: auto;
		inline-size: 100%;
		max-block-size: 60vh;
		overflow: auto;
		border-radius: var(--rinkukado-radius) var(--rinkukado-radius) 0 0;
		border-inline: 0;
		border-block-end: 0;
		padding-block-end: calc(1rem + env(safe-area-inset-bottom));
	}
}

.rinkukado__dialog:not([hidden]) {
	animation: rinkukado-appear 120ms ease-out;
}

@keyframes rinkukado-appear {
	from {
		opacity: 0;
		transform: translateY(0.25rem);
	}

	to {
		opacity: 1;
		transform: none;
	}
}

@media (prefers-reduced-motion: reduce) {
	.rinkukado__dialog:not([hidden]) {
		animation: none;
	}
}

@media (prefers-color-scheme: dark) {
	.rinkukado {
		--rinkukado-background: #1e1e1e;
		--rinkukado-text: #f0f0f0;
		--rinkukado-muted: #c3c4c7;
		--rinkukado-border: #3c434a;
		--rinkukado-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
	}
}
```

- [ ] **Step 2: Run the style linter and the build**

```bash
pnpm lint:styles
pnpm build
```

Expected: both pass. The template uses `stylelint-plugin-logical-css`, so a physical property in a place that needs a logical one fails the linter. Fix any report before the commit.

- [ ] **Step 3: Commit**

```bash
git add sources/client/preview/style.scss
git commit -m "feat(client): add the style of the popover"
```

---

## Task 14: The end to end tests

**Files:**
- Create: `tests/e2e/mu-plugins/rinkukado-fixtures.php`
- Create: `tests/e2e/specs/desktop.spec.ts`
- Create: `tests/e2e/specs/sheet.spec.ts`
- Create: `tests/e2e/specs/keyboard.spec.ts`

**Interfaces:**
- Consumes: everything of the tasks before.
- Produces: the fixture page at `/?rinkukado-fixtures=1`, which holds the links that every specification uses.

- [ ] **Step 1: Write the fixture plugin**

`.wp-env.json` already maps `tests/e2e/mu-plugins` to `wp-content/mu-plugins`, so the file loads on every request of the test site.

```php
<?php

declare(strict_types=1);

/**
 * Plugin Name: Rinkukado fixtures
 * Description: The content that the browser tests need.
 */

add_action('init', static function (): void {
    if (get_page_by_path('rinkukado-links', OBJECT, 'page') !== null) {
        return;
    }

    $withThumbnail = wp_insert_post([
        'post_type' => 'post',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-with-thumbnail',
        'post_title' => 'A post with a thumbnail',
        'post_excerpt' => 'The excerpt of the post that holds a thumbnail.',
    ]);

    $withoutThumbnail = wp_insert_post([
        'post_type' => 'post',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-without-thumbnail',
        'post_title' => 'A post without a thumbnail',
        'post_excerpt' => 'The excerpt of the post that holds no thumbnail.',
    ]);

    $draft = wp_insert_post([
        'post_type' => 'post',
        'post_status' => 'draft',
        'post_name' => 'rinkukado-draft',
        'post_title' => 'A draft',
    ]);

    $attachment = wp_insert_attachment([
        'post_mime_type' => 'image/png',
        'post_title' => 'The thumbnail',
        'post_status' => 'inherit',
    ], __DIR__ . '/thumbnail.png');

    wp_update_attachment_metadata($attachment, [
        'width' => 320,
        'height' => 240,
        'file' => 'thumbnail.png',
        'sizes' => [],
    ]);

    set_post_thumbnail($withThumbnail, $attachment);

    $category = wp_insert_term('Rinkukado news', 'category');
    $categoryLink = is_array($category)
        ? get_category_link((int) $category['term_id'])
        : '';

    $content = sprintf(
        '<p>'
        . '<a id="link-thumb" href="%1$s">With thumbnail</a> '
        . '<a id="link-plain" href="%2$s">Without thumbnail</a> '
        . '<a id="link-draft" href="%3$s">Draft</a> '
        . '<a id="link-category" href="%4$s">Category</a> '
        . '<a id="link-external" href="https://example.org/">External</a> '
        . '<a id="link-denied" class="no-rinkukado" href="%2$s">Denied</a>'
        . '</p>'
        . '<div style="block-size: 200vh"></div>'
        . '<p><a id="link-bottom" href="%2$s">Near the bottom</a></p>',
        get_permalink($withThumbnail),
        get_permalink($withoutThumbnail),
        get_permalink($draft),
        $categoryLink
    );

    wp_insert_post([
        'post_type' => 'page',
        'post_status' => 'publish',
        'post_name' => 'rinkukado-links',
        'post_title' => 'Rinkukado links',
        'post_content' => $content,
    ]);
});
```

Put a small PNG at `tests/e2e/mu-plugins/thumbnail.png`. Any image of 320 by 240 pixels works.

- [ ] **Step 2: Write the desktop specification**

```ts
// tests/e2e/specs/desktop.spec.ts
import { expect, test } from '@wordpress/e2e-test-utils-playwright';

const page404 = /rinkukado\/v1\/preview/;

test.describe( 'the popover on a desktop', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );

	test( 'shows the title, the excerpt and the thumbnail', async ( { page } ) => {
		await page.hover( '#link-thumb' );

		const dialog = page.getByRole( 'dialog' );

		await expect( dialog ).toBeVisible();
		await expect( dialog ).toContainText( 'A post with a thumbnail' );
		await expect( dialog ).toContainText( 'The excerpt of the post' );
		await expect( dialog.locator( '.rinkukado__media' ) ).toBeVisible();
	} );

	test( 'uses one column when the post holds no thumbnail', async ( { page } ) => {
		await page.hover( '#link-plain' );

		const dialog = page.getByRole( 'dialog' );

		await expect( dialog ).toBeVisible();
		await expect( dialog ).not.toHaveClass( /rinkukado--with-media/ );
	} );

	test( 'stays inside the viewport near the bottom of the page', async ( {
		page,
	} ) => {
		await page.locator( '#link-bottom' ).scrollIntoViewIfNeeded();
		await page.hover( '#link-bottom' );

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const box = await dialog.boundingBox();
		const height = page.viewportSize()?.height ?? 0;

		expect( box ).not.toBeNull();
		expect( box!.y ).toBeGreaterThanOrEqual( 0 );
		expect( box!.y + box!.height ).toBeLessThanOrEqual( height );
	} );

	test( 'closes when the pointer leaves', async ( { page } ) => {
		await page.hover( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.mouse.move( 0, 0 );

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );

	test( 'closes on escape', async ( { page } ) => {
		await page.hover( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.keyboard.press( 'Escape' );

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );

	test( 'goes to the article on a click of the title', async ( { page } ) => {
		await page.hover( '#link-plain' );
		await page.getByRole( 'dialog' ).locator( '.rinkukado__title' ).click();

		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
	} );

	test( 'shows nothing for a category, a draft or the deny class', async ( {
		page,
	} ) => {
		for ( const selector of [ '#link-category', '#link-draft', '#link-denied' ] ) {
			await page.hover( selector );
			await page.waitForTimeout( 600 );

			await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		}
	} );

	test( 'asks nothing for an external link', async ( { page } ) => {
		const requests: string[] = [];

		page.on( 'request', ( request ) => {
			if ( page404.test( request.url() ) ) {
				requests.push( request.url() );
			}
		} );

		await page.hover( '#link-external' );
		await page.waitForTimeout( 600 );

		expect( requests ).toHaveLength( 0 );
	} );

	test( 'asks once for the same link', async ( { page } ) => {
		const requests: string[] = [];

		page.on( 'request', ( request ) => {
			if ( page404.test( request.url() ) ) {
				requests.push( request.url() );
			}
		} );

		await page.hover( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await page.mouse.move( 0, 0 );
		await page.hover( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		expect( requests ).toHaveLength( 1 );
	} );
} );
```

- [ ] **Step 3: Write the sheet specification**

```ts
// tests/e2e/specs/sheet.spec.ts
import { devices, expect, test } from '@wordpress/e2e-test-utils-playwright';

test.use( { ...devices[ 'iPad (gen 7)' ] } );

test.describe( 'the sheet on a touch device', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );

	test( 'opens at the bottom on the first tap', async ( { page } ) => {
		await page.tap( '#link-plain' );

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const box = await dialog.boundingBox();
		const height = page.viewportSize()?.height ?? 0;

		expect( box ).not.toBeNull();
		expect( box!.y + box!.height ).toBeCloseTo( height, 0 );
		await expect( page ).toHaveURL( /rinkukado-links/ );
	} );

	test( 'lets the page scroll while the sheet is open', async ( { page } ) => {
		await page.tap( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.mouse.wheel( 0, 400 );

		expect( await page.evaluate( () => window.scrollY ) ).toBeGreaterThan( 0 );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
	} );

	test( 'navigates on the second tap', async ( { page } ) => {
		await page.tap( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.tap( '#link-plain' );

		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
	} );

	test( 'closes on the close button', async ( { page } ) => {
		await page.tap( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.getByRole( 'dialog' ).getByRole( 'button' ).tap();

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		await expect( page ).toHaveURL( /rinkukado-links/ );
	} );
} );
```

- [ ] **Step 4: Write the keyboard specification**

```ts
// tests/e2e/specs/keyboard.spec.ts
import { expect, test } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'the keyboard path', () => {
	test( 'opens on focus, enters the dialog and returns on escape', async ( {
		page,
	} ) => {
		await page.goto( '/rinkukado-links/' );

		await page.locator( '#link-plain' ).focus();

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		await expect( page.locator( '#link-plain' ) ).toHaveAttribute(
			'aria-describedby',
			'rinkukado-title'
		);

		await page.keyboard.press( 'Tab' );
		await expect( dialog.getByRole( 'button' ) ).toBeFocused();

		await page.keyboard.press( 'Escape' );
		await expect( dialog ).toBeHidden();
		await expect( page.locator( '#link-plain' ) ).toBeFocused();
	} );
} );
```

- [ ] **Step 5: Run the browser tests**

```bash
pnpm build
pnpm wp-env start
pnpm test:e2e
```

Expected: every specification passes. If a hover test fails because the payload arrives late, wait for the response with `page.waitForResponse( /rinkukado\/v1\/preview/ )` instead of a fixed timeout.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e
git commit -m "test(e2e): add the browser tests of the popover"
```

---

## Task 15: The documentation and the final gate

**Files:**
- Modify: `README.md`
- Modify: `docs/testing.md`

**Interfaces:**
- Consumes: everything.
- Produces: the documentation of the filters and of the endpoint.

- [ ] **Step 1: Write the README**

Replace the body of `README.md` with a description of the plugin, and add these sections.

````markdown
## What it does

A visitor points at a link to a post of this site. A popover shows the title,
the excerpt and the thumbnail of that post. On a touch device the first tap
opens a sheet at the bottom of the screen, and the second tap of the same link
opens the article.

## Requirements

- WordPress 7.1 or later
- PHP 8.4 or later

## Filters

| Filter | Default | Purpose |
| --- | --- | --- |
| `rinkukado.popover.root-selector` | `main` | The element that holds the links. |
| `rinkukado.popover.deny-class` | `no-rinkukado` | A link with this class shows no preview. |
| `rinkukado.popover.timings` | `['prefetch' => 80, 'open' => 300, 'close' => 200]` | The delays in milliseconds. |
| `rinkukado.rest.post-types` | every public type | The types that the endpoint accepts. |
| `rinkukado.rest.excerpt-length` | `30` | The word count of the fallback excerpt. |
| `rinkukado.rest.payload` | the payload | The last change before the response. |

```php
add_filter('rinkukado.popover.root-selector', static fn (): string => '.site-content');
```

## The endpoint

`GET /wp-json/rinkukado/v1/preview?url=<absolute-url>`

It answers `200` with the payload of the preview, or `404` with the code
`not_found` for every link that shows no preview.
````

- [ ] **Step 2: Update the testing guide**

In `docs/testing.md`, replace every snippet that names the example block with a snippet of this plugin: `ConfigTest` for the PHP unit layer, `PreviewEndpointTest` for the PHP integration layer, `policy.test.ts` for the client unit layer, and `desktop.spec.ts` for the browser layer. Remove the section about the block of the template.

- [ ] **Step 3: Run every gate**

```bash
composer qa
pnpm lint:types
pnpm lint:scripts
pnpm lint:styles
pnpm test:unit
pnpm build
pnpm test:e2e
```

Expected: every command passes.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/testing.md
git commit -m "docs(docs): document the filters and the endpoint"
```

- [ ] **Step 5: Push the branch**

```bash
git push origin HEAD
```

---

## Coverage of the specification

| Specification section | Task |
| --- | --- |
| 2 Decisions | every task |
| 3 Project structure | 1, 3, 4, 8 |
| 4.1 Config | 2 |
| 4.2 Popover module | 3 |
| 4.3 Rest module | 4, 5, 8 |
| 4.4 Endpoint contract | 6, 7, 8 |
| 5.1 The store | 12 |
| 5.2 policy.ts | 9 |
| 5.3 intent.ts | 10 |
| 5.4 position.ts | 11 |
| 5.5 Failure rules | 12 |
| 6 Markup and layout | 3, 13 |
| 6.2 Breakpoints | 13 |
| 6.3 Modes | 12, 13 |
| 6.4 Keyboard | 12, 14 |
| 6.5 Motion and color | 13 |
| 7.1 PHP unit | 2, 4, 5, 6, 7, 8 |
| 7.2 PHP integration | 3, 8 |
| 7.3 TypeScript unit | 9, 10, 11, 12 |
| 7.4 End to end | 14 |
| 7.5 Quality gates | 15 |
| 9.2 The module entry | 1 |
| 4.1 The filter of the payload | 8 |
