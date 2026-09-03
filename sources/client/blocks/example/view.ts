import { store, getContext } from '@wordpress/interactivity';

import type { ExampleContext } from './types';

import './style.scss';

store( 'rinkukado', {
	actions: {
		increment(): void {
			const context = getContext< ExampleContext >();
			context.count += 1;
		},
	},
} );
