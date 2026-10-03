# Interactivity Server Data — Design

Date: 2026-10-01
Status: approved in chat, waiting for the review of the written spec
Plugin: Rinkukado

## 1. Goal

Every store of the Interactivity API validates the data that it gets from the
server before it uses that data. The data is the config
(`wp_interactivity_config`), the state (`wp_interactivity_state`) and the
context (`data-wp-context`). A Zod schema describes each one, and the types of
the store come from the schemas.

A project-independent skill tells an agent how to apply this pattern to any
store, so the same skill can go to other plugins later.

## 2. Decisions

| Topic | Decision |
| --- | --- |
| Data in scope | Config, state and context. |
| When | One time, in the `init` callback, before the store binds anything. |
| Failure | `init` catches the `Error`, reports it with `reportError` and returns. It binds no listener, and the preview does not appear. The error does not leave `init`, because an error that leaves `init` can stop the effects of other stores. |
| Defaults | None. No `.catch()` and no `.default()`, because they hide server bugs. |
| Zod entry point | `zod/mini`, because of the bundle size (see 2.1). |
| Error messages | The English locale, loaded one time with a static import. |
| Types | `z.infer` of the schemas. No hand-written type for server data. |
| Shared helpers | `sources/client/interactivity/`. |
| Skill | `.claude/skills/interactivity-server-data/`, with no project knowledge. |
| Out of scope | The REST payload (`readPreview`), and the template repository. |

### 2.1 Measures of the bundle

A probe with Zod 4.6.5, bundled with esbuild, minified, gzip. The code holds
`strictObject`, `parse` and `prettifyError`.

| Bundle | Size (gzip) |
| --- | --- |
| `zod/mini` | 4.8 kB |
| `zod` (full) | 26.2 kB |
| `zod/mini` with the English locale | 6.0 kB |

The probe is not the same as the webpack build. The measure of
`build/preview/index.js` is 13,224 bytes gzip, against 4,652 bytes before the
change. The first form of `zod.ts` (`export { z }`) gave 93,634 bytes, because
webpack kept the whole namespace. The final form re-exports each binding with
`export * from 'zod/mini'`, so the tree shaking works.

Without a locale, `zod/mini` gives only `✖ Invalid input`, with no field and
no cause. With the English locale, the message names the field and the cause:

```
✖ Unrecognized key: "c"
✖ Invalid input: expected number, received string
  → at a
```

A conditional load of the locale was considered and dropped. It saves 1.2 kB
and needs a dynamic import that the module build must split into a chunk.

### 2.2 Why `init`

The config and the state are global to the store, so a parse at module load
was considered. If that parse throws, `store()` never runs, and the
directives in the markup refer to a store that does not exist. This is a
second failure path. A lazy parse on the first read was also dropped, because
the first read can happen in a listener after the binding.

`init` holds all the checks, so there is one failure path: if a parse fails,
the store does nothing.

`init` runs inside a Preact effect (`data-wp-init`), and the runtime has no
error boundary. An error that leaves `init` can stop the effect queue of
other stores on the page. So `init` catches the error, reports it with the
global `reportError( error )` and returns. `sanitize` and the helpers still
throw. Only `init` of the store catches.

### 2.3 Why the proxy is an argument

`getContext()` and the `state` of `store()` return reactive proxies. A
reassignment of a local variable does not change a proxy:

```ts
let context = getContext();
context = schema.parse( raw ); // rebinds the variable; the proxy is unchanged
```

The helpers write the parsed values into the proxy with `Object.assign`. The
store gives the proxy as an argument, so the write is visible in the store, and
a test can give a plain object.

## 3. Shared module

### 3.1 `sources/client/interactivity/zod.ts`

It re-exports `zod/mini` and loads the English locale one time. Every store
imports `z` from this file, never from `zod/mini` or `zod`, so the locale is
always loaded. A consumer writes `import * as z from '../interactivity/zod'`,
or `import type * as z from …` when it needs only types.

```ts
import { config } from 'zod/mini';
import { en } from 'zod/locales';

config( en() );

export * from 'zod/mini';
```

`export { z }` is not correct. A namespace object as one value export stops
the tree shaking (see 2.1).

### 3.2 `sources/client/interactivity/server-data.ts`

```ts
type Kind = 'config' | 'state' | 'context';

export function sanitize< S extends z.ZodMiniType >(
	schema: S,
	data: unknown,
	source: { store: string; kind: Kind }
): z.infer< S >;

export function initializeServerConfig< S extends z.ZodMiniType >(
	store: string,
	schema: S
): Readonly< z.infer< S > >;

export function initializeServerState< S extends z.ZodMiniType >(
	store: string,
	schema: S,
	state: object
): z.infer< S >;

export function initializeServerContext< S extends z.ZodMiniType >(
	store: string,
	schema: S,
	context: object
): z.infer< S >;
```

- `sanitize` calls `schema.parse( data )`. It catches only a `z.core.$ZodError`, and
  throws a new `Error` with this message:
  `Store "<store>": the server <kind> is not valid.\n<prettifyError output>`.
  It throws every other error again without a change.
- `initializeServerConfig` parses `getConfig( store )` and returns the result.
- `initializeServerState` parses `getServerState( store )`, then calls
  `Object.assign( state, parsed )`.
- `initializeServerContext` parses `getServerContext( store )`, then calls
  `Object.assign( context, parsed )`.
- Only the config result is `Readonly`. The store changes the state and the
  context, so `Readonly` is not correct for them. `Readonly` is a check at
  compile time only: `parse` returns an object that is not frozen.

## 4. Changes to the preview store

### 4.1 New file `sources/client/preview/schemas.ts`

The schemas hold exactly the keys that `PopoverRegion` sends.

```ts
import * as z from '../interactivity/zod';

const nonNegativeInt = () => z.int().check( z.nonnegative() );
const nonEmptyString = () => z.string().check( z.minLength( 1 ) );

// Matches Config::timings().
export const timingsSchema = z.strictObject( {
	prefetch: nonNegativeInt(),
	open: nonNegativeInt(),
	close: nonNegativeInt(),
} );

// Matches PopoverRegion::clientConfig().
export const configSchema = z.strictObject( {
	endpoint: z.url( { protocol: /^https?$/ } ), // a plain z.url() accepts javascript:
	nonce: z.string(), // empty for a visitor who is not logged in
	rootSelector: nonEmptyString(),
	containerSelector: nonEmptyString(),
	denyClass: nonEmptyString(),
	timings: timingsSchema,
	sheetQuery: nonEmptyString(),
	hoverQuery: nonEmptyString(),
} );

// Matches PopoverRegion::state().
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

`PopoverRegion::state()` sends the labels and also the initial values of the
dialog keys, so `stateSchema` holds all eleven keys. The preview sends no
context, so it has no context schema.

### 4.2 `sources/client/preview/types.ts`

- `Timings` becomes `z.infer< typeof timingsSchema >`.
- `ServerConfig` becomes `z.infer< typeof configSchema >`.
- `ServerState` becomes `z.infer< typeof stateSchema >`.

`driver.ts`, `intent.ts` and the tests keep their imports and do not change.

### 4.3 `server.ts` and `index.module.ts`

`STORE`, `serverConfig`, `config()` and `validateServerData()` live in
`sources/client/preview/server.ts`. `index.module.ts` imports them.

In `server.ts`:

- A constant `STORE = 'rinkukado'` replaces the string literal.
- `let serverConfig: ServerConfig | null = null;` caches the config.
- `config()` returns `serverConfig`. If `serverConfig` is `null`, it throws,
  so no code can read config that was not validated.
- The first `init` only checks the config and the state, because a later
  `init` must not reset the state of an open popover. A function
  `validateServerData( state )` does this. It returns at once if
  `serverConfig` is not `null`.
- `validateServerData` caches the config last, so a failed state check
  repeats at the next `init`.

```ts
const parsed = initializeServerConfig( STORE, configSchema );

initializeServerState( STORE, stateSchema, state );
serverConfig = parsed;
```

In `index.module.ts`:

- The local `State` type is removed and the code uses `ServerState`, because
  the schema holds every key of the state.
- A function `checkServerData(): boolean` calls `validateServerData( state )`
  in a `try` block. If it throws, the function calls `reportError( error )`
  and returns `false`. Otherwise it returns `true`.
- `init` calls `checkServerData()` first. If the result is `false`, `init`
  returns and binds nothing. Otherwise the binding code runs without a change.
- The reason: an error that leaves `init` can stop the effects of other
  stores (see 2.2).

### 4.4 `package.json`

`zod` goes into `dependencies`, at the version `^4.6.5` or later.

## 5. Skill

### 5.1 Location and files

```
.claude/skills/interactivity-server-data/
├── SKILL.md
├── assets/
│   ├── zod.ts
│   └── server-data.ts
└── references/
    └── schema-rules.md
```

`assets/` holds the reference code of the helpers in section 3.
`sources/client/interactivity/` is a copy of `assets/`. The skill is the source
of truth: a change to the helpers starts in the skill.

### 5.2 Description

"Use when a store of the Interactivity API reads config, state, or context
from the server (`wp_interactivity_config`, `wp_interactivity_state`,
`data-wp-context`, `getConfig`, `getServerState`, `getServerContext`), or when
you add or change a Zod schema for that data."

### 5.3 Project independence

- The skill contains no project path, no plugin name and no store name.
- It uses the placeholders `<STORE>` and `<helpers-dir>`.
- The examples use one generic store, `my-plugin/counter`.

### 5.4 Content of `SKILL.md`

1. **Find or add the helpers.** Search the project for
   `initializeServerConfig`. If the module does not exist, read the project
   layout from `CLAUDE.md` and copy `assets/` into the shared client
   directory. If the location is not clear, ask the user.
2. **Add the dependency.** If `package.json` has no `zod`, add it.
3. **The rule.** The store validates all server data one time in `init`,
   before it binds anything. If a parse fails, `init` reports the error with
   `reportError` and returns, so the store does nothing and the error does not
   leave `init`.
4. **The files of each store.** `schemas.ts` holds the schemas. The types come
   from them with `z.infer`.
5. **Imports.** Import `z` from `<helpers-dir>/zod.ts` only.
6. **The `init` template.** Config, then state, then context. The config goes
   into a module cache. The state and the context proxies go to the helpers as
   arguments.

### 5.5 Content of `references/schema-rules.md`

- Use `z.strictObject`.
- Write exactly the keys that the server sends.
- Use the `zod/mini` API: functions and `.check()`, not chained methods.
- Name the server code that sends the data in a comment on each schema.
- Pitfalls:
  - A reassignment of a local variable does not change a proxy.
  - `Readonly` is a check at compile time only.
  - Do not let the error leave `init`. Catch it, call `reportError` and
    return.
  - Do not read the config before `init`.
  - Do not use `.catch()` or `.default()`.
- Test templates for a schema and for the helpers.

### 5.6 Links

- `.claude/skills/wp-interactivity-api/SKILL.md` gets one line that points to
  the new skill.
- `.claude/skills/wordpress-router/references/decision-tree.md` gets one line that sends store and
  server data tasks to the new skill.
- `.claude/CLAUDE.md` gets one line in "Project Layout":
  `sources/client/interactivity/` holds the shared helpers of the Interactivity
  API stores.

The two link lines contain no project paths.

## 6. Tests and checks

### 6.1 Jest (`tests/unit/client/`)

`server-data.test.ts`:

- `sanitize` returns the parsed value for valid data.
- For invalid data, `sanitize` throws an `Error`. The message contains the
  store name, the kind and the field path, for example `→ at timings.open`.
- `sanitize` throws a non-Zod error again without a change.
- `initializeServerState` and `initializeServerContext` write the parsed values
  into the target object.

`schemas.test.ts`:

- `configSchema` accepts a fixture with the shape of
  `PopoverRegion::clientConfig()`.
- `configSchema` rejects an unknown key, a negative timing, a timing that is
  not an integer, a URL that is not valid, and an empty selector.
- `stateSchema` accepts a fixture with the shape of `PopoverRegion::state()`.

`interactivity-mock.ts` gets `getServerState` and `getServerContext`. The tests
set the values that the mocks return.

### 6.2 Playwright

The current specs must pass without a change. They prove that the real PHP
output matches the schemas. No spec for invalid data is added, because the page
cannot get invalid config without test code in PHP. The Jest tests cover that
path.

### 6.3 Build checks

- `pnpm build` resolves the import path of the locale.
- Jest loads `zod/mini`. If Jest cannot load it, add a
  `transformIgnorePatterns` entry.
- Compare the size of the bundle before and after the change, and write the
  result in the PR.
- `composer qa`, `pnpm lint:scripts`, `pnpm lint:types` and `pnpm test:unit`
  pass.

### 6.4 Skill

Test the skill with `superpowers:writing-skills`. A subagent with no project
context adds a validated store to a sample folder. Check that it follows the
rules of section 5.
