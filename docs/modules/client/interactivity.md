# Interactivity

The interactivity module holds the helpers that every store of the
Interactivity API shares. The helpers check the data that the server gives
to a store. The code lives in `sources/client/interactivity/`.

## The rule

A store checks its server data one time, in `init`, before it binds
anything. The server data is the config, the state and the context.

If a check fails, `init` reports the error with `reportError`, and returns.
The store then does nothing. There are no fallback values, because a
fallback hides a bug of the server.

The error must not leave `init`. The Interactivity API runs `init` in an
effect, and an error that leaves an effect can stop the effects of the
other stores of the page.

## Files

| File | Role |
| --- | --- |
| `zod.ts` | The single entry point of Zod. It loads the English locale one time. |
| `server-data.ts` | The functions that parse the config, the state and the context. |

### `zod.ts`

A store imports Zod only from this file:

```ts
import * as z from '../interactivity/zod';
```

The file uses `zod/mini`, which keeps the bundle small. It loads the
English locale, so an error names the key and the cause. Without the
locale, every error says only "Invalid input".

The file exports each binding by name, with `export *`. Do not change it to
an export of one namespace object. That form stops the tree shaking, and the
bundle then holds all of Zod.

### `server-data.ts`

| Function | Reads | Result |
| --- | --- | --- |
| `initializeServerConfig( store, schema )` | `getConfig()` | Returns the parsed config. |
| `initializeServerState( store, schema, state )` | `getServerState()` | Writes the parsed values into `state`. |
| `initializeServerContext( store, schema, context )` | `getServerContext()` | Writes the parsed values into `context`. |
| `sanitize( schema, data, source )` | the `data` argument | Returns the parsed data. The other three use it. |

Each function throws when the data does not match the schema. The message
names the store, the kind of data and each wrong key:

```
Store "rinkukado": the server config is not valid.
✖ Invalid input: expected int, received number
  → at timings.open
```

The state and the context of a store are reactive proxies. A store gives
the proxy to the function as an argument, and the function writes into it.
A new value for a local variable does not change a proxy.

## Use in a store

```ts
import {
	initializeServerConfig,
	initializeServerState,
} from '../interactivity/server-data';
import { configSchema, stateSchema } from './schemas';

function checkServerData(): boolean {
	try {
		serverConfig = initializeServerConfig( STORE, configSchema );
		initializeServerState( STORE, stateSchema, state );
	} catch ( error ) {
		reportError( error );

		return false;
	}

	return true;
}
```

The store calls `checkServerData()` as the first step of `init`, and
returns if the result is `false`.

[Preview](preview.md) shows a full example. Its `server.ts` also makes sure
that only the first `init` does the check.

## Schemas

- Use `z.strictObject`, so a key that the client does not know fails the
  check.
- Write exactly the keys that the server sends.
- Take the types from the schemas with `z.infer`. Do not write a type for
  server data by hand.
- Do not use `.default()` or `.catch()`.

## The skill

`.claude/skills/interactivity-server-data/` holds the same two files in its
`assets/` directory, with the full rules for a new store. The skill names no
project, so another plugin can copy it.

The skill is the source of the helpers. To change a helper, change the file
in the skill first, then copy it to `sources/client/interactivity/`. A Jest
test fails when the two copies differ.
