export const store = ( _name: string, definition: unknown ): unknown =>
	definition;
export const getElement = (): { ref: HTMLElement } => ( {
	ref: document.body,
} );
export const getContext = (): Record< string, never > => ( {} );
export const getConfig = (): Record< string, never > => ( {} );
