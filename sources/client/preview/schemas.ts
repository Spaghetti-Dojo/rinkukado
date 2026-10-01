/**
 * The schemas of the data that the server gives to the `rinkukado` store.
 * Each schema holds exactly the keys that the server sends.
 */

import * as z from '../interactivity/zod';

const nonNegativeInt = (): z.ZodMiniInt => z.int().check( z.nonnegative() );

const nonEmptyString = (): z.ZodMiniString =>
	z.string().check( z.minLength( 1 ) );

// Matches Config::timings().
export const timingsSchema = z.strictObject( {
	prefetch: nonNegativeInt(),
	open: nonNegativeInt(),
	close: nonNegativeInt(),
} );

// Matches PopoverRegion::clientConfig().
export const configSchema = z.strictObject( {
	endpoint: z.url( { protocol: /^https?$/ } ),
	// Empty for a visitor who is not logged in.
	nonce: z.string(),
	rootSelector: nonEmptyString(),
	containerSelector: nonEmptyString(),
	denyClass: nonEmptyString(),
	timings: timingsSchema,
	sheetQuery: nonEmptyString(),
	hoverQuery: nonEmptyString(),
} );

// Matches PopoverRegion::state(). The server sends the labels and the
// initial values of the dialog.
export const stateSchema = z.strictObject( {
	closeLabel: z.string(),
	ctaLabel: z.string(),
	isOpen: z.boolean(),
	isSheet: z.boolean(),
	hasThumbnail: z.boolean(),
	title: z.string(),
	excerpt: z.string(),
	permalink: z.string(),
	thumbnailSrc: z.string(),
	thumbnailSrcset: z.string(),
	thumbnailAlt: z.string(),
} );
