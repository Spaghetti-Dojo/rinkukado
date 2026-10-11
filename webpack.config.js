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
		 * Removes the `style` cache group of wp-scripts, so the CSS of
		 * `style.scss` stays in the entry chunk.
		 *
		 * That cache group moves the CSS into a second initial chunk. The
		 * entry chunk then depends on that chunk, and webpack renders the
		 * entry as a module factory. With module concatenation on,
		 * `ModuleLibraryPlugin` removes `definePropertyGetters` from the
		 * runtime of that factory (webpack 5.110.3,
		 * lib/library/ModuleLibraryPlugin.js), and the browser throws
		 * "i.d is not a function".
		 *
		 * With one chunk, webpack inlines the entry and adds no runtime. The
		 * CSS file takes the name of the entry: `preview/index.css`.
		 */
		splitChunks: {
			cacheGroups: {
				default: false,
			},
		},
	},
};
