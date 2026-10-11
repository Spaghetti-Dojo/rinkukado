import { readFileSync } from 'node:fs';
import path from 'node:path';

const helpers = path.join( __dirname, '../../../sources/client/interactivity' );
const assets = path.join(
	__dirname,
	'../../../.claude/skills/interactivity-server-data/assets'
);

// The skill ships a copy of each helper. A copy that drifts misleads the
// agent that installs it.
it.each( [ 'zod.ts', 'server-data.ts' ] )(
	'keeps the skill copy of %s equal to the helper',
	( file ) => {
		expect( readFileSync( path.join( assets, file ), 'utf8' ) ).toBe(
			readFileSync( path.join( helpers, file ), 'utf8' )
		);
	}
);
