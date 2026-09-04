# Testing

This project has four test layers. Each layer has its own runner, its own
directory and its own naming rule.

| Layer | Runner | Files | Sees | Command |
| --- | --- | --- | --- | --- |
| PHP unit | Pest, Brain Monkey | `tests/unit/server/*Test.php` | no WordPress bootstrap | `composer test:unit` |
| PHP integration | Pest, real WordPress | `tests/integration/server/*Test.php` | a full WordPress with this plugin active | `composer test:integration` |
| Client unit | Jest, through `wp-scripts` | `tests/unit/client/*.test.ts` | no browser, no WordPress | `pnpm test:unit` |
| End to end | Playwright, `wp-env` | `tests/e2e/specs/*.spec.ts` | a real browser on a real WordPress | `pnpm test:e2e` |

The suffix decides the runner on the client side. Jest collects `*.test.ts`
and ignores `*.spec.ts`. Playwright collects only `tests/e2e/specs`. The two
never pick up the same file.

## Which layer

Ask what the test must see:

- Only PHP logic, and you can replace every WordPress function with an
  expectation → **PHP unit**.
- The result of the WordPress lifecycle: a registered block, a filtered value,
  a stored option → **PHP integration**.
- A pure TypeScript function, a value object, a reducer → **client unit**.
- What the user sees or clicks in the browser → **end to end**.

Prefer the cheapest layer that can fail for the right reason. Do not write an
end to end test for logic that a unit test can cover.

## PHP unit tests

Brain Monkey replaces WordPress. The suite loads no WordPress bootstrap, so
every WordPress function that the code calls must have an expectation. This
layer is fast and it isolates one class.

`tests/Pest.php` starts and stops Brain Monkey for you. It also loads three
real WordPress class files: `WP_Error`, `WP_HTTP_Response` and
`WP_REST_Response`. Each file only declares a class, so it runs no code at
load time. A test can then build a real response object, for example
`new WP_REST_Response(...)`.

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
```

Rules:

- Namespace: `SpaghettiDojo\Rinkukado\Tests\Unit`.
- Mirror the structure of `sources/server/` under `tests/unit/server/`.
- Assert the call, because there is no WordPress to produce a result.
- Use `Functions\when()` for a function that only needs a return value. Use
  `Functions\expect()` when the call itself is the behaviour.

## PHP integration tests

`tests/bootstrap-integration.php` runs once before the suite. It installs
WordPress into `vendor/wordpress/wordpress`, puts it on SQLite, creates
`wp-config.php`, symlinks this plugin into WordPress, activates it, loads
WordPress, and removes everything at the end.

Two consequences:

1. WordPress is already loaded and `init` already fired. The modules of the
   plugin already ran. Assert the **result**, never the registration call.
2. Never fire `do_action('init')` again. A second run registers everything
   twice.

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

it('returns the payload of a published post', function (): void {
    $postId = wp_insert_post([
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

    wp_delete_post($postId, true);
});
```

Rules:

- Namespace: `SpaghettiDojo\Rinkukado\Tests\Integration`.
- There is no base class. Write plain Pest tests.
- Build the client first when the test reads the build directory. Skip the
  test when the directory is absent.
- Create the state with the WordPress API: `wp_insert_post()`,
  `wp_insert_user()`, `wp_set_current_user()`, `update_option()`.
- Delete what you create. The database survives between the tests of one run.

Run the suite against another WordPress version:

```bash
WP_CORE_VERSION=6.8 composer test:integration
```

Known limit: the harness runs WP-CLI, and it treats any output on `stderr` as
a fatal error. On PHP 8.5 the bundled WP-CLI prints a deprecation, so the
bootstrap fails. Use PHP 8.4, the version of the CI and of `wp-env`.

## Client unit tests

`wp-scripts test-unit-js` runs Jest. It compiles TypeScript with no extra
configuration.

```ts
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

	it( 'rejects another origin', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://other.test/post/' } ),
				options
			)
		).toBe( false );
	} );
} );
```

The path has three levels, because the file sits in
`tests/unit/client/<name>.test.ts`.

Rules:

- The file name must end with `.test.ts`.
- Test pure functions, value objects and pure state changes.
- Do not test the Interactivity API store here. The store needs the runtime of
  WordPress and the DOM. Move the logic into a pure function, test the
  function here, and cover the wiring with an end to end test.
- `tests/unit/client/tsconfig.json` exists so that ESLint can type the test
  files. `pnpm lint:types` checks `sources` only, so a type error in a test
  file appears through `pnpm lint:scripts`.

## End to end tests

Playwright drives a real browser against the WordPress of `wp-env`. Docker
must run. `pnpm test:e2e` starts `wp-env` on its own, on
`http://localhost:8877`.

```ts
import { expect, test } from '@wordpress/e2e-test-utils-playwright';

async function hoverAndWaitForPreview(
	page: any,
	selector: string
): Promise< void > {
	const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
	await page.hover( selector );
	await response;
}

test.describe( 'the popover on a desktop', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );
	test( 'shows the title, the excerpt and the thumbnail', async ( {
		page,
	} ) => {
		await hoverAndWaitForPreview( page, '#link-thumb' );
		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();
		await expect( dialog ).toContainText( 'A post with a thumbnail' );
	} );
} );
```

Run `pnpm build` first. Playwright tests the build output, not the sources.

`tests/e2e/mu-plugins/rinkukado-fixtures.php` sets the permalink structure of
the test site on its own, on the first request after the install. It also
creates the posts and the links that the specs need. No manual setup step
runs before the suite.

### Artifacts

A failed test writes a trace, a screenshot and a video into `artifacts/`. The
`e2e` workflow uploads that directory when the job fails.

## What the CI runs

| Workflow | Tests |
| --- | --- |
| `qa.yml` | `composer cs`, `composer analysis`, PHP unit and PHP integration. It builds the client first. |
| `lint.yml` | ESLint, Stylelint, `tsc --noEmit`, client unit tests. |
| `e2e.yml` | Playwright, after `pnpm build` and `wp-env start`. |
