import { previewableLink } from './dom';

import type { PolicyOptions } from './policy';
import type { IntentEvent, Machine } from './intent';

/**
 * The mutable references that the delegated listeners read and write.
 * `bound` tells whether `bind` already attached the listeners of this
 * region, so that a second init attaches nothing twice.
 */
export type Refs = {
	bound: boolean;
	frame: number | null;
	dialog: HTMLElement | null;
	closeButton: HTMLButtonElement | null;
	activeLink: HTMLAnchorElement | null;
};

/**
 * What the event handlers need from the store, without importing it.
 */
export type EventContext = {
	refs: Refs;
	send: ( event: IntentEvent ) => void;
	machine: () => Machine;
	isOpen: () => boolean;
	isSheet: () => boolean;
	policyOptions: () => PolicyOptions;
};

/**
 * Finds the link of the event target that the policy allows to preview.
 * @param context - The event context.
 * @param target  - The target of the DOM event.
 */
export function linkOf(
	context: EventContext,
	target: EventTarget | null
): HTMLAnchorElement | null {
	return previewableLink( target, context.policyOptions() );
}
