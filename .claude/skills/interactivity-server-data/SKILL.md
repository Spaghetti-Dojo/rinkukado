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
- If the store file gets long, you can move `config()` and
  `validateServerData()` into a separate module of the store.

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
