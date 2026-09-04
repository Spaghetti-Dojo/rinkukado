/**
 * The module entry of this plugin comes from no block.json, so wp-scripts
 * cannot discover it. This configuration takes the module configuration of
 * wp-scripts and adds the entry.
 */

const path = require('node:path');

const configs = require('@wordpress/scripts/config/webpack.config');

const moduleConfig = Array.isArray(configs) ? configs[1] : configs;

module.exports = {
	...moduleConfig,
	entry: {
		'preview/index': path.resolve(
			process.cwd(),
			'sources/client/preview/index.module.ts'
		),
	},
	optimization: {
		...moduleConfig.optimization,
		/**
		 * Module concatenation breaks the production bundle of this entry.
		 *
		 * The `style` cache group of wp-scripts moves `style.scss` into a
		 * second initial chunk. The entry chunk then depends on that chunk,
		 * so webpack defers the start of the entry and renders the entry as
		 * a module factory. That factory declares its exports with
		 * `__webpack_require__.d`. With concatenation on, the entry is a
		 * ConcatenatedModule, and `ModuleLibraryPlugin` stashes its exports
		 * source, then removes `definePropertyGetters` from the runtime of
		 * the chunk, because it assumes an inlined entry (webpack 5.110.3,
		 * lib/library/ModuleLibraryPlugin.js). The helper disappears, the
		 * call stays, and the browser throws "i.d is not a function".
		 *
		 * Without concatenation the entry keeps a plain module source that
		 * names `__webpack_require__.`, which the same guard detects, so
		 * webpack keeps the helper. The bundle grows by about one kilobyte.
		 */
		concatenateModules: false,
	},
};
