# Interactivity Server Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project rule (`.claude/CLAUDE.md`):** stop after each task and ask the user for confirmation before you start the next task.

**Goal:** Validate the config and the state that the server gives to the `rinkukado` store with Zod schemas, one time in `init`, and add a project-independent skill for this pattern.

**Architecture:** A shared module in `sources/client/interactivity/` re-exports `zod/mini` with the English locale and holds the helpers `sanitize`, `initializeServerConfig`, `initializeServerState` and `initializeServerContext`. The preview store gets `schemas.ts`, takes its types from the schemas, and validates config and state at the start of the first `init`. If a parse fails, `init` throws and binds nothing.

**Tech Stack:** TypeScript, Zod 4 (`zod/mini`), `@wordpress/interactivity`, `wp-scripts` (webpack, Jest), Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-01-interactivity-server-data-design.md`

## Global Constraints

- Import `z` only from `sources/client/interactivity/zod.ts`. Never import `zod/mini` or `zod` in a store.
- Use the `zod/mini` API: functions and `.check()`, not chained methods.
- Use `z.strictObject` for every server object. No `.catch()` and no `.default()`.
- The error message is: `Store "<store>": the server <kind> is not valid.\n<prettifyError output>`.
- `zod` goes into `dependencies`, version `^4.6.5`. Use pnpm, never npm or npx.
- The skill contains no project path, no plugin name and no store name.
- ESLint limits that shape the code: `@typescript-eslint/max-params` 3, `max-lines` 300 per file, `max-lines-per-function` 25, `max-nested-callbacks` 2, `complexity` 5, `explicit-function-return-type`. Tests are linted too, so write `it` at the top level of a test file when the body uses a callback in `expect`.
- Commit messages follow `.claude/skills/github-commit/SKILL.md`: title of at most 50 characters, type, optional scope, imperative, lower case. End each message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Prose in comments and documents follows Simplified Technical English.

### Changes to the spec found while planning

Note: commit c5df107 changed the export form of `zod.ts` to `export * from 'zod/mini'`. The bundle is 13.2 kB gzip. The task code blocks below show the earlier form.

1. `sanitize` takes `( schema, data, source: Source )` with `type Source = { store: string; kind: Kind }`. Four parameters break `max-params` 3.
2. The locale import is `import { en } from 'zod/locales'`. It works in ESM and CommonJS (Jest), and the bundle stays at 6.0 kB gzip.
3. `zod/mini` has no `z.ZodError`. The `instanceof` check uses `z.core.$ZodError`.
4. The preview store validates config and state on the **first** `init` only. A second `init` must not reset `isOpen` and the other dialog keys to the server values while a popover is open.
5. `endpoint` uses `z.url( { protocol: /^https?$/ } )`. A plain `z.url()` accepts `javascript:` URLs.
6. The link line of the router goes into `.claude/skills/wordpress-router/references/decision-tree.md`, because the routes live there.

## Review Focus

- A second `init` while the popover is open → the state keeps `isOpen: true`. Test in Task 3.
- An endpoint with a `javascript:` scheme → the config parse fails. Test in Task 2.
- The state fails and the config passes → no config is cached, and the next `init` throws again. Test in Task 3.
- A visitor who is not logged in gets `nonce: ''` → the config parse passes. Test in Task 2.
- A newer PHP sends a key that the schema does not know → the parse fails and the message names the key. Test in Task 1 and Task 2.

---

### Task 1: Shared Zod module and helpers

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `sources/client/interactivity/zod.ts`
- Create: `sources/client/interactivity/server-data.ts`
- Modify: `tests/unit/client/interactivity-mock.ts`
- Test: `tests/unit/client/server-data.test.ts`

**Interfaces:**
- Consumes: `getConfig`, `getServerState`, `getServerContext` from `@wordpress/interactivity`.
- Produces:
  - `export { z }` from `zod.ts` (the `zod/mini` namespace with the English locale loaded).
  - `export type Kind = 'config' | 'state' | 'context'`
  - `export type Source = { store: string; kind: Kind }`
  - `sanitize< S extends z.ZodMiniType >( schema: S, data: unknown, source: Source ): z.infer< S >`
  - `initializeServerConfig< S extends z.ZodMiniType >( store: string, schema: S ): Readonly< z.infer< S > >`
  - `initializeServerState< S extends z.ZodMiniType >( store: string, schema: S, state: object ): z.infer< S >`
  - `initializeServerContext< S extends z.ZodMiniType >( store: string, schema: S, context: object ): z.infer< S >`
  - The mock exports `server: { config, state, context }` (each a `Record< string, unknown >`) and `stores: Map< string, unknown >`.

- [ ] **Step 1: Measure the bundle before the change**

Run:
```bash
pnpm build && gzip -c build/preview/index.js | wc -c
```
Write the number down. Task 5 compares against it.

- [ ] **Step 2: Add the dependency**

Run:
```bash
pnpm add zod@^4.6.5
```
Expected: `zod` appears in `dependencies` of `package.json`.

- [ ] **Step 3: Extend the mock of the Interactivity API**

Replace the content of `tests/unit/client/interactivity-mock.ts`:

```ts
// The values that the server gives to each store, keyed by the store name.
// A test sets them before it calls the code under test.
export const server: {
	config: Record< string, unknown >;
	state: Record< string, unknown >;
	context: Record< string, unknown >;
} = { config: {}, state: {}, context: {} };

// The definition of each store, so a test can call its callbacks.
export const stores = new Map< string, unknown >();

export const store = ( name: string, definition: unknown ): unknown => {
	stores.set( name, definition );

	return definition;
};
export const getElement = (): { ref: HTMLElement } => ( {
	ref: document.body,
} );
export const getContext = (): Record< string, never > => ( {} );
export const getConfig = ( namespace: string ): unknown =>
	server.config[ namespace ] ?? {};
export const getServerState = ( namespace: string ): unknown =>
	server.state[ namespace ] ?? {};
export const getServerContext = ( namespace: string ): unknown =>
	server.context[ namespace ] ?? {};
```

- [ ] **Step 4: Write the failing tests**

Create `tests/unit/client/server-data.test.ts`:

```ts
import { server } from './interactivity-mock';
import {
	initializeServerConfig,
	initializeServerContext,
	initializeServerState,
	sanitize,
} from '../../../sources/client/interactivity/server-data';
import { z } from '../../../sources/client/interactivity/zod';

import type { Source } from '../../../sources/client/interactivity/server-data';

const STORE = 'my-plugin/counter';
const source: Source = { store: STORE, kind: 'config' };

const schema = z.strictObject( {
	label: z.string(),
	timings: z.strictObject( { open: z.int().check( z.nonnegative() ) } ),
} );

const valid = { label: 'Close', timings: { open: 300 } };

beforeEach( () => {
	server.config = {};
	server.state = {};
	server.context = {};
} );

it( 'returns the parsed value of valid data', () => {
	expect( sanitize( schema, valid, source ) ).toEqual( valid );
} );

it( 'names the store, the kind and the path of a wrong field', () => {
	const data = { label: 'Close', timings: { open: -1 } };

	expect( () => sanitize( schema, data, source ) ).toThrow(
		/^Store "my-plugin\/counter": the server config is not valid\.\n[\s\S]*→ at timings\.open/
	);
} );

it( 'names a key that the schema does not know', () => {
	const data = { ...valid, extra: true };

	expect( () => sanitize( schema, data, source ) ).toThrow(
		'Unrecognized key: "extra"'
	);
} );

it( 'throws an error that is not from Zod without a change', () => {
	const failure = new TypeError( 'boom' );
	const broken = {
		parse: (): never => {
			throw failure;
		},
	} as unknown as typeof schema;

	expect( () => sanitize( broken, valid, source ) ).toThrow( failure );
} );

it( 'reads the config of the store', () => {
	server.config[ STORE ] = valid;

	expect( initializeServerConfig( STORE, schema ) ).toEqual( valid );
} );

it( 'throws when the store has no config', () => {
	expect( () => initializeServerConfig( STORE, schema ) ).toThrow(
		'the server config is not valid'
	);
} );

it( 'writes the server state into the state', () => {
	const state = { count: 1 };
	server.state[ STORE ] = valid;

	initializeServerState( STORE, schema, state );

	expect( state ).toEqual( { count: 1, ...valid } );
} );

it( 'leaves the state unchanged when the server state is not valid', () => {
	const state = { count: 1 };
	server.state[ STORE ] = { label: 3 };

	expect( () => initializeServerState( STORE, schema, state ) ).toThrow(
		'the server state is not valid'
	);
	expect( state ).toEqual( { count: 1 } );
} );

it( 'writes the server context into the context', () => {
	const context = { open: false };
	server.context[ STORE ] = valid;

	initializeServerContext( STORE, schema, context );

	expect( context ).toEqual( { open: false, ...valid } );
} );

it( 'names the context when the server context is not valid', () => {
	expect( () => initializeServerContext( STORE, schema, {} ) ).toThrow(
		'the server context is not valid'
	);
} );
```

- [ ] **Step 5: Run the tests to make sure they fail**

Run: `pnpm test:unit tests/unit/client/server-data.test.ts`
Expected: FAIL with `Cannot find module '../../../sources/client/interactivity/server-data'`.

- [ ] **Step 6: Write `zod.ts`**

Create `sources/client/interactivity/zod.ts`:

```ts
/**
 * The single entry point of Zod for the stores. It loads the English locale
 * one time, so every error names the field and the cause. Without a locale,
 * `zod/mini` reports only "Invalid input".
 */

import * as z from 'zod/mini';
import { en } from 'zod/locales';

z.config( en() );

export { z };
```

- [ ] **Step 7: Write `server-data.ts`**

Create `sources/client/interactivity/server-data.ts`:

```ts
/**
 * The checks of the data that the server gives to a store of the
 * Interactivity API: the config, the state and the context. A store calls
 * them one time, in `init`, before it binds anything.
 */

import {
	getConfig,
	getServerContext,
	getServerState,
} from '@wordpress/interactivity';

import { z } from './zod';

export type Kind = 'config' | 'state' | 'context';

export type Source = {
	store: string;
	kind: Kind;
};

/**
 * Parses the data with the schema. A Zod error becomes an `Error` that names
 * the store, the kind of data and every wrong field.
 * @param schema - The schema of the data.
 * @param data   - The data from the server.
 * @param source - The store and the kind of the data.
 */
export function sanitize< S extends z.ZodMiniType >(
	schema: S,
	data: unknown,
	source: Source
): z.infer< S > {
	try {
		return schema.parse( data );
	} catch ( error ) {
		if ( error instanceof z.core.$ZodError ) {
			throw new Error(
				`Store "${ source.store }": the server ${
					source.kind
				} is not valid.\n${ z.prettifyError( error ) }`,
				{ cause: error }
			);
		}

		throw error;
	}
}

/**
 * Parses the config of the store. The config does not change while the page
 * is open, so the result is read-only.
 * @param store  - The name of the store.
 * @param schema - The schema of the config.
 */
export function initializeServerConfig< S extends z.ZodMiniType >(
	store: string,
	schema: S
): Readonly< z.infer< S > > {
	return sanitize( schema, getConfig( store ), { store, kind: 'config' } );
}

/**
 * Parses the server state and writes it into the state proxy. A
 * reassignment of a variable does not change a proxy, so the proxy is an
 * argument.
 * @param store  - The name of the store.
 * @param schema - The schema of the server state.
 * @param state  - The state proxy of the store.
 */
export function initializeServerState< S extends z.ZodMiniType >(
	store: string,
	schema: S,
	state: object
): z.infer< S > {
	const parsed = sanitize( schema, getServerState( store ), {
		store,
		kind: 'state',
	} );

	Object.assign( state, parsed );

	return parsed;
}

/**
 * Parses the server context of the current element and writes it into the
 * context proxy.
 * @param store   - The name of the store.
 * @param schema  - The schema of the server context.
 * @param context - The context proxy of the element.
 */
export function initializeServerContext< S extends z.ZodMiniType >(
	store: string,
	schema: S,
	context: object
): z.infer< S > {
	const parsed = sanitize( schema, getServerContext( store ), {
		store,
		kind: 'context',
	} );

	Object.assign( context, parsed );

	return parsed;
}
```

- [ ] **Step 8: Run the tests to make sure they pass**

Run: `pnpm test:unit tests/unit/client/server-data.test.ts`
Expected: PASS, 10 tests.

If Jest fails to load `zod/mini` or `zod/locales` with `SyntaxError: Cannot use import statement outside a module`, add this key to the `jest` object of `package.json` and run again:

```json
"transformIgnorePatterns": [ "/node_modules/(?!zod/)" ]
```

- [ ] **Step 9: Run the checks**

Run: `pnpm test:unit && pnpm lint:scripts && pnpm lint:types`
Expected: all pass. `store.test.ts` still passes with the new mock.

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-lock.yaml sources/client/interactivity tests/unit/client/interactivity-mock.ts tests/unit/client/server-data.test.ts
git commit -F - <<'EOF'
feat(client): add the checks of the server data

The stores cast the data from the server and never check it. The
helpers parse it with a Zod schema and throw an error that names the
store and every wrong field.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Schemas of the preview store

**Files:**
- Create: `sources/client/preview/schemas.ts`
- Modify: `sources/client/preview/types.ts:22-41` (the types `Timings`, `ServerConfig`, `ServerState`)
- Test: `tests/unit/client/schemas.test.ts`

**Interfaces:**
- Consumes: `z` from `sources/client/interactivity/zod.ts` (Task 1).
- Produces:
  - `timingsSchema`, `configSchema`, `stateSchema` from `schemas.ts`.
  - `Timings`, `ServerConfig`, `ServerState` from `types.ts`, now `z.infer` of the schemas. `ServerState` holds all eleven keys of `PopoverRegion::state()`.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/client/schemas.test.ts`:

```ts
import {
	configSchema,
	stateSchema,
} from '../../../sources/client/preview/schemas';

// The shape of PopoverRegion::clientConfig().
const config = {
	endpoint: 'https://example.com/wp-json/rinkukado/v1/preview',
	nonce: 'abc123',
	rootSelector: 'main',
	containerSelector: '.entry-content',
	denyClass: 'no-rinkukado',
	timings: { prefetch: 80, open: 300, close: 200 },
	sheetQuery: '(pointer: coarse)',
	hoverQuery: '(hover: hover) and (pointer: fine) and (min-width: 782px)',
};

// The shape of PopoverRegion::state().
const state = {
	closeLabel: 'Close the preview',
	ctaLabel: 'Read the article',
	isOpen: false,
	isSheet: false,
	hasThumbnail: false,
	title: '',
	excerpt: '',
	permalink: '',
	thumbnailSrc: '',
	thumbnailSrcset: '',
	thumbnailAlt: '',
};

function accepts( data: unknown ): boolean {
	return configSchema.safeParse( data ).success;
}

it( 'accepts the config of the server', () => {
	expect( accepts( config ) ).toBe( true );
} );

it( 'accepts an empty nonce for a visitor who is not logged in', () => {
	expect( accepts( { ...config, nonce: '' } ) ).toBe( true );
} );

it( 'accepts a timing of zero', () => {
	const timings = { prefetch: 0, open: 0, close: 0 };

	expect( accepts( { ...config, timings } ) ).toBe( true );
} );

it( 'rejects a key that the server does not send', () => {
	expect( accepts( { ...config, extra: 1 } ) ).toBe( false );
} );

it( 'rejects a negative timing', () => {
	const timings = { ...config.timings, open: -1 };

	expect( accepts( { ...config, timings } ) ).toBe( false );
} );

it( 'rejects a timing that is not an integer', () => {
	const timings = { ...config.timings, close: 1.5 };

	expect( accepts( { ...config, timings } ) ).toBe( false );
} );

it( 'rejects an endpoint that is not a URL', () => {
	expect( accepts( { ...config, endpoint: 'nope' } ) ).toBe( false );
} );

it( 'rejects an endpoint with a scheme that is not http', () => {
	const endpoint = 'javascript:alert(1)';

	expect( accepts( { ...config, endpoint } ) ).toBe( false );
} );

it( 'rejects an empty selector', () => {
	expect( accepts( { ...config, rootSelector: '' } ) ).toBe( false );
} );

it( 'accepts the state of the server', () => {
	expect( stateSchema.safeParse( state ).success ).toBe( true );
} );

it( 'rejects a state without a label', () => {
	const { closeLabel, ...rest } = state;

	expect( stateSchema.safeParse( rest ).success ).toBe( false );
} );
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `pnpm test:unit tests/unit/client/schemas.test.ts`
Expected: FAIL with `Cannot find module '../../../sources/client/preview/schemas'`.

- [ ] **Step 3: Write `schemas.ts`**

Create `sources/client/preview/schemas.ts`:

```ts
/**
 * The schemas of the data that the server gives to the `rinkukado` store.
 * Each schema holds exactly the keys that the server sends.
 */

import { z } from '../interactivity/zod';

const nonNegativeInt = (): z.ZodMiniInt =>
	z.int().check( z.nonnegative() );

const nonEmptyString = (): z.ZodMiniString =>
	z.string().check( z.minLength( 1 ) );

// Matches Config::timings().
export const timingsSchema = z.strictObject( {
	prefetch: nonNegativeInt(),
	open: nonNegativeInt(),
	close: nonNegativeInt(),
} );

// Matches PopoverRegion::clientConfig().
export const configSchema = z.strictObject( {
	endpoint: z.url( { protocol: /^https?$/ } ),
	// Empty for a visitor who is not logged in.
	nonce: z.string(),
	rootSelector: nonEmptyString(),
	containerSelector: nonEmptyString(),
	denyClass: nonEmptyString(),
	timings: timingsSchema,
	sheetQuery: nonEmptyString(),
	hoverQuery: nonEmptyString(),
} );

// Matches PopoverRegion::state(). The server sends the labels and the
// initial values of the dialog.
export const stateSchema = z.strictObject( {
	closeLabel: z.string(),
	ctaLabel: z.string(),
	isOpen: z.boolean(),
	isSheet: z.boolean(),
	hasThumbnail: z.boolean(),
	title: z.string(),
	excerpt: z.string(),
	permalink: z.string(),
	thumbnailSrc: z.string(),
	thumbnailSrcset: z.string(),
	thumbnailAlt: z.string(),
} );
```

If `pnpm lint:types` reports that `z.ZodMiniInt` or `z.ZodMiniString` does not exist, remove the return type of the two helpers and add `// eslint-disable-next-line @typescript-eslint/explicit-function-return-type` above each one.

- [ ] **Step 4: Take the types from the schemas**

In `sources/client/preview/types.ts`, change the file header comment to:

```ts
/**
 * The shared types of the preview: the preview payload, and the types of
 * the data that the server gives to the store. The schemas are the source
 * of the server types.
 */

import type { z } from '../interactivity/zod';
import type { configSchema, stateSchema, timingsSchema } from './schemas';
```

Replace the declarations of `Timings`, `ServerConfig` and `ServerState` with:

```ts
export type Timings = z.infer< typeof timingsSchema >;

export type ServerConfig = z.infer< typeof configSchema >;

export type ServerState = z.infer< typeof stateSchema >;
```

`Thumbnail` and `Preview` do not change.

- [ ] **Step 5: Run the tests to make sure they pass**

Run: `pnpm test:unit tests/unit/client/schemas.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 6: Run the checks**

Run: `pnpm test:unit && pnpm lint:scripts && pnpm lint:types`
Expected: all pass. `index.module.ts` still compiles, because `State` is `ServerState & { … }` and the extra keys have the same types.

- [ ] **Step 7: Commit**

```bash
git add sources/client/preview/schemas.ts sources/client/preview/types.ts tests/unit/client/schemas.test.ts
git commit -F - <<'EOF'
feat(client): add the schemas of the preview data

The types of the config and the state now come from the schemas, so
the checks and the types cannot drift apart.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Validate the server data in `init`

**Files:**
- Modify: `sources/client/preview/index.module.ts:1-128` (imports, `State`, `config()`, `init`)
- Test: `tests/unit/client/store-init.test.ts`

**Interfaces:**
- Consumes: `initializeServerConfig`, `initializeServerState` (Task 1). `configSchema`, `stateSchema`, `ServerConfig`, `ServerState` (Task 2). `server`, `stores` of the mock (Task 1).
- Produces: no new export. The `rinkukado` store throws in `init` when the config or the state is not valid.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/client/store-init.test.ts`:

```ts
type Definition = {
	state: Record< string, unknown >;
	callbacks: { init: () => void };
};

const config = {
	endpoint: 'https://example.com/wp-json/rinkukado/v1/preview',
	nonce: '',
	rootSelector: 'main',
	containerSelector: '.entry-content',
	denyClass: 'no-rinkukado',
	timings: { prefetch: 80, open: 300, close: 200 },
	sheetQuery: '(pointer: coarse)',
	hoverQuery: '(hover: hover) and (pointer: fine) and (min-width: 782px)',
};

const state = {
	closeLabel: 'Close the preview',
	ctaLabel: 'Read the article',
	isOpen: false,
	isSheet: false,
	hasThumbnail: false,
	title: '',
	excerpt: '',
	permalink: '',
	thumbnailSrc: '',
	thumbnailSrcset: '',
	thumbnailAlt: '',
};

// Loads a fresh copy of the store, so the cache of one test does not leak
// into the next one.
async function load(
	serverConfig: unknown,
	serverState: unknown
): Promise< Definition > {
	jest.resetModules();

	const mock = await import( './interactivity-mock' );
	mock.server.config[ 'rinkukado' ] = serverConfig;
	mock.server.state[ 'rinkukado' ] = serverState;

	await import( '../../../sources/client/preview/index.module' );

	return mock.stores.get( 'rinkukado' ) as Definition;
}

function root(): HTMLElement {
	return document.querySelector( 'main' ) as HTMLElement;
}

beforeEach( () => {
	document.body.innerHTML =
		'<main><a href="/a/">A</a></main>' +
		'<div class="rinkukado"><div class="rinkukado__dialog">' +
		'<button class="rinkukado__close"></button></div></div>';

	window.matchMedia = jest.fn( () => ( {
		matches: false,
		addEventListener: jest.fn(),
	} ) ) as unknown as typeof window.matchMedia;
} );

it( 'binds nothing when the config is not valid', async () => {
	const endpoint = 'javascript:alert(1)';
	const definition = await load( { ...config, endpoint }, state );
	const listen = jest.spyOn( root(), 'addEventListener' );

	expect( () => definition.callbacks.init() ).toThrow(
		'the server config is not valid'
	);
	expect( window.matchMedia ).not.toHaveBeenCalled();
	expect( listen ).not.toHaveBeenCalled();
} );

it( 'binds nothing and keeps no config when the state is not valid', async () => {
	const definition = await load( config, { ...state, isOpen: 'no' } );

	expect( () => definition.callbacks.init() ).toThrow(
		'the server state is not valid'
	);
	expect( () => definition.callbacks.init() ).toThrow(
		'the server state is not valid'
	);
	expect( window.matchMedia ).not.toHaveBeenCalled();
} );

it( 'binds the listeners when the data is valid', async () => {
	const definition = await load( config, state );
	const listen = jest.spyOn( root(), 'addEventListener' );

	definition.callbacks.init();

	expect( listen ).toHaveBeenCalled();
	expect( definition.state.closeLabel ).toBe( 'Close the preview' );
} );

it( 'keeps the state when init runs a second time', async () => {
	const definition = await load( config, state );

	definition.callbacks.init();
	definition.state.isOpen = true;
	definition.callbacks.init();

	expect( definition.state.isOpen ).toBe( true );
} );
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `pnpm test:unit tests/unit/client/store-init.test.ts`
Expected: FAIL. The first test fails with `Received function did not throw`, because `init` does not validate yet.

If `mock.stores.get( 'rinkukado' )` returns `undefined`, the relative import and the `moduleNameMapper` entry load two copies of the mock. In that case, import the mock in `load` with `await import( '@wordpress/interactivity' )` and cast the result: `as unknown as typeof import( './interactivity-mock' )`, with `// eslint-disable-next-line @typescript-eslint/consistent-type-imports` above the line.

- [ ] **Step 3: Change the imports of `index.module.ts`**

Replace the import block (from `import { getConfig, getElement, store }` to `import type { Preview, ServerConfig, ServerState, Timings } from './types';`) with:

```ts
import { getElement, store } from '@wordpress/interactivity';

import { bind, returnFocusOnShiftTab } from './events';
import { createDriver } from './driver';
import { placeDialog, resolveRoot, unplaceDialog } from './dom';
import { watchQueries } from './media-queries';
import { createFetcher, readPreview } from './network';
import { configSchema, stateSchema } from './schemas';
import {
	initializeServerConfig,
	initializeServerState,
} from '../interactivity/server-data';

import type { EventContext, Refs } from './context';
import type { PolicyOptions } from './policy';
import type { Endpoint } from './network';
import type { Mode } from './dom';
import type { Preview, ServerConfig, ServerState, Timings } from './types';
```

- [ ] **Step 4: Replace `State` and `config()`**

Replace the `type State = ServerState & { … };` block and the `config()` function with:

```ts
const STORE = 'rinkukado';

// The schema holds every key of the state, because the server sends the
// initial value of each one.
type State = ServerState;

// The config does not change while the page is open, so no directive reads
// it and it stays out of the state. `init` fills it after the check.
let serverConfig: ServerConfig | null = null;

function config(): ServerConfig {
	if ( serverConfig === null ) {
		throw new Error( `Store "${ STORE }": the config was read before init.` );
	}

	return serverConfig;
}

// The config and the state are global, so only the first init checks them.
// A later init must not reset the state of an open popover. The config is
// cached last, so a failed state check repeats at the next init.
function validateServerData(): void {
	if ( serverConfig !== null ) {
		return;
	}

	const parsed = initializeServerConfig( STORE, configSchema );

	initializeServerState( STORE, stateSchema, state );
	serverConfig = parsed;
}
```

- [ ] **Step 5: Use the constant and call the check in `init`**

Change `store( 'rinkukado', {` to `store( STORE, {`.

In `callbacks.init`, add the call as the first statement:

```ts
		init(): void {
			validateServerData();

			const region = getElement().ref as HTMLElement | null;
```

The rest of `init` does not change.

- [ ] **Step 6: Run the tests to make sure they pass**

Run: `pnpm test:unit tests/unit/client/store-init.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 7: Run the checks**

Run: `pnpm test:unit && pnpm lint:scripts && pnpm lint:types`
Expected: all pass.

If `max-lines` (300) or `max-lines-per-function` (25) fails for `index.module.ts`, move `config()` and `validateServerData()` into a new file `sources/client/preview/server.ts`. That file exports `config()` and `validateServerData( state: ServerState ): void`, and `index.module.ts` imports both.

- [ ] **Step 8: Commit**

```bash
git add sources/client/preview/index.module.ts tests/unit/client/store-init.test.ts
git commit -F - <<'EOF'
feat(client): check the server data before the bind

If the config or the state from the server is not valid, init throws
and binds nothing, so the links keep their normal behavior.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: The skill `interactivity-server-data`

**Files:**
- Create: `.claude/skills/interactivity-server-data/SKILL.md`
- Create: `.claude/skills/interactivity-server-data/assets/zod.ts` (a copy of `sources/client/interactivity/zod.ts`)
- Create: `.claude/skills/interactivity-server-data/assets/server-data.ts` (a copy of `sources/client/interactivity/server-data.ts`)
- Create: `.claude/skills/interactivity-server-data/references/schema-rules.md`
- Modify: `.claude/skills/wp-interactivity-api/SKILL.md` (section "2) Identify the store(s)")
- Modify: `.claude/skills/wordpress-router/references/decision-tree.md` (section "Route by user intent")
- Modify: `.claude/CLAUDE.md` (section "Project Layout")

**Interfaces:**
- Consumes: the final code of Task 1, Task 2 and Task 3.
- Produces: a skill with no project path, no plugin name and no store name.

- [ ] **Step 1: Load the skill for skill authoring**

Invoke `superpowers:writing-skills`. Follow its RED, GREEN, REFACTOR cycle with the steps below.

- [ ] **Step 2: RED: run the baseline without the skill**

Create a sample folder in the scratchpad with this file, `store.ts`:

```ts
import { getConfig, getContext, store } from '@wordpress/interactivity';

type Config = { step: number; max: number };
type State = { label: string };
type Context = { count: number };

const { state } = store( 'my-plugin/counter', {
	state: {} as State,
	actions: {
		increment(): void {
			const config = getConfig( 'my-plugin/counter' ) as Config;
			const context = getContext< Context >();
			context.count = Math.min( context.count + config.step, config.max );
		},
	},
	callbacks: {
		init(): void {},
	},
} );
```

Dispatch a subagent that does not have the skill, with this prompt: "In this folder, the store `my-plugin/counter` trusts the config, the state and the context from the server. Add validation with Zod so that the store does nothing when the data is not valid." Record what it does. Look for these failures: it imports `zod`, not `zod/mini`; it reassigns a local variable instead of the proxy; it validates outside `init`; it uses `.default()` or `.catch()`; it keeps hand-written types.

- [ ] **Step 3: Copy the helpers into `assets/`**

Run:
```bash
mkdir -p .claude/skills/interactivity-server-data/assets .claude/skills/interactivity-server-data/references
cp sources/client/interactivity/zod.ts sources/client/interactivity/server-data.ts .claude/skills/interactivity-server-data/assets/
```

- [ ] **Step 4: Write `SKILL.md`**

Create `.claude/skills/interactivity-server-data/SKILL.md`:

````markdown
---
name: interactivity-server-data
description: "Use when a store of the WordPress Interactivity API reads config, state or context from the server (wp_interactivity_config, wp_interactivity_state, data-wp-context, getConfig, getServerState, getServerContext), or when you add or change a Zod schema for that data."
---

# Interactivity Server Data

## The rule

A store validates every value that the server gives to it: the config, the
state and the context. It does this in the `init` callback, before it binds
anything. If a parse fails, `init` throws and the store does nothing. There
are no fallback values, because a fallback hides a bug of the server.

## Placeholders

- `<STORE>`: the name of the store, for example `my-plugin/counter`.
- `<helpers-dir>`: the directory of the project that holds `zod.ts` and
  `server-data.ts`.

## Procedure

### 1) Find or add the helpers

1. Search the client sources of the project for `initializeServerConfig`.
   If you find it, its directory is `<helpers-dir>`. Go to step 2.
2. Read the project layout in `CLAUDE.md` or `AGENTS.md`. Find the directory
   for client code that more than one store shares. If the layout does not
   tell it, ask the user.
3. Copy `assets/zod.ts` and `assets/server-data.ts` into that directory
   without changes.
4. If `package.json` has no `zod` in `dependencies`, add `zod@^4.6.5` with
   the package manager of the project.
5. If the unit tests mock `@wordpress/interactivity`, add `getServerState`
   and `getServerContext` to the mock.

### 2) Write the schemas

Put the schemas in `schemas.ts` next to the store. Read
`references/schema-rules.md` before you write one.

```ts
import { z } from '<helpers-dir>/zod';

// Matches the PHP code that calls wp_interactivity_config().
export const configSchema = z.strictObject( {
	step: z.int().check( z.positive() ),
	max: z.int(),
} );

// Matches the PHP code that calls wp_interactivity_state().
export const stateSchema = z.strictObject( { label: z.string() } );

// Matches the data-wp-context attribute of the markup.
export const contextSchema = z.strictObject( { count: z.int() } );
```

### 3) Take the types from the schemas

```ts
import type { z } from '<helpers-dir>/zod';
import type { configSchema, contextSchema, stateSchema } from './schemas';

export type Config = z.infer< typeof configSchema >;
export type State = z.infer< typeof stateSchema >;
export type Context = z.infer< typeof contextSchema >;
```

Do not write a type for server data by hand.

### 4) Validate in `init`

```ts
import { getContext, store } from '@wordpress/interactivity';

import {
	initializeServerConfig,
	initializeServerContext,
	initializeServerState,
} from '<helpers-dir>/server-data';
import { configSchema, contextSchema, stateSchema } from './schemas';

import type { Config, Context, State } from './types';

const STORE = '<STORE>';

let serverConfig: Config | null = null;

function config(): Config {
	if ( serverConfig === null ) {
		throw new Error( `Store "${ STORE }": the config was read before init.` );
	}

	return serverConfig;
}

// The config and the state are global, so only the first init checks them.
// The config is cached last, so a failed state check repeats.
function validateServerData( state: State ): void {
	if ( serverConfig !== null ) {
		return;
	}

	const parsed = initializeServerConfig( STORE, configSchema );

	initializeServerState( STORE, stateSchema, state );
	serverConfig = parsed;
}

const { state } = store( STORE, {
	state: {} as State,
	callbacks: {
		init(): void {
			validateServerData( state );
			// The context belongs to each element, so each init checks it.
			initializeServerContext( STORE, contextSchema, getContext< Context >() );

			// Bind the listeners here, after the checks.
		},
	},
} );
```

- Validate in this sequence: config, then state, then context.
- Give the state proxy and the context proxy to the helpers as arguments.
  The helpers write into the proxy with `Object.assign`.
- If the server sends no config, no state or no context, leave out that
  call and its schema.

### 5) Test

Read `references/schema-rules.md`, section "Tests".

## Pitfalls

- A reassignment does not change a proxy. `let c = getContext(); c = parse()`
  changes only the variable `c`.
- Import `z` only from `<helpers-dir>/zod.ts`. Only that file loads the
  English locale. Without it, every error says only "Invalid input".
- Do not read the config before `init`. `config()` throws in that case.
- `Readonly` on the config is a check at compile time only.
- Do not use `.default()` or `.catch()` on a schema of server data.
````

- [ ] **Step 5: Write `references/schema-rules.md`**

Create `.claude/skills/interactivity-server-data/references/schema-rules.md`:

````markdown
# Schema rules

## Rules

- Use `z.strictObject`. An unknown key fails the parse, so a change on the
  server that the client does not know about shows at once.
- Write exactly the keys that the server sends. If the server sends the
  initial value of a client key, for example `isOpen: false`, the schema
  holds that key too.
- Write a comment on each schema that names the server code that sends the
  data.
- Use the `zod/mini` API: functions and `.check()`, not chained methods.
- Do not use `.default()` or `.catch()`.
- Limit a URL to the schemes that the store uses:
  `z.url( { protocol: /^https?$/ } )`. A plain `z.url()` accepts
  `javascript:`.

## From `zod` to `zod/mini`

| `zod` | `zod/mini` |
| --- | --- |
| `z.string().min( 1 )` | `z.string().check( z.minLength( 1 ) )` |
| `z.number().nonnegative()` | `z.number().check( z.nonnegative() )` |
| `z.number().int()` | `z.int()` |
| `z.string().optional()` | `z.optional( z.string() )` |
| `z.string().nullable()` | `z.nullable( z.string() )` |
| `z.array( x ).min( 1 )` | `z.array( x ).check( z.minLength( 1 ) )` |
| `error instanceof z.ZodError` | `error instanceof z.core.$ZodError` |

## Tests

A schema test parses a fixture with the exact shape that the server sends,
and one fixture for each rule that must fail:

```ts
import { configSchema } from './schemas';

const config = { step: 1, max: 10 };

it( 'accepts the config of the server', () => {
	expect( configSchema.safeParse( config ).success ).toBe( true );
} );

it( 'rejects a key that the server does not send', () => {
	expect( configSchema.safeParse( { ...config, extra: 1 } ).success ).toBe(
		false
	);
} );
```

A test of `init` sets invalid server data in the mock of
`@wordpress/interactivity`, calls `init`, and makes sure that it throws and
binds no listener.
````

- [ ] **Step 6: Add the links**

In `.claude/skills/wp-interactivity-api/SKILL.md`, section "### 2) Identify the store(s)", after the bullet `- callbacks/event handlers used by \`data-wp-on--*\`.`, add a blank line and:

```markdown
If the store reads config, state or context from the server, read the
skill `interactivity-server-data` before you change the store.
```

In `.claude/skills/wordpress-router/references/decision-tree.md`, after the two lines of the Interactivity API route, add:

```markdown
- **Server data of a store / getConfig / getServerState / getServerContext / Zod schema**
  - Route → `interactivity-server-data`.
```

In `.claude/CLAUDE.md`, section "Project Layout", after the line of `sources/client/blocks/`, add:

```markdown
- `sources/client/interactivity/` — the shared helpers of the Interactivity API stores. They are a copy of `.claude/skills/interactivity-server-data/assets/`: change the skill first.
```

- [ ] **Step 7: GREEN: run the scenario with the skill**

Create a fresh copy of the sample folder of Step 2. Dispatch a new subagent with the same prompt, and tell it to read `.claude/skills/interactivity-server-data/SKILL.md` first. Check that it:
- copies the helpers and imports `z` from the copied `zod.ts`,
- validates config, state and context in `init`, with `validateServerData` and the proxy arguments,
- takes the types from the schemas,
- uses no `.default()` and no `.catch()`.

If it fails a check, change the skill to close the gap (REFACTOR) and run the scenario again.

- [ ] **Step 8: Check that the skill has no project knowledge**

Run:
```bash
grep -rniE "rinkukado|sources/client|preview|popover" .claude/skills/interactivity-server-data
```
Expected: no output.

Run:
```bash
diff sources/client/interactivity/zod.ts .claude/skills/interactivity-server-data/assets/zod.ts && diff sources/client/interactivity/server-data.ts .claude/skills/interactivity-server-data/assets/server-data.ts
```
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add .claude/skills/interactivity-server-data .claude/skills/wp-interactivity-api/SKILL.md .claude/skills/wordpress-router/references/decision-tree.md .claude/CLAUDE.md
git commit -F - <<'EOF'
docs(claude): add the skill for the store server data

The skill holds the helpers and the rules, and it names no project, so
other plugins can copy it as it is.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Final verification

**Files:** none changed, unless a check fails.

**Interfaces:**
- Consumes: the result of Tasks 1 to 4.
- Produces: the numbers and the results for the PR description.

- [ ] **Step 1: Build and measure**

Run:
```bash
pnpm build && gzip -c build/preview/index.js | wc -c
```
Expected: the build passes. The size is about 6 kB larger than the number of Task 1, Step 1. Write both numbers down.

- [ ] **Step 2: Run the client checks**

Run: `pnpm lint:scripts && pnpm lint:styles && pnpm lint:types && pnpm test:unit`
Expected: all pass.

- [ ] **Step 3: Run the PHP checks**

Run: `composer qa`
Expected: pass. No PHP file changed, so this only confirms that nothing broke.

- [ ] **Step 4: Run the end-to-end specs**

Start the environment if it does not run: `pnpm wp-env start`.
Run: `pnpm test:e2e`
Expected: all specs pass without a change. This proves that the real output of `PopoverRegion` matches the schemas.

If a spec fails because the popover never opens, read the browser console. A message `Store "rinkukado": the server … is not valid.` names the key that does not match. Fix the schema, not the PHP code, unless the PHP code is wrong.

- [ ] **Step 5: Report**

Report to the user: the two bundle sizes, the result of each command, and any step that was skipped. Do not open a PR unless the user asks.
