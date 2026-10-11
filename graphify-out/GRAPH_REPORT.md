# Graph Report - .  (2026-10-11)

## Corpus Check
- 32 files · ~75,040 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1073 nodes · 1626 edges · 95 communities (83 shown, 12 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.85)
- Token cost: 32,000 input · 11,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Event and DOM Tests|Event and DOM Tests]]
- [[_COMMUNITY_ESLint Rules|ESLint Rules]]
- [[_COMMUNITY_REST API and Plugin Skills|REST API and Plugin Skills]]
- [[_COMMUNITY_Driver and Intent Tests|Driver and Intent Tests]]
- [[_COMMUNITY_Preview Server Module|Preview Server Module]]
- [[_COMMUNITY_Server Data and PHPStan Skills|Server Data and PHPStan Skills]]
- [[_COMMUNITY_Performance Skill References|Performance Skill References]]
- [[_COMMUNITY_Module Entry Points|Module Entry Points]]
- [[_COMMUNITY_Root TypeScript Config|Root TypeScript Config]]
- [[_COMMUNITY_Route and Middleware Tests|Route and Middleware Tests]]
- [[_COMMUNITY_REST Library Plan and Docs|REST Library Plan and Docs]]
- [[_COMMUNITY_Development and QA Docs|Development and QA Docs]]
- [[_COMMUNITY_Customize and Popover Docs|Customize and Popover Docs]]
- [[_COMMUNITY_Preview Store Entry|Preview Store Entry]]
- [[_COMMUNITY_Preview Client Module Docs|Preview Client Module Docs]]
- [[_COMMUNITY_Server Data Helpers|Server Data Helpers]]
- [[_COMMUNITY_QA Hook Tests|QA Hook Tests]]
- [[_COMMUNITY_Client Network Fetcher|Client Network Fetcher]]
- [[_COMMUNITY_Project Directives|Project Directives]]
- [[_COMMUNITY_Link Policy Tests|Link Policy Tests]]
- [[_COMMUNITY_Schema Tests|Schema Tests]]
- [[_COMMUNITY_pnpm Scripts|pnpm Scripts]]
- [[_COMMUNITY_Interactivity Module Docs|Interactivity Module Docs]]
- [[_COMMUNITY_Popover Plan and Spec|Popover Plan and Spec]]
- [[_COMMUNITY_Server Data Tests|Server Data Tests]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Node Dev Dependencies|Node Dev Dependencies]]
- [[_COMMUNITY_Interactivity Server Data Skill|Interactivity Server Data Skill]]
- [[_COMMUNITY_package.json Metadata|package.json Metadata]]
- [[_COMMUNITY_Popover Region|Popover Region]]
- [[_COMMUNITY_PHPStan Inspect Script|PHPStan Inspect Script]]
- [[_COMMUNITY_Composer Plugins Config|Composer Plugins Config]]
- [[_COMMUNITY_Composer Scripts|Composer Scripts]]
- [[_COMMUNITY_Client TypeScript Config|Client TypeScript Config]]
- [[_COMMUNITY_Caching Middleware|Caching Middleware]]
- [[_COMMUNITY_Server Config Class|Server Config Class]]
- [[_COMMUNITY_Network Tests|Network Tests]]
- [[_COMMUNITY_composer.json Metadata|composer.json Metadata]]
- [[_COMMUNITY_Composer Dev Dependencies|Composer Dev Dependencies]]
- [[_COMMUNITY_Commit Rules and Popover Plan|Commit Rules and Popover Plan]]
- [[_COMMUNITY_Middleware Process|Middleware Process]]
- [[_COMMUNITY_Preview Endpoint Docs|Preview Endpoint Docs]]
- [[_COMMUNITY_Tests TypeScript Config|Tests TypeScript Config]]
- [[_COMMUNITY_ErrorCatch Middleware|ErrorCatch Middleware]]
- [[_COMMUNITY_Excerpt Class|Excerpt Class]]
- [[_COMMUNITY_Store Init Tests|Store Init Tests]]
- [[_COMMUNITY_Build Pipeline Plan|Build Pipeline Plan]]
- [[_COMMUNITY_Preview Request Schema|Preview Request Schema]]
- [[_COMMUNITY_Server Module Rules|Server Module Rules]]
- [[_COMMUNITY_Plugin Detect Script|Plugin Detect Script]]
- [[_COMMUNITY_Stylelint Config|Stylelint Config]]
- [[_COMMUNITY_Integration Tester Agent|Integration Tester Agent]]
- [[_COMMUNITY_github-commit Skill|github-commit Skill]]
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
3. `Preview Client Module Document` - 26 edges
4. `compilerOptions` - 25 edges
5. `Preview Server Module Document` - 21 edges
6. `Popover Server Module Document` - 18 edges
7. `REST Library Document` - 18 edges
8. `Interactivity Server Data Design spec` - 17 edges
9. `REST Library Implementation Plan` - 17 edges
10. `scripts` - 16 edges

## Surprising Connections (you probably didn't know these)
- `REST Library Does Not Use the Plugin` --semantically_similar_to--> `Shared Interactivity Helpers Are a Copy of the Skill Assets`  [INFERRED] [semantically similar]
  docs/modules/server/rest.md → .claude/CLAUDE.md
- `initializeServerConfig()` --calls--> `getConfig()`  [INFERRED]
  sources/client/interactivity/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerState()` --calls--> `getServerState()`  [INFERRED]
  sources/client/interactivity/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerContext()` --calls--> `getServerContext()`  [INFERRED]
  sources/client/interactivity/server-data.ts → tests/unit/client/interactivity-mock.ts
- `Popover\Module` --implements--> `ExecutableModule Default Pattern`  [INFERRED]
  docs/modules/server/popover.md → .claude/rules/module.instructions.md

## Import Cycles
- 1-file cycle: `webpack.config.js -> webpack.config.js`

## Hyperedges (group relationships)
- **Intent Pipeline of the Preview Client** — client_preview_events_ts, client_preview_driver_ts, client_preview_intent_ts, client_preview_index_module_ts, client_preview_network_ts [EXTRACTED 1.00]
- **Server Data Contract Between Popover and Client Store** — server_popover_popoverregion, server_popover_interactivity_config, server_popover_interactivity_state, client_preview_schemas_ts, client_preview_server_ts [EXTRACTED 1.00]
- **Registration of the Preview Route Through the REST Library** — server_preview_module, server_rest_route, server_preview_rest_schema, server_preview_rest_controller, server_rest_errorcatch, server_rest_caching [EXTRACTED 1.00]

## Communities (95 total, 12 thin omitted)

### Community 0 - "Event and DOM Tests"
Cohesion: 0.06
Nodes (49): options, bindHarness(), createHarness(), createRefs(), Harness, popover, viewport, EventContext (+41 more)

### Community 1 - "ESLint Rules"
Cohesion: 0.03
Nodes (61): rules, complexity, consistent-return, dot-notation, init-declarations, max-classes-per-file, max-depth, max-lines (+53 more)

### Community 2 - "REST API and Plugin Skills"
Cohesion: 0.06
Nodes (55): REST Authentication Reference, Application Passwords, Auth Plugins (OAuth 1.0a, JWT), Cookie Authentication + X-WP-Nonce (wp_rest), Cron Fix Patterns (de-duplicate, idempotent, off-request), REST Custom Content Types Reference, register_post_type_args / register_taxonomy_args Filters, rest_route_for_post / rest_route_for_term Filters (+47 more)

### Community 3 - "Driver and Intent Tests"
Cohesion: 0.07
Nodes (46): Calls, createEffects(), driverWith(), hoveredBAfterA(), openLinkA(), recorder(), timings, enter() (+38 more)

### Community 4 - "Preview Server Module"
Cohesion: 0.06
Nodes (25): Config, Excerpt, Repository, Controller, __invoke(), config(), repository(), request() (+17 more)

### Community 5 - "Server Data and PHPStan Skills"
Cohesion: 0.07
Nodes (43): getServerContext Returns the Merged Context (inherited keys), No Fallback Values for Server Data, PHPStan Configuration (WordPress), PHPStan Baseline Workflow, Minimal phpstan.neon Template, Interactivity Debugging Checklist, Router Regions attachTo Property, getServerState and getServerContext Reset Between Page Transitions (+35 more)

### Community 6 - "Performance Skill References"
Cohesion: 0.09
Nodes (40): Autoloaded Options Reference, Autoload Bloat, Fix Pattern: Stop Autoloading Large Blobs, WP-Cron Performance Reference, WP-CLI Cron Commands, Database / Query Performance Reference, Expensive Meta Queries, N+1 Query Pattern (+32 more)

### Community 7 - "Module Entry Points"
Cohesion: 0.09
Nodes (14): ContainerInterface, ErrorFactory, ExecutableModule, ModuleClassNameIdTrait, Module, ScriptModules, Module, Module (+6 more)

### Community 8 - "Root TypeScript Config"
Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, baseUrl, checkJs, esModuleInterop, exactOptionalPropertyTypes, isolatedModules, jsx (+19 more)

### Community 9 - "Route and Middleware Tests"
Cohesion: 0.08
Nodes (16): MiddlewareProcessTest, Route, FakeController, FakeSchema, RestRegistTrait, Schema, Controller, Middleware (+8 more)

### Community 10 - "REST Library Plan and Docs"
Cohesion: 0.19
Nodes (22): PHP Unit Tests (Pest, Brain Monkey), Task 2: Add the Preview Module and Free the Library, REST Library Document, ArchTest (tests/unit/server/Rest/ArchTest.php), Rest\Middlewares\Caching, Rest\Controller Contract, Rest\Middlewares\ErrorCatch, Rest\ErrorFactory (+14 more)

### Community 11 - "Development and QA Docs"
Cohesion: 0.17
Nodes (20): Stop Hook Runs qa.sh, media-queries.ts (mode reporter), Preview Modes (hover, sheet, off), Development Document, Quality Assurance Commands, Requirements (WordPress 7.1, PHP 8.4, Node 24, pnpm 10), wp-env Local Environment, Testing Document (+12 more)

### Community 12 - "Customize and Popover Docs"
Cohesion: 0.20
Nodes (20): schemas.ts (Zod schemas), types.ts (shared types), Plugin Filters (No Settings Page), Popover Server Module Document, Config (sources/server/Config.php), Single Preview Dialog on wp_footer, Filter rinkukado.popover.container-selector, Filter rinkukado.popover.deny-class (+12 more)

### Community 13 - "Preview Store Entry"
Cohesion: 0.13
Nodes (14): resolveRoot(), applyPreview(), close(), context, driver, endpointOf(), fetcher, open() (+6 more)

### Community 14 - "Preview Client Module Docs"
Cohesion: 0.24
Nodes (18): Preview Client Module Document, context.ts (EventContext, Refs), dom.ts (DOM helpers), driver.ts (intent driver and timer), events.ts (delegated listeners), Fetcher Cache per Page Session, index.module.ts (rinkukado store), Intent Machine (idle, intent, open) (+10 more)

### Community 15 - "Server Data Helpers"
Cohesion: 0.15
Nodes (11): initializeServerConfig(), initializeServerContext(), initializeServerState(), Kind, sanitize(), Source, getConfig(), getServerContext() (+3 more)

### Community 16 - "QA Hook Tests"
Cohesion: 0.28
Nodes (13): assert_contains(), assert_empty(), assert_not_contains(), bad(), ok(), t_delete_only(), t_fixer_code_ignored(), t_not_git() (+5 more)

### Community 17 - "Client Network Fetcher"
Cohesion: 0.17
Nodes (13): Availability, Fetcher, FetchState, hasPreviewFields(), headersOf(), LoadResult, loadWithCache(), Pending (+5 more)

### Community 18 - "Project Directives"
Cohesion: 0.17
Nodes (16): Rinkukado Project Directives, Keep Module Documents in Sync With Code, Shared Interactivity Helpers Are a Copy of the Skill Assets, Stop and Confirm After Each Plan Step, server-data.ts (shared helpers), Customize Document, package() Extension Point, REST Library Implementation Plan (+8 more)

### Community 19 - "Link Policy Tests"
Cohesion: 0.20
Nodes (12): options, plainOptions, policyOptions(), homePathOf(), isHTTPProtocol(), isPreviewable(), isValidPath(), LinkFacts (+4 more)

### Community 20 - "Schema Tests"
Cohesion: 0.21
Nodes (9): config, state, configSchema, stateSchema, timingsSchema, Preview, ServerConfig, ServerState (+1 more)

### Community 21 - "pnpm Scripts"
Cohesion: 0.12
Nodes (16): scripts, build, build:dev, format, init:template, lint:scripts, lint:scripts:fix, lint:styles (+8 more)

### Community 22 - "Interactivity Module Docs"
Cohesion: 0.22
Nodes (14): Interactivity module document, Schema rules (z.strictObject, z.infer, no .default/.catch), Rule: check server data one time in init, no fallbacks, zod/mini with export * and the English locale, Interactivity Server Data Implementation Plan, Review focus cases, Changes to the spec found while planning, Plan 2 tasks 1-5 (shared module, schemas, init check, skill, verification) (+6 more)

### Community 23 - "Popover Plan and Spec"
Cohesion: 0.16
Nodes (13): Link Preview Popover Design spec, Keyboard and assistive technology rules, Breakpoint 782px ($break-medium) as own SCSS variable, Excerpt: manual excerpt, else core fallback, Failure rules: unavailable marker, Flat thumbnail state keys, Konomi Rest library, copied and adapted, Modes rule: two media queries choose three modes (+5 more)

### Community 24 - "Server Data Tests"
Cohesion: 0.25
Nodes (12): Reactive proxy passed as an argument, schema, source, valid, initializeServerConfig(), initializeServerContext(), initializeServerState(), Kind (+4 more)

### Community 25 - "ESLint Config"
Cohesion: 0.14
Nodes (13): env, browser, es2024, extends, overrides, parser, parserOptions, ecmaVersion (+5 more)

### Community 26 - "Node Dev Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, clean-webpack-plugin, @playwright/test, sass, stylelint-plugin-logical-css, ts-node, @types/jest, @types/node (+5 more)

### Community 27 - "Interactivity Server Data Skill"
Cohesion: 0.24
Nodes (12): interactivity-server-data Skill, schemas.ts (configSchema, stateSchema, contextSchema), Server Data Helpers (initializeServerConfig, initializeServerState, initializeServerContext), Types Inferred from Schemas (types.ts, z.infer), Validate Server Data in the init Callback, Validation Sequence: Config, State, Context, zod.ts Helper (only import of z, loads the English locale), Schema Rules Reference (+4 more)

### Community 28 - "package.json Metadata"
Cohesion: 0.17
Nodes (10): author, bugs, url, description, homepage, keywords, license, name (+2 more)

### Community 29 - "Popover Region"
Cohesion: 0.25
Nodes (4): PopoverRegion, Config, self, REST nonce seeded only for a logged-in user

### Community 30 - "PHPStan Inspect Script"
Cohesion: 0.35
Nodes (10): buildConfigHints(), buildReport(), extractStubPackageReferences(), findPhpstanScripts(), isFile(), main(), normalizeComposerScript(), readJsonSafe() (+2 more)

### Community 31 - "Composer Plugins Config"
Cohesion: 0.20
Nodes (10): composer/installers, dealerdirect/phpcodesniffer-composer-installer, pestphp/pest-plugin, roots/wordpress-core-installer, config, allow-plugins, apcu-autoloader, classmap-authoritative (+2 more)

### Community 32 - "Composer Scripts"
Cohesion: 0.20
Nodes (10): scripts, analysis, cs, cs:fix, qa, test:integration, test:integration:coverage, test:unit (+2 more)

### Community 33 - "Client TypeScript Config"
Cohesion: 0.20
Nodes (9): compilerOptions, exactOptionalPropertyTypes, module, moduleResolution, noUnusedLocals, noUnusedParameters, verbatimModuleSyntax, extends (+1 more)

### Community 34 - "Caching Middleware"
Cohesion: 0.20
Nodes (6): Middleware, Caching, self, WP_Error, WP_REST_Request, WP_REST_Response

### Community 36 - "Network Tests"
Cohesion: 0.22
Nodes (6): ENDPOINT, FetchDouble, payload, Resolver, createFetcher(), Endpoint

### Community 37 - "composer.json Metadata"
Cohesion: 0.22
Nodes (8): authors, description, license, minimum-stability, name, prefer-stable, repositories, type

### Community 38 - "Composer Dev Dependencies"
Cohesion: 0.22
Nodes (9): require-dev, bnf/phpstan-psr-container, brain/monkey, mockery/mockery, pestphp/pest, phpstan/phpstan, roots/wordpress, syde/phpcs (+1 more)

### Community 39 - "Commit Rules and Popover Plan"
Cohesion: 0.25
Nodes (9): Git Commit Instructions, Conventional Commits 1.0.0 format, github-commit skill (.claude/skills/github-commit/SKILL.md), Link Preview Popover Implementation Plan, Plan 1 global constraints, Coverage of the specification table, Plan 2 global constraints (Zod import, ESLint limits), Client split into one concern per file (+1 more)

### Community 40 - "Middleware Process"
Cohesion: 0.22
Nodes (5): MiddlewareProcess, register(), WP_Error, WP_REST_Request, WP_REST_Response

### Community 41 - "Preview Endpoint Docs"
Cohesion: 0.42
Nodes (9): Preview Server Module Document, Cache-Control Policy of the Endpoint, Preview Endpoint GET rinkukado/v1/preview, Preview\Module, Uniform 404 not_found Rejection, Preview Payload (id, title, excerpt, permalink, thumbnail), Preview\Rest\Controller, Preview\Rest\Excerpt (+1 more)

### Community 42 - "Tests TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, exactOptionalPropertyTypes, noUnusedLocals, noUnusedParameters, types, extends, include

### Community 43 - "ErrorCatch Middleware"
Cohesion: 0.25
Nodes (5): ErrorCatch, ErrorFactory, WP_Error, WP_REST_Request, WP_REST_Response

### Community 44 - "Excerpt Class"
Cohesion: 0.29
Nodes (3): Excerpt, self, WP_Post

### Community 45 - "Store Init Tests"
Cohesion: 0.29
Nodes (4): config, Definition, load(), state

### Community 46 - "Build Pipeline Plan"
Cohesion: 0.38
Nodes (4): Plan 1 tasks 1-15 (build pipeline to final gate), Assumption: wp-scripts entry for a script module outside block.json, configs, path

### Community 48 - "Server Module Rules"
Cohesion: 0.43
Nodes (7): Server Module Architecture Rules, ExecutableModule Default Pattern, Feature Class Pattern (final readonly, new(), init()), Hook Registration in init() With First-Class Callables, Inpsyde Modularity, PHPStan Type Annotations for Arrays, ServiceModule Pattern (Only on Request)

### Community 49 - "Plugin Detect Script"
Cohesion: 0.43
Nodes (5): DEFAULT_IGNORES, findFilesRecursive(), main(), parsePluginHeader(), readFileSafe()

### Community 50 - "Stylelint Config"
Cohesion: 0.29
Nodes (6): extends, rules, logical-css/require-logical-keywords, logical-css/require-logical-properties, logical-css/require-logical-units, selector-class-pattern

### Community 51 - "Integration Tester Agent"
Cohesion: 0.33
Nodes (6): pest-integration-tester Agent, Assert the Result, Not the Registration Call, tests/bootstrap-integration.php (installs WordPress on SQLite), Clean Up Created Data, Skip, Do Not Fail, Without the Build Directory, syde/wp-phpunit-integration

### Community 52 - "github-commit Skill"
Cohesion: 0.33
Nodes (6): github-commit Skill, Breaking Change Marker (! and BREAKING CHANGE footer), Commit Scopes (server, client, package, tests, e2e, deps, claude, wp-env, docs), Commit Types (feat, fix, docs, test, refactor, perf, style, build, ci, chore, revert), Conventional Commits 1.0.0, Title 50 Characters, Body 72 Characters, Body Explains Why

### Community 54 - "Performance Inspect Script"
Cohesion: 0.60
Nodes (5): canRun(), existsFile(), main(), parseArgs(), runWp()

### Community 55 - "Permalinks E2E Spec"
Cohesion: 0.40
Nodes (4): open(), setPlainPermalinks(), Structure, structures

### Community 56 - "Dev Autoload"
Cohesion: 0.40
Nodes (5): autoload-dev, psr-4, SpaghettiDojo\\Rinkukado\\Tests\\, SpaghettiDojo\\Rinkukado\\Tests\\Integration\\, SpaghettiDojo\\Rinkukado\\Tests\\Unit\\

### Community 57 - "Jest Config"
Cohesion: 0.40
Nodes (5): jest, moduleNameMapper, preset, \\.(scss|css)$, ^@wordpress/interactivity$

### Community 58 - "Middleware Contract"
Cohesion: 0.40
Nodes (4): __invoke(), WP_Error, WP_REST_Request, WP_REST_Response

### Community 59 - "SCSS Rules"
Cohesion: 0.40
Nodes (5): SCSS Rules, BEM Naming Convention and Rules, index.scss as Package Public API (@forward, no @import), Mobile First Approach, units.rem() and units.em() Mixins (_units.scss)

### Community 60 - "Autoload"
Cohesion: 0.50
Nodes (4): autoload, files, psr-4, SpaghettiDojo\\Rinkukado\\

### Community 61 - "Composer Extra"
Cohesion: 0.50
Nodes (4): extra, installer-paths, wordpress-install-dir, vendor/wordpress/wordpress/wp-content/plugins/{$name}

### Community 62 - "QA Hook Script"
Cohesion: 0.83
Nodes (3): run_fix(), run_step(), qa.sh script

### Community 64 - "Handover E2E Spec"
Cohesion: 0.67
Nodes (3): Anchors, anchorsOf(), expectAnchoredTo()

### Community 67 - "Composer Requirements"
Cohesion: 0.67
Nodes (3): require, inpsyde/modularity, php

### Community 69 - "Node Dependencies"
Cohesion: 0.67
Nodes (3): dependencies, @wordpress/interactivity, zod

### Community 70 - "Node Engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 71 - "Repository Metadata"
Cohesion: 0.67
Nodes (3): repository, type, url

## Ambiguous Edges - Review These
- `Link Preview Popover Implementation Plan` → `Interactivity Server Data Implementation Plan`  [AMBIGUOUS]
  docs/superpowers/plans/2026-10-01-interactivity-server-data.md · relation: conceptually_related_to
- `Modes rule: two media queries choose three modes` → `Plan 1 global constraints`  [AMBIGUOUS]
  docs/superpowers/plans/2026-09-04-link-preview-popover.md · relation: conceptually_related_to

## Knowledge Gaps
- **335 isolated node(s):** `Kind`, `Source`, `DEFAULT_IGNORES`, `path`, `extends` (+330 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Link Preview Popover Implementation Plan` and `Interactivity Server Data Implementation Plan`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Modes rule: two media queries choose three modes` and `Plan 1 global constraints`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Link Preview Popover Design spec` connect `Popover Plan and Spec` to `Event and DOM Tests`, `Driver and Intent Tests`, `Commit Rules and Popover Plan`, `Build Pipeline Plan`, `Interactivity Module Docs`, `Popover Region`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Interactivity Server Data Design spec` connect `Interactivity Module Docs` to `Schema Tests`, `Popover Plan and Spec`, `Server Data Tests`, `Interactivity Server Data Skill`, `Popover Region`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `Kind`, `Source`, `DEFAULT_IGNORES` to the rest of the system?**
  _354 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Event and DOM Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.055811571940604196 - nodes in this community are weakly interconnected._
- **Should `ESLint Rules` be split into smaller, more focused modules?**
  _Cohesion score 0.03278688524590164 - nodes in this community are weakly interconnected._