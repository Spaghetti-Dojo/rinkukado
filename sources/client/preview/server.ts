/**
 * The server data of the preview. The first `init` checks the config and the
 * state, and `config()` gives the checked config to the rest of the store.
 */

import { configSchema, stateSchema } from './schemas';
import {
	initializeServerConfig,
	initializeServerState,
} from '../interactivity/server-data';

import type { ServerConfig, ServerState } from './types';

export const STORE = 'rinkukado';

// The config does not change while the page is open, so no directive reads
// it and it stays out of the state. `init` fills it after the check.
let serverConfig: ServerConfig | null = null;

export function config(): ServerConfig {
	if ( serverConfig === null ) {
		throw new Error(
			`Store "${ STORE }": the config was read before init.`
		);
	}

	return serverConfig;
}

// The config and the state are global, so only the first init checks them.
// A later init must not reset the state of an open popover. The config is
// cached last, so a failed state check repeats at the next init.
export function validateServerData( state: ServerState ): void {
	if ( serverConfig !== null ) {
		return;
	}

	const parsed = initializeServerConfig( STORE, configSchema );

	initializeServerState( STORE, stateSchema, state );
	serverConfig = parsed;
}
