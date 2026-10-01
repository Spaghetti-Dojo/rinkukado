/**
 * The checks of the data that the server gives to a store of the
 * Interactivity API: the config, the state and the context. A store calls
 * them one time, in `init`, before it binds anything.
 */

import {
	getConfig,
	getServerContext,
	getServerState,
} from '@wordpress/interactivity';

import { z } from './zod';

export type Kind = 'config' | 'state' | 'context';

export type Source = {
	store: string;
	kind: Kind;
};

/**
 * Parses the data with the schema. A Zod error becomes an `Error` that names
 * the store, the kind of data and every wrong field.
 * @param schema - The schema of the data.
 * @param data   - The data from the server.
 * @param source - The store and the kind of the data.
 */
export function sanitize< S extends z.ZodMiniType >(
	schema: S,
	data: unknown,
	source: Source
): z.infer< S > {
	try {
		return schema.parse( data );
	} catch ( error ) {
		if ( error instanceof z.core.$ZodError ) {
			throw new Error(
				`Store "${ source.store }": the server ${
					source.kind
				} is not valid.\n${ z.prettifyError( error ) }`,
				{ cause: error }
			);
		}

		throw error;
	}
}

/**
 * Parses the config of the store. The config does not change while the page
 * is open, so the result is read-only.
 * @param store  - The name of the store.
 * @param schema - The schema of the config.
 */
export function initializeServerConfig< S extends z.ZodMiniType >(
	store: string,
	schema: S
): Readonly< z.infer< S > > {
	return sanitize( schema, getConfig( store ), { store, kind: 'config' } );
}

/**
 * Parses the server state and writes it into the state proxy. A
 * reassignment of a variable does not change a proxy, so the proxy is an
 * argument.
 * @param store  - The name of the store.
 * @param schema - The schema of the server state.
 * @param state  - The state proxy of the store.
 */
export function initializeServerState< S extends z.ZodMiniType >(
	store: string,
	schema: S,
	state: object
): z.infer< S > {
	const parsed = sanitize( schema, getServerState( store ), {
		store,
		kind: 'state',
	} );

	Object.assign( state, parsed );

	return parsed;
}

/**
 * Parses the server context of the current element and writes it into the
 * context proxy.
 * @param store   - The name of the store.
 * @param schema  - The schema of the server context.
 * @param context - The context proxy of the element.
 */
export function initializeServerContext< S extends z.ZodMiniType >(
	store: string,
	schema: S,
	context: object
): z.infer< S > {
	const parsed = sanitize( schema, getServerContext( store ), {
		store,
		kind: 'context',
	} );

	Object.assign( context, parsed );

	return parsed;
}
