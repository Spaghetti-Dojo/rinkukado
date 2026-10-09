# Router decision tree

This project is one WordPress plugin. There is no repo kind to classify.
Route by the intent of the request.

## Route by user intent (keywords)

- **Interactivity API / data-wp-* directives / @wordpress/interactivity / viewScriptModule**
  - Route → `wp-interactivity-api`.
- **Server data of a store / getConfig / getServerState / getServerContext / Zod schema**
  - Route → `interactivity-server-data`.
- **Plugins / hooks / activation hook / uninstall / Settings API / admin pages**
  - Route → `wp-plugin-development`.
- **REST endpoint / register_rest_route / permission_callback**
  - Route → `wp-rest-api`.
- **Build tooling / @wordpress/scripts / pnpm scripts / wp-env / Playwright**
  - Read `docs/development.md` and `docs/testing.md`. No skill covers this route.
- **PHPStan / static analysis / phpstan.neon / phpstan-baseline.neon**
  - Route → `wp-phpstan`.
- **Performance / caching / query profiling / editor slowness**
  - Route → `wp-performance`.
- **Security / nonces / capabilities / sanitization/escaping / uploads**
  - Route → `wp-plugin-development`.

## Guardrails (always)

- This project is a plugin. It uses Composer and pnpm. Never suggest npm or npx.
- Prefer existing lint/test scripts if present.
- If version constraints aren’t detectable, ask for target WP core and PHP versions.
