# REST Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project rule (`.claude/CLAUDE.md`):** stop after each task and ask the user for confirmation before you start the next task.

**Goal:** Make `sources/server/Rest/` a library that does not use the plugin, and move the preview endpoint to a new `Preview` module in `sources/server/Preview/Rest/`.

**Architecture:** The four preview classes move to the namespace `SpaghettiDojo\Rinkukado\Preview\Rest` and lose the `Preview` prefix. A new `Preview\Module` publishes `Config` and the preview services, and it registers the route. `Rest\Module` keeps only the services of the library. An architecture test of Pest fails when the library uses the plugin.

**Tech Stack:** PHP 8.4, Inpsyde Modularity, Pest 4 with `pest-plugin-arch`, Brain Monkey, PHPStan, `syde/phpcs`.

**Spec:** `docs/superpowers/specs/2026-10-11-rest-library-design.md`

## Global Constraints

- The change is a refactor. The endpoint, its payload, its errors, its cache headers and its filters stay the same.
- The library stays in `sources/server/Rest/` with the namespace `SpaghettiDojo\Rinkukado\Rest`.
- No class of the library changes its code. Only `Rest/Module.php` and the doc comment of `Rest/Middlewares/Caching.php` change.
- `ErrorCatch` keeps the `rinkukado` text domain. `Rest\Module::new()` keeps its signature with no argument.
- The filter names `rinkukado.rest.*` stay.
- No test changes its assertions.
- `composer.json` has `optimize-autoloader: true`. Run `composer dump-autoload` after each move of a PHP file.
- Keep the documents in sync with the code, in the same commit.
- Commit messages follow `.claude/skills/github-commit/SKILL.md`: title of at most 50 characters, type, optional scope, imperative, lower case. End each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Prose in comments and documents follows Simplified Technical English.

## Review Focus

- **A stale Composer classmap.** After a move, the old classmap still points to the old paths, and the tests fail with "class not found". Task 1 and Task 2 each run `composer dump-autoload` before the tests.
- **The route is registered one time.** If `Rest\Module` and `Preview\Module` both register it, WordPress merges the handlers without an error. `PreviewEndpointTest` proves that the route exists and answers. Step 4 of Task 2 removes `run()` from `Rest\Module`, and the grep of Step 8 proves that `register_rest_route` has one caller path.
- **The `Config` service has one owner.** Modularity does not let two modules publish the same service id. Step 4 of Task 2 removes `Config` from `Rest\Module` in the same step that `Preview\Module` adds it.
- **The service ids change.** `Rest\Preview\PreviewController::class` and `Rest\Preview\PreviewRepository::class` no longer exist in the container. Code of a third party that reads them from `package()` breaks. The spec accepts this, and the plan adds no alias. No test pins it.
- **The short names `Controller` and `Schema` exist two times.** A wrong import makes a preview class implement itself. PHPStan and the unit tests of Task 1 catch it.

---

## File Structure

| File | State | Responsibility |
| --- | --- | --- |
| `sources/server/Preview/Rest/Controller.php` | Moved from `Rest/Preview/PreviewController.php` | Turns the URL of a link into the payload. |
| `sources/server/Preview/Rest/Repository.php` | Moved from `Rest/Preview/PreviewRepository.php` | Builds and caches the payload. |
| `sources/server/Preview/Rest/Schema.php` | Moved from `Rest/Preview/PreviewSchema.php` | The request schema. |
| `sources/server/Preview/Rest/Excerpt.php` | Moved from `Rest/Preview/Excerpt.php` | The fallback excerpt. |
| `sources/server/Preview/Module.php` | New | Publishes the preview services and registers the route. |
| `sources/server/Rest/Module.php` | Changed | Publishes the services of the library only. |
| `sources/server/Rest/Middlewares/Caching.php` | Changed (comment) | No code change. |
| `rinkukado.php` | Changed | Adds `Preview\Module`. |
| `tests/unit/server/Preview/Rest/{Controller,Repository,Excerpt}Test.php` | Moved | Same tests, new names. |
| `tests/unit/server/Rest/ArchTest.php` | New | The guard of the library. |
| `docs/modules/server/preview.md` | New (from `rest.md`) | The endpoint. |
| `docs/modules/server/rest.md` | Rewritten | The library. |
| `README.md`, `docs/development.md`, `docs/customize.md`, `.claude/CLAUDE.md`, `.claude/rules/module.instructions.md` | Changed | Links and lists. |

---

### Task 1: Move and rename the preview classes

The task is a pure move. `Rest\Module` still owns the services and the route
at the end of it, and it points to the new names.

**Files:**
- Move: `sources/server/Rest/Preview/*.php` → `sources/server/Preview/Rest/`
- Move: `tests/unit/server/Preview/*.php` → `tests/unit/server/Preview/Rest/`
- Modify: `sources/server/Rest/Module.php`

**Interfaces:**
- Consumes: nothing.
- Produces, all in the namespace `SpaghettiDojo\Rinkukado\Preview\Rest`:
  - `Controller::new(Config $config, Repository $repository, \SpaghettiDojo\Rinkukado\Rest\ErrorFactory $errorFactory): self`
  - `Repository::new(Excerpt $excerpt, int $excerptLength): self`, with `init(): void` and `forPost(\WP_Post $post): array`
  - `Schema::new(): self`
  - `Excerpt::new(int $length): self`

- [ ] **Step 1: Run the tests and record the baseline**

Run: `composer test:unit`
Expected: PASS. Write down the count of tests. The count must be the same at the end of this task.

- [ ] **Step 2: Move the files**

```bash
mkdir -p sources/server/Preview/Rest tests/unit/server/Preview/Rest

git mv sources/server/Rest/Preview/Excerpt.php           sources/server/Preview/Rest/Excerpt.php
git mv sources/server/Rest/Preview/PreviewController.php sources/server/Preview/Rest/Controller.php
git mv sources/server/Rest/Preview/PreviewRepository.php sources/server/Preview/Rest/Repository.php
git mv sources/server/Rest/Preview/PreviewSchema.php     sources/server/Preview/Rest/Schema.php

git mv tests/unit/server/Preview/ExcerptTest.php           tests/unit/server/Preview/Rest/ExcerptTest.php
git mv tests/unit/server/Preview/PreviewControllerTest.php tests/unit/server/Preview/Rest/ControllerTest.php
git mv tests/unit/server/Preview/PreviewRepositoryTest.php tests/unit/server/Preview/Rest/RepositoryTest.php
```

- [ ] **Step 3: Change the namespaces and the class names**

```bash
perl -pi -e '
  s/Rinkukado\\Rest\\Preview\b/Rinkukado\\Preview\\Rest/g;
  s/Tests\\Unit\\Preview;/Tests\\Unit\\Preview\\Rest;/;
  s/\bPreview(Controller|Repository|Schema)\b/$1/g;
' sources/server/Preview/Rest/*.php tests/unit/server/Preview/Rest/*.php
```

The heads of the three renamed classes must now read:

```php
// sources/server/Preview/Rest/Controller.php
namespace SpaghettiDojo\Rinkukado\Preview\Rest;

use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Rest;

final readonly class Controller implements Rest\Controller
```

```php
// sources/server/Preview/Rest/Schema.php
namespace SpaghettiDojo\Rinkukado\Preview\Rest;

use SpaghettiDojo\Rinkukado\Rest;

final readonly class Schema implements Rest\Schema
```

```php
// sources/server/Preview/Rest/Repository.php
namespace SpaghettiDojo\Rinkukado\Preview\Rest;

final readonly class Repository
```

Do not import `SpaghettiDojo\Rinkukado\Rest\Controller` or
`SpaghettiDojo\Rinkukado\Rest\Schema` directly in these files. The short name
collides with the class of the file. Keep the import of the `Rest` namespace.

- [ ] **Step 4: Put the imports of `ControllerTest.php` in order**

Replace the `use` block of `tests/unit/server/Preview/Rest/ControllerTest.php` with:

```php
namespace SpaghettiDojo\Rinkukado\Tests\Unit\Preview\Rest;

use Brain\Monkey\Functions;
use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Preview\Rest\Controller;
use SpaghettiDojo\Rinkukado\Preview\Rest\Excerpt;
use SpaghettiDojo\Rinkukado\Preview\Rest\Repository;
use SpaghettiDojo\Rinkukado\Rest;
```

- [ ] **Step 5: Point `Rest\Module` to the new names**

In `sources/server/Rest/Module.php`, add the import after the import of `Config`:

```php
use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Preview;
```

Then change the names:

```bash
perl -pi -e '
  s/Preview\\Preview(Repository|Controller|Schema)/Preview\\Rest\\$1/g;
  s/Preview\\Excerpt/Preview\\Rest\\Excerpt/g;
' sources/server/Rest/Module.php
```

The module now uses `Preview\Rest\Repository`, `Preview\Rest\Controller`,
`Preview\Rest\Schema` and `Preview\Rest\Excerpt`.

- [ ] **Step 6: Make sure no old name stays**

Run:

```bash
grep -rnE 'Rest\\Preview|Preview(Controller|Repository|Schema)\b' sources tests
ls sources/server/Rest/Preview tests/unit/server/Preview
```

Expected: the `grep` prints nothing. `sources/server/Rest/Preview` does not exist. `tests/unit/server/Preview` holds only the `Rest` directory.

- [ ] **Step 7: Rebuild the autoloader and run the checks**

Run: `composer dump-autoload && composer qa`
Expected: PASS for `phpcs`, PHPStan, the unit suite and the integration suite. The count of unit tests is the same as in Step 1.

If `phpcs` reports the order of the imports, run `composer cs:fix` and run `composer qa` again.

- [ ] **Step 8: Commit**

```bash
git add -A sources/server tests/unit/server
git commit -m "refactor(server): move the preview REST classes

Move the four classes to Preview\Rest and drop the Preview prefix,
because the namespace already names the preview. Rest\Module still
owns the services and the route.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**Stop. Ask the user for confirmation before Task 2.**

---

### Task 2: Add the Preview module and free the library

**Files:**
- Create: `tests/unit/server/Rest/ArchTest.php`
- Create: `sources/server/Preview/Module.php`
- Create: `docs/modules/server/preview.md` (from `docs/modules/server/rest.md`)
- Modify: `sources/server/Rest/Module.php` (full replace)
- Modify: `sources/server/Rest/Middlewares/Caching.php` (doc comment)
- Modify: `rinkukado.php`
- Modify: `docs/modules/server/rest.md` (full replace)
- Modify: `README.md`, `docs/development.md`, `docs/customize.md`, `.claude/CLAUDE.md`, `.claude/rules/module.instructions.md`

**Interfaces:**
- Consumes: the four classes of Task 1 in `SpaghettiDojo\Rinkukado\Preview\Rest`.
- Produces:
  - `SpaghettiDojo\Rinkukado\Preview\Module::new(): self`, a `ServiceModule` and an `ExecutableModule`. Service ids: `Config::class`, `Preview\Rest\Repository::class`, `Preview\Rest\Controller::class`.
  - `SpaghettiDojo\Rinkukado\Rest\Module::new(): self`, a `ServiceModule` only. Service ids: `Rest\ErrorFactory::class`, `Rest\Middlewares\ErrorCatch::class`, `Rest\Middlewares\Caching::class`.

- [ ] **Step 1: Write the failing architecture test**

Create `tests/unit/server/Rest/ArchTest.php`:

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Tests\Unit\Rest;

arch('the REST library does not use the plugin')
    ->expect('SpaghettiDojo\Rinkukado\Rest')
    ->not->toUse([
        'SpaghettiDojo\Rinkukado\Config',
        'SpaghettiDojo\Rinkukado\Preview',
        'SpaghettiDojo\Rinkukado\Popover',
    ]);
```

- [ ] **Step 2: Run the test to make sure that it fails**

Run: `./vendor/bin/pest --testsuite=unit --filter="REST library"`
Expected: FAIL. The message names `SpaghettiDojo\Rinkukado\Rest\Module` and its use of `Config` or of `Preview`.

- [ ] **Step 3: Create `Preview\Module`**

Create `sources/server/Preview/Module.php`:

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Preview;

use Inpsyde\Modularity\Module\ExecutableModule;
use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Inpsyde\Modularity\Module\ServiceModule;
use Psr\Container\ContainerInterface;
use SpaghettiDojo\Rinkukado\Config;
use SpaghettiDojo\Rinkukado\Rest\ErrorFactory;
use SpaghettiDojo\Rinkukado\Rest\Middlewares\Caching;
use SpaghettiDojo\Rinkukado\Rest\Middlewares\ErrorCatch;
use SpaghettiDojo\Rinkukado\Rest\Route;

/**
 * Publishes the services of the preview and registers the preview route.
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

            Rest\Repository::class => static function (
                ContainerInterface $container
            ): Rest\Repository {
                $config = $container->get(Config::class);

                return Rest\Repository::new(
                    Rest\Excerpt::new($config->excerptLength()),
                    $config->excerptLength()
                );
            },

            Rest\Controller::class => static fn (
                ContainerInterface $container
            ): Rest\Controller => Rest\Controller::new(
                $container->get(Config::class),
                $container->get(Rest\Repository::class),
                $container->get(ErrorFactory::class)
            ),
        ];
    }

    public function run(ContainerInterface $container): bool
    {
        $container->get(Rest\Repository::class)->init();

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

        return true;
    }
}
```

In this file, `Rest\…` is `SpaghettiDojo\Rinkukado\Preview\Rest\…`, because
the file has no import of the `Rest` namespace. The classes of the library
come in through their own imports.

- [ ] **Step 4: Replace `Rest\Module`**

Replace the full content of `sources/server/Rest/Module.php` with:

```php
<?php

declare(strict_types=1);

namespace SpaghettiDojo\Rinkukado\Rest;

use Inpsyde\Modularity\Module\ModuleClassNameIdTrait;
use Inpsyde\Modularity\Module\ServiceModule;
use Psr\Container\ContainerInterface;

/**
 * Publishes the services of the REST library.
 */
final class Module implements ServiceModule
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
            ErrorFactory::class => static fn (): ErrorFactory => ErrorFactory::new(),

            Middlewares\ErrorCatch::class => static fn (
                ContainerInterface $container
            ): Middlewares\ErrorCatch => Middlewares\ErrorCatch::new(
                $container->get(ErrorFactory::class)
            ),

            Middlewares\Caching::class
                => static fn (): Middlewares\Caching => Middlewares\Caching::new(),
        ];
    }
}
```

- [ ] **Step 5: Add the module to the bootstrap**

In `rinkukado.php`, change the `plugins_loaded` callback to:

```php
        package()
            ->addModule(Rest\Module::new())
            ->addModule(Preview\Module::new())
            ->addModule(Popover\Module::new())
            ->boot();
```

- [ ] **Step 6: Change the doc comment of `Caching`**

In `sources/server/Rest/Middlewares/Caching.php`, replace:

```php
/**
 * Lets a shared cache keep the preview of an anonymous visitor.
 */
```

with:

```php
/**
 * Lets a shared cache keep the response of an anonymous visitor.
 */
```

- [ ] **Step 7: Run the unit tests**

Run: `composer dump-autoload && composer test:unit`
Expected: PASS. The architecture test passes. The count is the baseline of Task 1 plus one.

- [ ] **Step 8: Make sure the library is free**

Run:

```bash
grep -rnE 'Config|Preview|Popover' sources/server/Rest
grep -rn 'register_rest_route\|->register()' sources/server
```

Expected: the first `grep` prints nothing. The second `grep` prints two lines: `register_rest_route` in `Rest/RestRegistTrait.php`, and `->register()` in `Preview/Module.php`.

- [ ] **Step 9: Create the document of the Preview module**

```bash
git mv docs/modules/server/rest.md docs/modules/server/preview.md
```

In `docs/modules/server/preview.md`, replace the title and the first paragraph:

```markdown
# REST

The client gets the content of each preview from one endpoint. The code
lives in `sources/server/Rest/`.
```

with:

```markdown
# Preview

The client gets the content of each preview from one endpoint. The code
lives in `sources/server/Preview/`. The route, the schema contract and the
middlewares come from the [REST](rest.md) library.

## Classes

| Class | Role |
| --- | --- |
| `Module` | Publishes `Config`, `Rest\Repository` and `Rest\Controller`. Registers the route. |
| `Rest\Schema` | The schema of the request. WordPress validates the request with it. |
| `Rest\Controller` | Finds the post of the URL and answers with the payload. |
| `Rest\Repository` | Builds the payload and keeps it in the object cache. |
| `Rest\Excerpt` | Makes the fallback excerpt from the content. |
```

In the same file, replace the sentence of the `Cache` section:

```markdown
The client also caches each settled result for the page session. See
[Preview](../client/preview.md).
```

with:

```markdown
The `Caching` middleware of the [REST](rest.md) library sets the header.

The client also caches each settled result for the page session. See
[Preview](../client/preview.md).
```

Do not change the other sections.

- [ ] **Step 10: Write the document of the library**

Create `docs/modules/server/rest.md`:

````markdown
# REST

The REST library registers a route from a schema, a controller and a list of
middlewares. The code lives in `sources/server/Rest/`.

## Rule

The library does not use the plugin. It uses no class of another module and
no filter of the plugin. `tests/unit/server/Rest/ArchTest.php` fails when a
class of the library uses `Config`, `Preview` or `Popover`.

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
````

- [ ] **Step 11: Update the links and the lists**

`README.md`, in the table of `## Documentation`, replace the REST row:

```markdown
| [REST](docs/modules/server/rest.md) | The preview endpoint, its payload, its errors, its cache and its filters. |
```

with:

```markdown
| [Preview (server)](docs/modules/server/preview.md) | The preview endpoint, its payload, its errors, its cache and its filters. |
| [REST](docs/modules/server/rest.md) | The library for routes, schemas, controllers and middlewares. |
```

`docs/development.md`, in the layout block, replace:

```
sources/server/Rest/       The preview endpoint and its middlewares.
```

with:

```
sources/server/Preview/    The preview endpoint.
sources/server/Rest/       The library for routes and middlewares.
```

`docs/development.md`, in the list of module documents, replace:

```markdown
- [REST](modules/server/rest.md)
```

with:

```markdown
- [Preview (server)](modules/server/preview.md)
- [REST](modules/server/rest.md)
```

`docs/customize.md`, replace:

```markdown
- [REST](modules/server/rest.md) for `rinkukado.rest.*`.
```

with:

```markdown
- [Preview](modules/server/preview.md) for `rinkukado.rest.*`.
```

`.claude/CLAUDE.md`, in `## Module Documents`, replace:

```markdown
- `sources/server/Rest/` → `docs/modules/server/rest.md`
```

with:

```markdown
- `sources/server/Preview/` → `docs/modules/server/preview.md`
- `sources/server/Rest/` → `docs/modules/server/rest.md`
```

`.claude/rules/module.instructions.md`, replace:

```markdown
`Rest/Module.php` is the existing example: it implements both `ServiceModule` and `ExecutableModule`.
```

with:

```markdown
`Preview/Module.php` is the existing example: it implements both `ServiceModule` and `ExecutableModule`. `Rest/Module.php` implements only `ServiceModule`.
```

Then make sure no stale link stays:

```bash
grep -rn 'rest\.md' README.md docs/*.md docs/modules .claude/CLAUDE.md
```

Expected: each line that the `grep` prints names the library, not the endpoint.

- [ ] **Step 12: Run all the checks**

Run: `composer qa`
Expected: PASS for `phpcs`, PHPStan, the unit suite and the integration suite. `tests/integration/server/PreviewEndpointTest.php` passes with no change.

Run: `pnpm test:e2e`
Expected: PASS with no change of a spec. If the local environment does not run, report it to the user and do not mark this step as done.

- [ ] **Step 13: Commit**

```bash
git add -A sources rinkukado.php tests/unit/server/Rest/ArchTest.php docs README.md .claude/CLAUDE.md .claude/rules/module.instructions.md
git commit -m "refactor(server): add the Preview module

Move the preview services and the route from Rest\Module to the new
Preview\Module. The REST library now uses no class of the plugin,
and an architecture test guards that rule.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**Stop. Report the result to the user.**
