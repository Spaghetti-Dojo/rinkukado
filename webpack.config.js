/**
 * The module entry of this plugin comes from no block.json, so wp-scripts
 * cannot discover it. This configuration takes the module configuration of
 * wp-scripts and adds the entry.
 */

const path = require( 'node:path' );

const configs = require( '@wordpress/scripts/config/webpack.config' );

const moduleConfig = Array.isArray( configs ) ? configs[ 1 ] : configs;

module.exports = {
	...moduleConfig,
	entry: {
		'preview/index': path.resolve(
			process.cwd(),
			'sources/client/preview/index.module.ts'
		),
	},
};
