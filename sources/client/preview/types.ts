/**
 * The shared types of the preview: the preview payload, and the types of
 * the data that the server gives to the store. The schemas are the source
 * of the server types.
 */

import type { z } from '../interactivity/zod';
import type { configSchema, stateSchema, timingsSchema } from './schemas';

export type Thumbnail = {
	src: string;
	srcset: string;
	width: number;
	height: number;
	alt: string;
};

export type Preview = {
	id: number;
	title: string;
	excerpt: string;
	permalink: string;
	thumbnail: Thumbnail | null;
};

export type Timings = z.infer< typeof timingsSchema >;

export type ServerConfig = z.infer< typeof configSchema >;

export type ServerState = z.infer< typeof stateSchema >;
