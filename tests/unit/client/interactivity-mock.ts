// The values that the server gives to each store, keyed by the store name.
// A test sets them before it calls the code under test.
export const server: {
	config: Record< string, unknown >;
	state: Record< string, unknown >;
	context: Record< string, unknown >;
} = { config: {}, state: {}, context: {} };

// The definition of each store, so a test can call its callbacks.
export const stores: Map< string, unknown > = new Map();

export const store = ( name: string, definition: unknown ): unknown => {
	stores.set( name, definition );

	return definition;
};
export const getElement = (): { ref: HTMLElement } => ( {
	ref: document.body,
} );
export const getContext = (): Record< string, never > => ( {} );
export const getConfig = ( namespace: string ): unknown =>
	server.config[ namespace ] ?? {};
export const getServerState = ( namespace: string ): unknown =>
	server.state[ namespace ] ?? {};
export const getServerContext = ( namespace: string ): unknown =>
	server.context[ namespace ] ?? {};
