# Graph Report - .  (2026-10-10)

## Corpus Check
- 2 files · ~67,434 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1002 nodes · 1523 edges · 84 communities (76 shown, 8 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_ESLint Rules|ESLint Rules]]
- [[_COMMUNITY_Interactivity Server Data Rules|Interactivity Server Data Rules]]
- [[_COMMUNITY_REST API and Plugin Skills|REST API and Plugin Skills]]
- [[_COMMUNITY_Driver and Intent Tests|Driver and Intent Tests]]
- [[_COMMUNITY_Preview Controller and Schema|Preview Controller and Schema]]
- [[_COMMUNITY_Performance Skill References|Performance Skill References]]
- [[_COMMUNITY_Popover Server Module|Popover Server Module]]
- [[_COMMUNITY_Server Data and Schemas|Server Data and Schemas]]
- [[_COMMUNITY_Root TypeScript Config|Root TypeScript Config]]
- [[_COMMUNITY_Preview Repository and Excerpt Tests|Preview Repository and Excerpt Tests]]
- [[_COMMUNITY_Client Event Binding|Client Event Binding]]
- [[_COMMUNITY_Client Network Fetcher|Client Network Fetcher]]
- [[_COMMUNITY_Preview Store Entry|Preview Store Entry]]
- [[_COMMUNITY_Popover Plan and Spec|Popover Plan and Spec]]
- [[_COMMUNITY_Interactivity API Skill|Interactivity API Skill]]
- [[_COMMUNITY_Testing Layers Docs|Testing Layers Docs]]
- [[_COMMUNITY_pnpm Scripts|pnpm Scripts]]
- [[_COMMUNITY_Event Test Harness|Event Test Harness]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_DOM Helpers|DOM Helpers]]
- [[_COMMUNITY_Server Data Helpers|Server Data Helpers]]
- [[_COMMUNITY_README and Customize Docs|README and Customize Docs]]
- [[_COMMUNITY_Node Dev Dependencies|Node Dev Dependencies]]
- [[_COMMUNITY_package.json Metadata|package.json Metadata]]
- [[_COMMUNITY_PHPStan Annotations|PHPStan Annotations]]
- [[_COMMUNITY_PHPStan Inspect Script|PHPStan Inspect Script]]
- [[_COMMUNITY_Link Policy|Link Policy]]
- [[_COMMUNITY_QA Hook Tests|QA Hook Tests]]
- [[_COMMUNITY_Project Directives and Commits|Project Directives and Commits]]
- [[_COMMUNITY_Server Data Plan and Spec|Server Data Plan and Spec]]
- [[_COMMUNITY_Preview Endpoint Contract|Preview Endpoint Contract]]
- [[_COMMUNITY_Composer Dev Dependencies|Composer Dev Dependencies]]
- [[_COMMUNITY_Composer Scripts|Composer Scripts]]
- [[_COMMUNITY_Client TypeScript Config|Client TypeScript Config]]
- [[_COMMUNITY_Server Config Class|Server Config Class]]
- [[_COMMUNITY_Composer Plugins Config|Composer Plugins Config]]
- [[_COMMUNITY_composer.json Metadata|composer.json Metadata]]
- [[_COMMUNITY_Caching Middleware|Caching Middleware]]
- [[_COMMUNITY_Middleware Process|Middleware Process]]
- [[_COMMUNITY_Server Module Rules|Server Module Rules]]
- [[_COMMUNITY_Tests TypeScript Config|Tests TypeScript Config]]
- [[_COMMUNITY_Interactivity API Reference|Interactivity API Reference]]
- [[_COMMUNITY_ErrorCatch Middleware|ErrorCatch Middleware]]
- [[_COMMUNITY_Build Pipeline and Fixtures|Build Pipeline and Fixtures]]
- [[_COMMUNITY_PHPStan Configuration Skill|PHPStan Configuration Skill]]
- [[_COMMUNITY_Store Init Tests|Store Init Tests]]
- [[_COMMUNITY_Excerpt Class|Excerpt Class]]
- [[_COMMUNITY_Plugin Detect Script|Plugin Detect Script]]
- [[_COMMUNITY_Stylelint Config|Stylelint Config]]
- [[_COMMUNITY_Error Factory|Error Factory]]
- [[_COMMUNITY_Performance Inspect Script|Performance Inspect Script]]
- [[_COMMUNITY_Composer Autoload Dev|Composer Autoload Dev]]
- [[_COMMUNITY_Jest Config|Jest Config]]
- [[_COMMUNITY_REST Controller Interface|REST Controller Interface]]
- [[_COMMUNITY_REST Middleware Interface|REST Middleware Interface]]
- [[_COMMUNITY_SCSS Rules|SCSS Rules]]
- [[_COMMUNITY_Zod Mini Helper|Zod Mini Helper]]
- [[_COMMUNITY_Composer Autoload|Composer Autoload]]
- [[_COMMUNITY_Composer Installer Paths|Composer Installer Paths]]
- [[_COMMUNITY_Desktop E2E Spec|Desktop E2E Spec]]
- [[_COMMUNITY_Sheet E2E Spec|Sheet E2E Spec]]
- [[_COMMUNITY_Skill Assets Test|Skill Assets Test]]
- [[_COMMUNITY_Composer Requirements|Composer Requirements]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Node Engines|Node Engines]]
- [[_COMMUNITY_Repository Metadata|Repository Metadata]]
- [[_COMMUNITY_Preview Endpoint Test|Preview Endpoint Test]]
- [[_COMMUNITY_Plugin Bootstrap|Plugin Bootstrap]]
- [[_COMMUNITY_package.json Rules|package.json Rules]]
- [[_COMMUNITY_Style Mock|Style Mock]]

## God Nodes (most connected - your core abstractions)
1. `rules` - 61 edges
2. `Link Preview Popover Design spec` - 37 edges
3. `Preview module document` - 26 edges
4. `compilerOptions` - 25 edges
5. `interactivity-server-data Skill` - 18 edges
6. `Interactivity Server Data Design spec` - 18 edges
7. `scripts` - 16 edges
8. `WP Performance Skill (backend-only)` - 16 edges
9. `Plan 1 tasks 1-15 (build pipeline to final gate)` - 15 edges
10. `reduce()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Modes rule: two media queries choose three modes` --semantically_similar_to--> `Three device modes (hover, sheet, off)`  [INFERRED] [semantically similar]
  docs/superpowers/specs/2026-09-03-link-preview-popover-design.md → README.md
- `initializeServerConfig()` --calls--> `getConfig()`  [INFERRED]
  .claude/skills/interactivity-server-data/assets/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerState()` --calls--> `getServerState()`  [INFERRED]
  .claude/skills/interactivity-server-data/assets/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerContext()` --calls--> `getServerContext()`  [INFERRED]
  .claude/skills/interactivity-server-data/assets/server-data.ts → tests/unit/client/interactivity-mock.ts
- `initializeServerConfig()` --calls--> `getConfig()`  [INFERRED]
  sources/client/interactivity/server-data.ts → tests/unit/client/interactivity-mock.ts

## Import Cycles
- 1-file cycle: `webpack.config.js -> webpack.config.js`

## Communities (84 total, 8 thin omitted)

### Community 0 - "ESLint Rules"
Cohesion: 0.03
Nodes (61): rules, complexity, consistent-return, dot-notation, init-declarations, max-classes-per-file, max-depth, max-lines (+53 more)

### Community 1 - "Interactivity Server Data Rules"
Cohesion: 0.07
Nodes (48): sources/client/interactivity Shared Helpers (copy of the skill assets), Interactivity module document, Reactive proxy passed as an argument, Schema rules (z.strictObject, z.infer, no .default/.catch), Rule: check server data one time in init, no fallbacks, zod/mini with export * and the English locale, Server data check on the first init, config (+40 more)

### Community 2 - "REST API and Plugin Skills"
Cohesion: 0.06
Nodes (57): REST Authentication Reference, Application Passwords, Auth Plugins (OAuth 1.0a, JWT), Cookie Authentication + X-WP-Nonce (wp_rest), Cron Fix Patterns (de-duplicate, idempotent, off-request), REST Custom Content Types Reference, register_post_type_args / register_taxonomy_args Filters, rest_route_for_post / rest_route_for_term Filters (+49 more)

### Community 3 - "Driver and Intent Tests"
Cohesion: 0.07
Nodes (47): Calls, createEffects(), driverWith(), hoveredBAfterA(), openLinkA(), recorder(), timings, enter() (+39 more)

### Community 4 - "Preview Controller and Schema"
Cohesion: 0.05
Nodes (27): PreviewController, PreviewSchema, MiddlewareProcessTest, Route, FakeController, FakeSchema, RestRegistTrait, Schema (+19 more)

### Community 5 - "Performance Skill References"
Cohesion: 0.09
Nodes (38): Autoloaded Options Reference, Autoload Bloat, Fix Pattern: Stop Autoloading Large Blobs, WP-Cron Performance Reference, WP-CLI Cron Commands, Database / Query Performance Reference, Expensive Meta Queries, N+1 Query Pattern (+30 more)

### Community 6 - "Popover Server Module"
Cohesion: 0.08
Nodes (14): ExecutableModule, ModuleClassNameIdTrait, Module, PopoverRegion, ScriptModules, Module, ServiceModule, ContainerInterface (+6 more)

### Community 7 - "Server Data and Schemas"
Cohesion: 0.08
Nodes (25): initializeServerConfig(), initializeServerContext(), initializeServerState(), Kind, sanitize(), Source, getConfig(), getServerContext() (+17 more)

### Community 8 - "Root TypeScript Config"
Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, baseUrl, checkJs, esModuleInterop, exactOptionalPropertyTypes, isolatedModules, jsx (+19 more)

### Community 9 - "Preview Repository and Excerpt Tests"
Cohesion: 0.11
Nodes (13): Excerpt, post(), repository(), request(), PreviewRepository, flushCallback(), thumbnailPost(), self (+5 more)

### Community 10 - "Client Event Binding"
Cohesion: 0.12
Nodes (23): linkOf(), staysInDialog(), staysInLink(), attach(), attachGlobalListeners(), bind(), dialogHandlers, Handler (+15 more)

### Community 11 - "Client Network Fetcher"
Cohesion: 0.11
Nodes (17): ENDPOINT, FetchDouble, payload, Resolver, createFetcher(), Endpoint, Fetcher, FetchState (+9 more)

### Community 12 - "Preview Store Entry"
Cohesion: 0.14
Nodes (18): resolveRoot(), unplaceDialog(), applyPreview(), bindQueries(), close(), context, driver, endpointOf() (+10 more)

### Community 13 - "Popover Plan and Spec"
Cohesion: 0.14
Nodes (16): popover, viewport, Preview module document, Sequence of a hover, Intent machine (idle, intent, open; prefetchAt, openAt, closeAt), One-direction data flow (events -> machine -> commands -> state), Pure modules (intent, policy, position), Navigate when the fetch fails after a tap (+8 more)

### Community 14 - "Interactivity API Skill"
Cohesion: 0.16
Nodes (15): Link Preview Popover Implementation Plan, Plan 1 global constraints, Coverage of the specification table, Three device modes (hover, sheet, off), Link Preview Popover Design spec, Keyboard and assistive technology rules, Breakpoint 782px ($break-medium) as own SCSS variable, Excerpt: manual excerpt, else core fallback (+7 more)

### Community 15 - "Testing Layers Docs"
Cohesion: 0.28
Nodes (13): assert_contains(), assert_empty(), assert_not_contains(), bad(), ok(), t_delete_only(), t_fixer_code_ignored(), t_not_git() (+5 more)

### Community 16 - "pnpm Scripts"
Cohesion: 0.23
Nodes (14): Quality assurance commands (composer qa, pnpm lint, tests), wp-env local environment (localhost:8877), Testing document, Client unit tests (Jest via wp-scripts), End to end tests (Playwright on wp-env), Four test layers, PHP integration tests (Pest on real WordPress, SQLite), PHP unit tests (Pest + Brain Monkey) (+6 more)

### Community 17 - "Event Test Harness"
Cohesion: 0.12
Nodes (16): scripts, build, build:dev, format, init:template, lint:scripts, lint:scripts:fix, lint:styles (+8 more)

### Community 18 - "ESLint Config"
Cohesion: 0.14
Nodes (13): env, browser, es2024, extends, overrides, parser, parserOptions, ecmaVersion (+5 more)

### Community 19 - "DOM Helpers"
Cohesion: 0.27
Nodes (10): options, isInContainer(), Mode, modeOf(), placeDialog(), placeWithAnchor(), previewableLink(), supportsAnchor() (+2 more)

### Community 20 - "Server Data Helpers"
Cohesion: 0.22
Nodes (7): bindHarness(), createHarness(), createRefs(), Harness, EventContext, Refs, Availability

### Community 21 - "README and Customize Docs"
Cohesion: 0.24
Nodes (10): Customize document, Rinkukado filters (rinkukado.popover.*, rinkukado.rest.*), Extend the plugin through package()->addModule(), Development document, Project layout, Requirements: WordPress 7.1, PHP 8.4, Node 24, pnpm 10, Composer 2, Docker, Rinkukado README, Popover module document (+2 more)

### Community 22 - "Node Dev Dependencies"
Cohesion: 0.21
Nodes (7): Plan 1 tasks 1-15 (build pipeline to final gate), Preview endpoint GET /wp-json/rinkukado/v1/preview, Preview payload (id, title, excerpt, permalink, thumbnail), Uniform 404 not_found for every rejection, Assumption: wp-scripts entry for a script module outside block.json, configs, path

### Community 23 - "package.json Metadata"
Cohesion: 0.15
Nodes (13): devDependencies, clean-webpack-plugin, @playwright/test, sass, stylelint-plugin-logical-css, ts-node, @types/jest, @types/node (+5 more)

### Community 24 - "PHPStan Annotations"
Cohesion: 0.18
Nodes (12): No Fallback Values for Server Data, wp-rest-api Skill, z.strictObject Rule, WordPress-Specific Type Annotations, Array and Object Shapes (query results, Action Scheduler args), Validated Docblocks for apply_filters() and do_action(), REST Request Typing (WP_REST_Request<array{...}>), PHPStan Annotations for Complex Array Structures (+4 more)

### Community 25 - "PHPStan Inspect Script"
Cohesion: 0.17
Nodes (10): author, bugs, url, description, homepage, keywords, license, name (+2 more)

### Community 26 - "Link Policy"
Cohesion: 0.31
Nodes (8): options, isHTTPProtocol(), isPreviewable(), isValidPath(), LinkFacts, parseURL(), validateLinkAttributes(), validateURLProperties()

### Community 27 - "QA Hook Tests"
Cohesion: 0.27
Nodes (11): data-wp-* Directives (interactive, context, on, on-async, bind, class), Server-Side Rendering for Interactivity API, Derived State on the Server (static and closures), wp_interactivity_data_wp_context(), wp_interactivity_process_directives(), wp_interactivity_state(), Popover\ScriptModules (minimal feature class example), wp-interactivity-api Skill (+3 more)

### Community 28 - "Project Directives and Commits"
Cohesion: 0.35
Nodes (10): buildConfigHints(), buildReport(), extractStubPackageReferences(), findPhpstanScripts(), isFile(), main(), normalizeComposerScript(), readJsonSafe() (+2 more)

### Community 29 - "Server Data Plan and Spec"
Cohesion: 0.22
Nodes (10): Rinkukado Project Directives (CLAUDE.md), Module Documents Sync Rule (docs/modules), Project Layout (sources/server, sources/client, tests, build), Stop and Confirm at Each Plan Step, github-commit Skill, Breaking Change Marker (! and BREAKING CHANGE footer), Commit Scopes (server, client, package, tests, e2e, deps, claude, wp-env, docs), Commit Types (feat, fix, docs, test, refactor, perf, style, build, ci, chore, revert) (+2 more)

### Community 30 - "Preview Endpoint Contract"
Cohesion: 0.20
Nodes (10): composer/installers, dealerdirect/phpcodesniffer-composer-installer, pestphp/pest-plugin, roots/wordpress-core-installer, config, allow-plugins, apcu-autoloader, classmap-authoritative (+2 more)

### Community 31 - "Composer Dev Dependencies"
Cohesion: 0.20
Nodes (10): scripts, analysis, cs, cs:fix, qa, test:integration, test:integration:coverage, test:unit (+2 more)

### Community 32 - "Composer Scripts"
Cohesion: 0.20
Nodes (9): compilerOptions, exactOptionalPropertyTypes, module, moduleResolution, noUnusedLocals, noUnusedParameters, verbatimModuleSyntax, extends (+1 more)

### Community 34 - "Server Config Class"
Cohesion: 0.22
Nodes (8): authors, description, license, minimum-stability, name, prefer-stable, repositories, type

### Community 35 - "Composer Plugins Config"
Cohesion: 0.22
Nodes (9): require-dev, bnf/phpstan-psr-container, brain/monkey, mockery/mockery, pestphp/pest, phpstan/phpstan, roots/wordpress, syde/phpcs (+1 more)

### Community 36 - "composer.json Metadata"
Cohesion: 0.22
Nodes (5): Caching, self, WP_Error, WP_REST_Request, WP_REST_Response

### Community 37 - "Caching Middleware"
Cohesion: 0.22
Nodes (5): MiddlewareProcess, register(), WP_Error, WP_REST_Request, WP_REST_Response

### Community 38 - "Middleware Process"
Cohesion: 0.33
Nodes (9): Server Module Architecture Rules, ExecutableModule (default module type), Feature Class Pattern (final readonly, new(), init()), First-Class Callable Hook Callbacks ($this->method(...)), Hook Registration in init(), Never in the Constructor, Inpsyde Modularity, Rest/Module.php (ServiceModule and ExecutableModule example), ServiceModule (only when explicitly requested) (+1 more)

### Community 39 - "Server Module Rules"
Cohesion: 0.29
Nodes (8): Stop Hook .claude/hooks/qa.sh, Quality Assurance Commands (composer qa, pnpm lint:scripts, pnpm lint:styles), Router Decision Tree, docs/development.md and docs/testing.md, Router Guardrails (Composer and pnpm, never npm or npx), wp-performance Skill, wp-plugin-development Skill, wordpress-router Skill

### Community 40 - "Tests TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, exactOptionalPropertyTypes, noUnusedLocals, noUnusedParameters, types, extends, include

### Community 41 - "Interactivity API Reference"
Cohesion: 0.39
Nodes (8): getServerContext Returns the Merged Context (inherited keys), Interactivity Debugging Checklist, Router Regions attachTo Property, getServerState and getServerContext Reset Between Page Transitions, Directives Quick Reference, data-wp-ignore Deprecated, Unique Directive IDs (--- separator), WordPress 6.9 Interactivity Changes

### Community 42 - "ErrorCatch Middleware"
Cohesion: 0.25
Nodes (5): ErrorCatch, ErrorFactory, WP_Error, WP_REST_Request, WP_REST_Response

### Community 43 - "Build Pipeline and Fixtures"
Cohesion: 0.39
Nodes (8): PHPStan Configuration (WordPress), PHPStan Baseline Workflow, Minimal phpstan.neon Template, Third-Party Classes and Ignore Patterns, WordPress Stub Packages (szepeviktor/phpstan-wordpress, php-stubs/wordpress-stubs), Targeted ignoreErrors Patterns, wp-phpstan Skill, phpstan_inspect.mjs Script

### Community 44 - "PHPStan Configuration Skill"
Cohesion: 0.33
Nodes (7): Four Test Layers (Pest unit, Pest integration, Jest, Playwright), pest-integration-tester Agent, Assert the Result, Not the Registration Call, tests/bootstrap-integration.php (installs WordPress on SQLite), Clean Up Created Data, Skip, Do Not Fail, Without the Build Directory, syde/wp-phpunit-integration

### Community 45 - "Store Init Tests"
Cohesion: 0.33
Nodes (3): Excerpt, self, WP_Post

### Community 46 - "Excerpt Class"
Cohesion: 0.43
Nodes (5): DEFAULT_IGNORES, findFilesRecursive(), main(), parsePluginHeader(), readFileSafe()

### Community 47 - "Plugin Detect Script"
Cohesion: 0.29
Nodes (6): extends, rules, logical-css/require-logical-keywords, logical-css/require-logical-properties, logical-css/require-logical-units, selector-class-pattern

### Community 49 - "Error Factory"
Cohesion: 0.60
Nodes (5): canRun(), existsFile(), main(), parseArgs(), runWp()

### Community 50 - "Performance Inspect Script"
Cohesion: 0.40
Nodes (5): Fetcher: one request per href and a page session cache, Cache-Control policy (public max-age=300 / no-store), REST nonce seeded only for a logged-in user, Failure rules: unavailable marker, PreviewRepository object cache (group rinkukado)

### Community 51 - "Composer Autoload Dev"
Cohesion: 0.40
Nodes (5): autoload-dev, psr-4, SpaghettiDojo\\Rinkukado\\Tests\\, SpaghettiDojo\\Rinkukado\\Tests\\Integration\\, SpaghettiDojo\\Rinkukado\\Tests\\Unit\\

### Community 52 - "Jest Config"
Cohesion: 0.40
Nodes (5): jest, moduleNameMapper, preset, \\.(scss|css)$, ^@wordpress/interactivity$

### Community 53 - "REST Controller Interface"
Cohesion: 0.40
Nodes (4): __invoke(), WP_Error, WP_REST_Request, WP_REST_Response

### Community 54 - "REST Middleware Interface"
Cohesion: 0.40
Nodes (4): __invoke(), WP_Error, WP_REST_Request, WP_REST_Response

### Community 55 - "SCSS Rules"
Cohesion: 0.40
Nodes (5): SCSS Rules, BEM Naming Convention and Rules, index.scss as Package Public API (@forward, no @import), Mobile First Approach, units.rem() and units.em() Mixins (_units.scss)

### Community 56 - "Zod Mini Helper"
Cohesion: 0.50
Nodes (4): autoload, files, psr-4, SpaghettiDojo\\Rinkukado\\

### Community 57 - "Composer Autoload"
Cohesion: 0.50
Nodes (4): extra, installer-paths, wordpress-install-dir, vendor/wordpress/wordpress/wp-content/plugins/{$name}

### Community 58 - "Composer Installer Paths"
Cohesion: 0.83
Nodes (3): run_fix(), run_step(), qa.sh script

### Community 60 - "Desktop E2E Spec"
Cohesion: 0.67
Nodes (3): Anchors, anchorsOf(), expectAnchoredTo()

### Community 63 - "Skill Assets Test"
Cohesion: 0.67
Nodes (3): require, inpsyde/modularity, php

### Community 64 - "Composer Requirements"
Cohesion: 0.67
Nodes (3): dependencies, @wordpress/interactivity, zod

### Community 65 - "Runtime Dependencies"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 66 - "Node Engines"
Cohesion: 0.67
Nodes (3): repository, type, url

## Ambiguous Edges - Review These
- `Link Preview Popover Implementation Plan` → `Interactivity Server Data Implementation Plan`  [AMBIGUOUS]
  docs/superpowers/plans/2026-10-01-interactivity-server-data.md · relation: conceptually_related_to
- `Modes rule: two media queries choose three modes` → `Plan 1 global constraints`  [AMBIGUOUS]
  docs/superpowers/plans/2026-09-04-link-preview-popover.md · relation: conceptually_related_to

## Knowledge Gaps
- **327 isolated node(s):** `Kind`, `Source`, `DEFAULT_IGNORES`, `path`, `extends` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Link Preview Popover Implementation Plan` and `Interactivity Server Data Implementation Plan`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Modes rule: two media queries choose three modes` and `Plan 1 global constraints`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Link Preview Popover Design spec` connect `Interactivity API Skill` to `Interactivity Server Data Rules`, `Driver and Intent Tests`, `composer.json Metadata`, `Popover Server Module`, `Client Event Binding`, `Client Network Fetcher`, `Preview Store Entry`, `Popover Plan and Spec`, `pnpm Scripts`, `Performance Inspect Script`, `README and Customize Docs`, `Node Dev Dependencies`, `Link Policy`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `interactivity-server-data Skill` connect `Interactivity Server Data Rules` to `PHPStan Annotations`, `QA Hook Tests`, `Server Data Plan and Spec`, `Server Module Rules`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `Interactivity Server Data Design spec` connect `Interactivity Server Data Rules` to `pnpm Scripts`, `Preview Store Entry`, `Interactivity API Skill`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `Kind`, `Source`, `DEFAULT_IGNORES` to the rest of the system?**
  _344 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ESLint Rules` be split into smaller, more focused modules?**
  _Cohesion score 0.03278688524590164 - nodes in this community are weakly interconnected._