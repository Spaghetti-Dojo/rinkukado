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
`@wordpress/interactivity`, calls `init`, and makes sure that it reports the
error and binds no listener.
