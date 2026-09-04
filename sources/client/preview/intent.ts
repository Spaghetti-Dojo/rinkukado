import type { Timings } from './types';

export type Phase = 'idle' | 'intent' | 'open';

export type Machine = {
	phase: Phase;
	href: string | null;
	prefetchAt: number | null;
	openAt: number | null;
	closeAt: number | null;
};

export type IntentEvent =
	| { type: 'enter'; href: string; at: number }
	| { type: 'focus'; href: string; at: number }
	| { type: 'leave'; at: number }
	| { type: 'tick'; at: number }
	| { type: 'tap'; href: string }
	| { type: 'escape' }
	| { type: 'outside' }
	| { type: 'unavailable'; href: string };

export type Command =
	| { type: 'prefetch'; href: string }
	| { type: 'open'; href: string }
	| { type: 'close' }
	| { type: 'abort' }
	| { type: 'navigate'; href: string };

export type Result = {
	machine: Machine;
	commands: Array< Command >;
};

export const initial: Machine = {
	phase: 'idle',
	href: null,
	prefetchAt: null,
	openAt: null,
	closeAt: null,
};

export function nextDeadline( machine: Machine ): number | null {
	const deadlines = [
		machine.prefetchAt,
		machine.openAt,
		machine.closeAt,
	].filter( ( value ): value is number => value !== null );

	return deadlines.length > 0 ? Math.min( ...deadlines ) : null;
}

// Starts the intent timers for a link, unless the popover already shows it.
// A link that was open for another href must close first: the open phase
// never ends without a close command, no matter which event ends it.
function start(
	machine: Machine,
	event: { href: string; at: number },
	timings: Timings
): Result {
	if ( machine.phase === 'open' && machine.href === event.href ) {
		return { machine: { ...machine, closeAt: null }, commands: [] };
	}

	const commands: Array< Command > =
		machine.phase === 'open' ? [ { type: 'close' } ] : [];

	return {
		machine: {
			phase: 'intent',
			href: event.href,
			prefetchAt: event.at + timings.prefetch,
			openAt: event.at + timings.open,
			closeAt: null,
		},
		commands,
	};
}

// Handles the pointer or the focus that leaves the link.
function leave( machine: Machine, at: number, timings: Timings ): Result {
	if ( machine.phase === 'intent' ) {
		return { machine: initial, commands: [ { type: 'abort' } ] };
	}

	if ( machine.phase === 'open' ) {
		return {
			machine: { ...machine, closeAt: at + timings.close },
			commands: [],
		};
	}

	return { machine, commands: [] };
}

// Opens the link once its open deadline passes. The open command replaces
// a due prefetch: the open command fetches the content, so a separate
// prefetch command is not needed once the popover is ready to open.
function withOpen(
	machine: Machine,
	at: number,
	commands: Array< Command >
): Machine {
	if (
		machine.openAt === null ||
		at < machine.openAt ||
		machine.href === null
	) {
		return machine;
	}

	commands.push( { type: 'open', href: machine.href } );

	return { ...machine, phase: 'open', openAt: null, prefetchAt: null };
}

// Prefetches the link once its prefetch deadline passes, unless the open
// deadline is already due in the same tick.
function withPrefetch(
	machine: Machine,
	at: number,
	commands: Array< Command >
): Machine {
	if (
		machine.prefetchAt === null ||
		at < machine.prefetchAt ||
		machine.href === null
	) {
		return machine;
	}

	commands.push( { type: 'prefetch', href: machine.href } );

	return { ...machine, prefetchAt: null };
}

function withClose(
	machine: Machine,
	at: number,
	commands: Array< Command >
): Machine {
	if ( machine.closeAt === null || at < machine.closeAt ) {
		return machine;
	}

	commands.push( { type: 'close' } );

	return initial;
}

// Runs every deadline that the current time has reached, in order.
function tick( machine: Machine, at: number ): Result {
	const commands: Array< Command > = [];

	let next = withOpen( machine, at, commands );

	const didOpen = commands.length > 0;

	if ( ! didOpen ) {
		next = withPrefetch( next, at, commands );
	}

	next = withClose( next, at, commands );

	return { machine: next, commands };
}

// Handles a tap: it opens a new link, or it navigates on a second tap. A
// link that was open for another href closes first, for the same reason as
// in `start`.
function tap( machine: Machine, href: string ): Result {
	if ( machine.phase === 'open' && machine.href === href ) {
		return { machine, commands: [ { type: 'navigate', href } ] };
	}

	const commands: Array< Command > =
		machine.phase === 'open' ? [ { type: 'close' } ] : [];

	commands.push( { type: 'prefetch', href }, { type: 'open', href } );

	return {
		machine: {
			phase: 'open',
			href,
			prefetchAt: null,
			openAt: null,
			closeAt: null,
		},
		commands,
	};
}

// Handles a fetch that ended in no preview: it closes the popover, but only
// when the failed href is still the one the machine holds. A visitor who
// already moved on to another link must not have that link reset.
function unavailable( machine: Machine, href: string ): Result {
	if ( machine.phase !== 'open' || machine.href !== href ) {
		return { machine, commands: [] };
	}

	return { machine: initial, commands: [ { type: 'close' } ] };
}

// Handles escape and a click outside: both close the open popover at once.
function dismiss( machine: Machine ): Result {
	if ( machine.phase === 'idle' ) {
		return { machine, commands: [] };
	}

	return { machine: initial, commands: [ { type: 'close' } ] };
}

// Each handler receives the full event and re-checks its own type, so that
// `reduce` itself stays a plain lookup with no branch of its own.
function handleStart(
	machine: Machine,
	event: IntentEvent,
	timings: Timings
): Result {
	if ( event.type !== 'enter' && event.type !== 'focus' ) {
		return { machine, commands: [] };
	}

	return start( machine, event, timings );
}

function handleLeave(
	machine: Machine,
	event: IntentEvent,
	timings: Timings
): Result {
	if ( event.type !== 'leave' ) {
		return { machine, commands: [] };
	}

	return leave( machine, event.at, timings );
}

function handleTick( machine: Machine, event: IntentEvent ): Result {
	if ( event.type !== 'tick' ) {
		return { machine, commands: [] };
	}

	return tick( machine, event.at );
}

function handleTap( machine: Machine, event: IntentEvent ): Result {
	if ( event.type !== 'tap' ) {
		return { machine, commands: [] };
	}

	return tap( machine, event.href );
}

function handleDismiss( machine: Machine, event: IntentEvent ): Result {
	if ( event.type !== 'escape' && event.type !== 'outside' ) {
		return { machine, commands: [] };
	}

	return dismiss( machine );
}

function handleUnavailable( machine: Machine, event: IntentEvent ): Result {
	if ( event.type !== 'unavailable' ) {
		return { machine, commands: [] };
	}

	return unavailable( machine, event.href );
}

const handlers: Record<
	IntentEvent[ 'type' ],
	( machine: Machine, event: IntentEvent, timings: Timings ) => Result
> = {
	enter: handleStart,
	focus: handleStart,
	leave: handleLeave,
	tick: handleTick,
	tap: handleTap,
	escape: handleDismiss,
	outside: handleDismiss,
	unavailable: handleUnavailable,
};

export function reduce(
	machine: Machine,
	event: IntentEvent,
	timings: Timings
): Result {
	return handlers[ event.type ]( machine, event, timings );
}
