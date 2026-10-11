# Graph Report - .  (2026-10-11)

## Corpus Check
- 6 files · ~73,120 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1092 nodes · 1614 edges · 93 communities (81 shown, 12 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.85)
- Token cost: 11,000 input · 9,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Project Docs and Directives|Project Docs and Directives]]
- [[_COMMUNITY_Module Rules and REST Library Docs|Module Rules and REST Library Docs]]
- [[_COMMUNITY_ESLint Rules|ESLint Rules]]
- [[_COMMUNITY_Server Modules and Preview Classes|Server Modules and Preview Classes]]
- [[_COMMUNITY_Driver and Intent Tests|Driver and Intent Tests]]
- [[_COMMUNITY_Plans, Specs and Commit Rules|Plans, Specs and Commit Rules]]
- [[_COMMUNITY_Server Data and PHPStan Skills|Server Data and PHPStan Skills]]
- [[_COMMUNITY_Route and Middleware Tests|Route and Middleware Tests]]
- [[_COMMUNITY_Root TypeScript Config|Root TypeScript Config]]
- [[_COMMUNITY_Client Network Fetcher|Client Network Fetcher]]
- [[_COMMUNITY_Client Event Binding|Client Event Binding]]
- [[_COMMUNITY_Preview Store Entry|Preview Store Entry]]
- [[_COMMUNITY_REST Content Types Skill|REST Content Types Skill]]
- [[_COMMUNITY_Interactivity Module Docs|Interactivity Module Docs]]
- [[_COMMUNITY_Plugin Development Skill|Plugin Development Skill]]
- [[_COMMUNITY_Event Test Harness|Event Test Harness]]
- [[_COMMUNITY_QA Hook Tests|QA Hook Tests]]
- [[_COMMUNITY_Interactivity Mock|Interactivity Mock]]
- [[_COMMUNITY_Link Policy Tests|Link Policy Tests]]
- [[_COMMUNITY_pnpm Scripts|pnpm Scripts]]
- [[_COMMUNITY_Performance Measurement Skill|Performance Measurement Skill]]
- [[_COMMUNITY_Schema Tests|Schema Tests]]
- [[_COMMUNITY_REST Auth and Query Performance|REST Auth and Query Performance]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_DOM Helpers|DOM Helpers]]
- [[_COMMUNITY_Node Dev Dependencies|Node Dev Dependencies]]
- [[_COMMUNITY_Preview Repository|Preview Repository]]
- [[_COMMUNITY_Interactivity Server Data Skill|Interactivity Server Data Skill]]
- [[_COMMUNITY_package.json Metadata|package.json Metadata]]
- [[_COMMUNITY_Popover Position|Popover Position]]
- [[_COMMUNITY_PHPStan Inspect Script|PHPStan Inspect Script]]
- [[_COMMUNITY_Server Data Helpers|Server Data Helpers]]
- [[_COMMUNITY_Composer Plugins Config|Composer Plugins Config]]
- [[_COMMUNITY_Composer Scripts|Composer Scripts]]
- [[_COMMUNITY_Client TypeScript Config|Client TypeScript Config]]
- [[_COMMUNITY_Caching Middleware|Caching Middleware]]
- [[_COMMUNITY_Module Entry Points|Module Entry Points]]
- [[_COMMUNITY_composer.json Metadata|composer.json Metadata]]
- [[_COMMUNITY_Composer Dev Dependencies|Composer Dev Dependencies]]
- [[_COMMUNITY_Autoload and Object Cache Skill|Autoload and Object Cache Skill]]
- [[_COMMUNITY_REST Routes Skill|REST Routes Skill]]
- [[_COMMUNITY_Tests TypeScript Config|Tests TypeScript Config]]
- [[_COMMUNITY_Excerpt Class|Excerpt Class]]
- [[_COMMUNITY_Store Init Tests|Store Init Tests]]
- [[_COMMUNITY_Middleware Process|Middleware Process]]
- [[_COMMUNITY_Preview Request Schema|Preview Request Schema]]
- [[_COMMUNITY_Plugin Detect Script|Plugin Detect Script]]
- [[_COMMUNITY_Stylelint Config|Stylelint Config]]
- [[_COMMUNITY_Integration Tester Agent|Integration Tester Agent]]
- [[_COMMUNITY_github-commit Skill|github-commit Skill]]
- [[_COMMUNITY_Cron and HTTP Performance|Cron and HTTP Performance]]
- [[_COMMUNITY_Error Factory|Error Factory]]
- [[_COMMUNITY_Performance Inspect Script|Performance Inspect Script]]
- [[_COMMUNITY_Permalinks E2E Spec|Permalinks E2E Spec]]
- [[_COMMUNITY_Dev Autoload|Dev Autoload]]
- [[_COMMUNITY_Jest Config|Jest Config]]
- [[_COMMUNITY_Middleware Contract|Middleware Contract]]
- [[_COMMUNITY_SCSS Rules|SCSS Rules]]
- [[_COMMUNITY_Autoload|Autoload]]
- [[_COMMUNITY_Composer Extra|Composer Extra]]
- [[_COMMUNITY_QA Hook Script|QA Hook Script]]
- [[_COMMUNITY_Handover E2E Spec|Handover E2E Spec]]
- [[_COMMUNITY_Skill Assets Test|Skill Assets Test]]
- [[_COMMUNITY_Composer Requirements|Composer Requirements]]
- [[_COMMUNITY_Node Dependencies|Node Dependencies]]
- [[_COMMUNITY_Node Engines|Node Engines]]
- [[_COMMUNITY_Repository Metadata|Repository Metadata]]
- [[_COMMUNITY_Preview Endpoint Test|Preview Endpoint Test]]
- [[_COMMUNITY_Prettier Config|Prettier Config]]
- [[_COMMUNITY_package.json Rules|package.json Rules]]
- [[_COMMUNITY_TypeScript Rules|TypeScript Rules]]
- [[_COMMUNITY_E2E Thumbnail Fixture|E2E Thumbnail Fixture]]
- [[_COMMUNITY_E2E Workflow|E2E Workflow]]
- [[_COMMUNITY_JS QA Workflow|JS QA Workflow]]
- [[_COMMUNITY_PHP QA Workflow|PHP QA Workflow]]

## God Nodes (most connected - your core abstractions)
1. `rules` - 61 edges
2. `Link Preview Popover Design spec` - 28 edges
3. `compilerOptions` - 25 edges
4. `Preview Client Module Document` - 24 edges
5. `Preview Server Module Document` - 18 edges
6. `Interactivity Server Data Design spec` - 17 edges
7. `scripts` - 16 edges
8. `interactivity-server-data Skill` - 16 edges
9. `WP Performance Skill (backend-only)` - 16 edges
10. `Preview\Module` - 16 edges

## Surprising Connections (you probably didn't know these)
- `initializeServerContext()` --calls--> `getServerContext()`  [INFERRED]
  .claude/skills/interactivity-server-data/assets/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerConfig()` --calls--> `getConfig()`  [INFERRED]
  sources/client/interactivity/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerState()` --calls--> `getServerState()`  [INFERRED]
  sources/client/interactivity/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerConfig()` --calls--> `getConfig()`  [INFERRED]
  .claude/skills/interactivity-server-data/assets/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerState()` --calls--> `getServerState()`  [INFERRED]
  .claude/skills/interactivity-server-data/assets/server-data.ts → tests/unit/client/interactivity-mock.ts

## Import Cycles
- 1-file cycle: `webpack.config.js -> webpack.config.js`

## Hyperedges (group relationships)
- **Preview route registration with the REST library** — specs_2026_10_11_rest_library_design_preview_module, server_rest_route, specs_2026_10_11_rest_library_design_preview_rest_schema, specs_2026_10_11_rest_library_design_preview_rest_controller, server_rest_errorcatch, server_rest_caching [EXTRACTED 1.00]
- **Server data contract between Popover and the client store** — server_popover_popoverregion, server_popover_config, server_popover_interactivity_config, server_popover_interactivity_state, server_popover_strict_schemas, server_popover_rinkukado_store [EXTRACTED 1.00]
- **Module chain: Rest, Preview, Popover share the container services** — server_rest_module, specs_2026_10_11_rest_library_design_preview_module, server_popover_module, server_popover_config, specs_2026_10_11_rest_library_design_bootstrap [INFERRED 0.85]

## Communities (93 total, 12 thin omitted)

### Community 0 - "Project Docs and Directives"
Cohesion: 0.06
Nodes (70): Rinkukado Project Directives, Keep Module Documents in Sync With Code, Shared Interactivity Helpers Are a Copy of the Skill Assets, Stop and Confirm After Each Plan Step, Stop Hook Runs qa.sh, Preview Client Module Document, context.ts (EventContext, Refs), dom.ts (DOM helpers) (+62 more)

### Community 1 - "Module Rules and REST Library Docs"
Cohesion: 0.07
Nodes (63): Server Module Architecture (rules), Adapt to Needs (no unused constants or parameters), ExecutableModule (default entry point), Static new() Factory + Private Constructor, Feature Class Pattern (final readonly), First-Class Callable Hook Callbacks, Hook Registration in init(), Inpsyde Modularity (+55 more)

### Community 2 - "ESLint Rules"
Cohesion: 0.03
Nodes (61): rules, complexity, consistent-return, dot-notation, init-declarations, max-classes-per-file, max-depth, max-lines (+53 more)

### Community 3 - "Server Modules and Preview Classes"
Cohesion: 0.06
Nodes (33): Config, ContainerInterface, ErrorFactory, Excerpt, ExecutableModule, ModuleClassNameIdTrait, Module, Module (+25 more)

### Community 4 - "Driver and Intent Tests"
Cohesion: 0.07
Nodes (46): Calls, createEffects(), driverWith(), hoveredBAfterA(), openLinkA(), recorder(), timings, enter() (+38 more)

### Community 5 - "Plans, Specs and Commit Rules"
Cohesion: 0.05
Nodes (32): Git Commit Instructions, Conventional Commits 1.0.0 format, github-commit skill (.claude/skills/github-commit/SKILL.md), Link Preview Popover Implementation Plan, Plan 1 global constraints, Coverage of the specification table, Plan 1 tasks 1-15 (build pipeline to final gate), Plan 2 global constraints (Zod import, ESLint limits) (+24 more)

### Community 6 - "Server Data and PHPStan Skills"
Cohesion: 0.07
Nodes (43): getServerContext Returns the Merged Context (inherited keys), No Fallback Values for Server Data, PHPStan Configuration (WordPress), PHPStan Baseline Workflow, Minimal phpstan.neon Template, Interactivity Debugging Checklist, Router Regions attachTo Property, getServerState and getServerContext Reset Between Page Transitions (+35 more)

### Community 7 - "Route and Middleware Tests"
Cohesion: 0.06
Nodes (21): ErrorCatch, MiddlewareProcessTest, Route, FakeController, FakeSchema, RestRegistTrait, Schema, ErrorFactory (+13 more)

### Community 8 - "Root TypeScript Config"
Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, baseUrl, checkJs, esModuleInterop, exactOptionalPropertyTypes, isolatedModules, jsx (+19 more)

### Community 9 - "Client Network Fetcher"
Cohesion: 0.11
Nodes (19): ENDPOINT, FetchDouble, payload, Resolver, Availability, createFetcher(), Endpoint, Fetcher (+11 more)

### Community 10 - "Client Event Binding"
Cohesion: 0.15
Nodes (19): linkOf(), staysInDialog(), staysInLink(), dialogHandlers, Handler, handleViewportFrame(), leaveUnlessInDialog(), linkLeftViewport() (+11 more)

### Community 11 - "Preview Store Entry"
Cohesion: 0.12
Nodes (15): resolveRoot(), applyPreview(), close(), context, driver, endpointOf(), fetcher, open() (+7 more)

### Community 12 - "REST Content Types Skill"
Cohesion: 0.16
Nodes (21): REST Custom Content Types Reference, register_post_type_args / register_taxonomy_args Filters, rest_route_for_post / rest_route_for_term Filters, show_in_rest / rest_base / rest_controller_class, REST Discovery and Global Parameters Reference, REST API Discovery (Link header, rel=https://api.w.org/), Global Parameters (_fields, _embed, _method, _envelope, _jsonp), REST Pagination (page, per_page, X-WP-Total, X-WP-TotalPages) (+13 more)

### Community 13 - "Interactivity Module Docs"
Cohesion: 0.19
Nodes (18): Interactivity module document, Reactive proxy passed as an argument, Schema rules (z.strictObject, z.infer, no .default/.catch), Rule: check server data one time in init, no fallbacks, zod/mini with export * and the English locale, Kind, Source, Interactivity Server Data Implementation Plan (+10 more)

### Community 14 - "Plugin Development Skill"
Cohesion: 0.16
Nodes (19): Data Storage, Cron and Upgrades Reference, Options API vs Custom Tables, $wpdb->prepare() and the %i Identifier Placeholder, Activation, Deactivation, Uninstall Reference, register_activation_hook / register_deactivation_hook, Flush Rewrite Rules Only After Registration, Uninstall (uninstall.php / register_uninstall_hook), Plugin Security Guardrails Reference (+11 more)

### Community 15 - "Event Test Harness"
Cohesion: 0.17
Nodes (11): bindHarness(), createHarness(), createRefs(), Harness, EventContext, Refs, Mode, attach() (+3 more)

### Community 16 - "QA Hook Tests"
Cohesion: 0.28
Nodes (13): assert_contains(), assert_empty(), assert_not_contains(), bad(), ok(), t_delete_only(), t_fixer_code_ignored(), t_not_git() (+5 more)

### Community 17 - "Interactivity Mock"
Cohesion: 0.17
Nodes (11): getServerContext(), server, stores, schema, source, valid, initializeServerConfig(), initializeServerContext() (+3 more)

### Community 18 - "Link Policy Tests"
Cohesion: 0.20
Nodes (12): options, plainOptions, policyOptions(), homePathOf(), isHTTPProtocol(), isPreviewable(), isValidPath(), LinkFacts (+4 more)

### Community 19 - "pnpm Scripts"
Cohesion: 0.12
Nodes (16): scripts, build, build:dev, format, init:template, lint:scripts, lint:scripts:fix, lint:styles (+8 more)

### Community 20 - "Performance Measurement Skill"
Cohesion: 0.20
Nodes (16): Measurement Reference (profiling vs benchmarking), APM and Profilers (New Relic, Datadog, Blackfire, Tideways, XHProf, Xdebug), Baseline First, Fixed Scenario, Multiple Samples, Server-Timing Reference, Performance Lab Plugin, Server-Timing Header, WP-CLI Profile Reference, wp profile eval (+8 more)

### Community 21 - "Schema Tests"
Cohesion: 0.23
Nodes (8): config, state, configSchema, stateSchema, timingsSchema, ServerConfig, ServerState, Thumbnail

### Community 22 - "REST Auth and Query Performance"
Cohesion: 0.17
Nodes (15): REST Authentication Reference, Application Passwords, Auth Plugins (OAuth 1.0a, JWT), Cookie Authentication + X-WP-Nonce (wp_rest), Database / Query Performance Reference, Expensive Meta Queries, N+1 Query Pattern, Object Caching Reference (+7 more)

### Community 23 - "ESLint Config"
Cohesion: 0.14
Nodes (13): env, browser, es2024, extends, overrides, parser, parserOptions, ecmaVersion (+5 more)

### Community 24 - "DOM Helpers"
Cohesion: 0.24
Nodes (10): options, isInContainer(), modeOf(), placeDialog(), placeWithAnchor(), placeWithRect(), previewableLink(), supportsAnchor() (+2 more)

### Community 25 - "Node Dev Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, clean-webpack-plugin, @playwright/test, sass, stylelint-plugin-logical-css, ts-node, @types/jest, @types/node (+5 more)

### Community 26 - "Preview Repository"
Cohesion: 0.26
Nodes (3): Repository, self, WP_Post

### Community 27 - "Interactivity Server Data Skill"
Cohesion: 0.24
Nodes (12): interactivity-server-data Skill, schemas.ts (configSchema, stateSchema, contextSchema), Server Data Helpers (initializeServerConfig, initializeServerState, initializeServerContext), Types Inferred from Schemas (types.ts, z.infer), Validate Server Data in the init Callback, Validation Sequence: Config, State, Context, zod.ts Helper (only import of z, loads the English locale), Schema Rules Reference (+4 more)

### Community 28 - "package.json Metadata"
Cohesion: 0.17
Nodes (10): author, bugs, url, description, homepage, keywords, license, name (+2 more)

### Community 29 - "Popover Position"
Cohesion: 0.22
Nodes (9): popover, viewport, clamp(), computePosition(), Placement, Rect, Size, Viewport (+1 more)

### Community 30 - "PHPStan Inspect Script"
Cohesion: 0.35
Nodes (10): buildConfigHints(), buildReport(), extractStubPackageReferences(), findPhpstanScripts(), isFile(), main(), normalizeComposerScript(), readJsonSafe() (+2 more)

### Community 31 - "Server Data Helpers"
Cohesion: 0.27
Nodes (8): initializeServerConfig(), initializeServerContext(), initializeServerState(), Kind, sanitize(), Source, getConfig(), getServerState()

### Community 32 - "Composer Plugins Config"
Cohesion: 0.20
Nodes (10): composer/installers, dealerdirect/phpcodesniffer-composer-installer, pestphp/pest-plugin, roots/wordpress-core-installer, config, allow-plugins, apcu-autoloader, classmap-authoritative (+2 more)

### Community 33 - "Composer Scripts"
Cohesion: 0.20
Nodes (10): scripts, analysis, cs, cs:fix, qa, test:integration, test:integration:coverage, test:unit (+2 more)

### Community 34 - "Client TypeScript Config"
Cohesion: 0.20
Nodes (9): compilerOptions, exactOptionalPropertyTypes, module, moduleResolution, noUnusedLocals, noUnusedParameters, verbatimModuleSyntax, extends (+1 more)

### Community 35 - "Caching Middleware"
Cohesion: 0.20
Nodes (6): Middleware, Caching, self, WP_Error, WP_REST_Request, WP_REST_Response

### Community 37 - "composer.json Metadata"
Cohesion: 0.22
Nodes (8): authors, description, license, minimum-stability, name, prefer-stable, repositories, type

### Community 38 - "Composer Dev Dependencies"
Cohesion: 0.22
Nodes (9): require-dev, bnf/phpstan-psr-container, brain/monkey, mockery/mockery, pestphp/pest, phpstan/phpstan, roots/wordpress, syde/phpcs (+1 more)

### Community 39 - "Autoload and Object Cache Skill"
Cohesion: 0.36
Nodes (9): Autoloaded Options Reference, Autoload Bloat, Fix Pattern: Stop Autoloading Large Blobs, Persistent Object Cache Drop-in (object-cache.php), WP-CLI Doctor Reference, autoload-options-size Check, constant-savequeries-falsy / constant-wp-debug-falsy Checks, wp doctor Command (+1 more)

### Community 40 - "REST Routes Skill"
Cohesion: 0.31
Nodes (9): REST Routes and Endpoints Reference, Endpoint args (validate_callback, sanitize_callback), WP_REST_Server Method Constants, Route Namespacing (vendor/v1), permission_callback (required), register_rest_route on rest_api_init, Return Values (rest_ensure_response, WP_REST_Response, WP_Error), Sanitize on Input, Escape on Output (+1 more)

### Community 41 - "Tests TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, exactOptionalPropertyTypes, noUnusedLocals, noUnusedParameters, types, extends, include

### Community 42 - "Excerpt Class"
Cohesion: 0.29
Nodes (3): Excerpt, self, WP_Post

### Community 43 - "Store Init Tests"
Cohesion: 0.29
Nodes (4): config, Definition, load(), state

### Community 44 - "Middleware Process"
Cohesion: 0.29
Nodes (4): MiddlewareProcess, WP_Error, WP_REST_Request, WP_REST_Response

### Community 46 - "Plugin Detect Script"
Cohesion: 0.43
Nodes (5): DEFAULT_IGNORES, findFilesRecursive(), main(), parsePluginHeader(), readFileSafe()

### Community 47 - "Stylelint Config"
Cohesion: 0.29
Nodes (6): extends, rules, logical-css/require-logical-keywords, logical-css/require-logical-properties, logical-css/require-logical-units, selector-class-pattern

### Community 48 - "Integration Tester Agent"
Cohesion: 0.33
Nodes (6): pest-integration-tester Agent, Assert the Result, Not the Registration Call, tests/bootstrap-integration.php (installs WordPress on SQLite), Clean Up Created Data, Skip, Do Not Fail, Without the Build Directory, syde/wp-phpunit-integration

### Community 49 - "github-commit Skill"
Cohesion: 0.33
Nodes (6): github-commit Skill, Breaking Change Marker (! and BREAKING CHANGE footer), Commit Scopes (server, client, package, tests, e2e, deps, claude, wp-env, docs), Commit Types (feat, fix, docs, test, refactor, perf, style, build, ci, chore, revert), Conventional Commits 1.0.0, Title 50 Characters, Body 72 Characters, Body Explains Why

### Community 50 - "Cron and HTTP Performance"
Cohesion: 0.33
Nodes (6): WP-Cron Performance Reference, Cron Fix Patterns (de-duplicate, idempotent, off-request), WP-CLI Cron Commands, Idempotent Cron Tasks with Manual Trigger, HTTP API (Remote Requests) Reference, Remote Request Fix Patterns (timeouts, cache, batch, async)

### Community 52 - "Performance Inspect Script"
Cohesion: 0.60
Nodes (5): canRun(), existsFile(), main(), parseArgs(), runWp()

### Community 53 - "Permalinks E2E Spec"
Cohesion: 0.40
Nodes (4): open(), setPlainPermalinks(), Structure, structures

### Community 54 - "Dev Autoload"
Cohesion: 0.40
Nodes (5): autoload-dev, psr-4, SpaghettiDojo\\Rinkukado\\Tests\\, SpaghettiDojo\\Rinkukado\\Tests\\Integration\\, SpaghettiDojo\\Rinkukado\\Tests\\Unit\\

### Community 55 - "Jest Config"
Cohesion: 0.40
Nodes (5): jest, moduleNameMapper, preset, \\.(scss|css)$, ^@wordpress/interactivity$

### Community 56 - "Middleware Contract"
Cohesion: 0.40
Nodes (4): __invoke(), WP_Error, WP_REST_Request, WP_REST_Response

### Community 57 - "SCSS Rules"
Cohesion: 0.40
Nodes (5): SCSS Rules, BEM Naming Convention and Rules, index.scss as Package Public API (@forward, no @import), Mobile First Approach, units.rem() and units.em() Mixins (_units.scss)

### Community 58 - "Autoload"
Cohesion: 0.50
Nodes (4): autoload, files, psr-4, SpaghettiDojo\\Rinkukado\\

### Community 59 - "Composer Extra"
Cohesion: 0.50
Nodes (4): extra, installer-paths, wordpress-install-dir, vendor/wordpress/wordpress/wp-content/plugins/{$name}

### Community 60 - "QA Hook Script"
Cohesion: 0.83
Nodes (3): run_fix(), run_step(), qa.sh script

### Community 62 - "Handover E2E Spec"
Cohesion: 0.67
Nodes (3): Anchors, anchorsOf(), expectAnchoredTo()

### Community 65 - "Composer Requirements"
Cohesion: 0.67
Nodes (3): require, inpsyde/modularity, php

### Community 67 - "Node Dependencies"
Cohesion: 0.67
Nodes (3): dependencies, @wordpress/interactivity, zod

### Community 68 - "Node Engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 69 - "Repository Metadata"
Cohesion: 0.67
Nodes (3): repository, type, url

## Ambiguous Edges - Review These
- `Link Preview Popover Implementation Plan` → `Interactivity Server Data Implementation Plan`  [AMBIGUOUS]
  docs/superpowers/plans/2026-10-01-interactivity-server-data.md · relation: conceptually_related_to
- `Modes rule: two media queries choose three modes` → `Plan 1 global constraints`  [AMBIGUOUS]
  docs/superpowers/plans/2026-09-04-link-preview-popover.md · relation: conceptually_related_to
- `Preview\Rest\Repository` → `Preview\Rest\Excerpt`  [AMBIGUOUS]
  docs/superpowers/specs/2026-10-11-rest-library-design.md · relation: conceptually_related_to

## Knowledge Gaps
- **338 isolated node(s):** `Kind`, `Source`, `DEFAULT_IGNORES`, `path`, `extends` (+333 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Link Preview Popover Implementation Plan` and `Interactivity Server Data Implementation Plan`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Modes rule: two media queries choose three modes` and `Plan 1 global constraints`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Preview\Rest\Repository` and `Preview\Rest\Excerpt`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Link Preview Popover Design spec` connect `Plans, Specs and Commit Rules` to `Interactivity Module Docs`, `Driver and Intent Tests`, `Popover Position`, `Route and Middleware Tests`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `Interactivity Server Data Design spec` connect `Interactivity Module Docs` to `Schema Tests`, `Interactivity Server Data Skill`, `Plans, Specs and Commit Rules`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `interactivity-server-data Skill` connect `Interactivity Server Data Skill` to `Interactivity Module Docs`, `Server Data and PHPStan Skills`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `Kind`, `Source`, `DEFAULT_IGNORES` to the rest of the system?**
  _362 weakly-connected nodes found - possible documentation gaps or missing edges._