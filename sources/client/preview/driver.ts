import { initial, nextDeadline, reduce } from './intent';

import type { Command, IntentEvent, Machine } from './intent';
import type { Timings } from './types';

/**
 * The side effects that the machine asks the store to run. The store owns
 * the DOM and the network; the driver owns the machine and the timer.
 */
export type Effects = {
	timings: () => Timings;
	prefetch: ( href: string ) => void;
	open: ( href: string ) => void;
	close: ( href: string | null ) => void;
	abort: ( href: string | null ) => void;
	navigate: ( href: string ) => void;
};

/**
 * The scheduler of the machine, and the read access to its current value.
 */
export type Driver = {
	send: ( event: IntentEvent ) => void;
	machine: () => Machine;
	reset: () => void;
};

type DriverState = {
	effects: Effects;
	machine: Machine;
	timer: number | null;
};

// Every runner receives the href of the machine before the transition,
// because the `abort` and the `close` commands carry no href of their own.
type Runners = {
	[ K in Command[ 'type' ] ]: (
		effects: Effects,
		command: Extract< Command, { type: K } >,
		previous: string | null
	) => void;
};

const runners: Runners = {
	prefetch: ( effects, command ) => {
		effects.prefetch( command.href );
	},
	open: ( effects, command ) => {
		effects.open( command.href );
	},
	close: ( effects, _command, previous ) => {
		effects.close( previous );
	},
	abort: ( effects, _command, previous ) => {
		effects.abort( previous );
	},
	navigate: ( effects, command ) => {
		effects.navigate( command.href );
	},
};

function run(
	state: DriverState,
	command: Command,
	previous: string | null
): void {
	const runner = runners[ command.type ] as (
		effects: Effects,
		command: Command,
		previous: string | null
	) => void;

	runner( state.effects, command, previous );
}

function schedule( state: DriverState ): void {
	if ( state.timer !== null ) {
		window.clearTimeout( state.timer );
		state.timer = null;
	}

	const deadline = nextDeadline( state.machine );

	if ( deadline === null ) {
		return;
	}

	const delay = Math.max( 0, deadline - Date.now() );

	state.timer = window.setTimeout( () => {
		state.timer = null;
		send( state, { type: 'tick', at: Date.now() } );
	}, delay );
}

function send( state: DriverState, event: IntentEvent ): void {
	const previous = state.machine.href;
	const result = reduce( state.machine, event, state.effects.timings() );

	state.machine = result.machine;

	result.commands.forEach( ( command ) => {
		run( state, command, previous );
	} );

	schedule( state );
}

/**
 * Builds the driver of one region. The driver holds the machine and the
 * single timer that carries every deadline of the machine.
 * @param effects - The side effects of the store.
 */
export function createDriver( effects: Effects ): Driver {
	const state: DriverState = { effects, machine: initial, timer: null };

	return {
		send: ( event: IntentEvent ): void => {
			send( state, event );
		},
		machine: (): Machine => state.machine,
		reset: (): void => {
			state.machine = initial;
		},
	};
}
