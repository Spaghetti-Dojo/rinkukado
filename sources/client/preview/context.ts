/**
 * The shared context of the delegated listeners. It holds the mutable
 * references of the region and the callbacks that the listeners use to read
 * the store and to send events to the driver.
 */

import { previewableLink } from './dom';

import type { Mode } from './dom';
import type { PolicyOptions } from './policy';
import type { IntentEvent, Machine } from './intent';
import type { Availability } from './network';

/**
 * The mutable references that the delegated listeners read and write.
 * `bound` tells whether `bind` already attached the listeners of this
 * region, so that a second init attaches nothing twice. `activeLink` holds
 * the link under the pointer, and `openLink` holds the link that the dialog
 * belongs to. The two differ while the pointer moves from one link to the
 * next, and the close of the first must not touch the second. `pendingTap` holds
 * the href of a tap whose navigation was prevented and whose preview has
 * not settled yet, so a later failure can still navigate.
 */
export type Refs = {
	bound: boolean;
	frame: number | null;
	dialog: HTMLElement | null;
	closeButton: HTMLButtonElement | null;
	activeLink: HTMLAnchorElement | null;
	openLink: HTMLAnchorElement | null;
	pendingTap: string | null;
	returningFocus: boolean;
};

/**
 * What the event handlers need from the store, without importing it.
 */
export type EventContext = {
	refs: Refs;
	send: ( event: IntentEvent ) => void;
	machine: () => Machine;
	isOpen: () => boolean;
	mode: () => Mode;
	policyOptions: () => PolicyOptions;
	availability: ( href: string ) => Availability;
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
