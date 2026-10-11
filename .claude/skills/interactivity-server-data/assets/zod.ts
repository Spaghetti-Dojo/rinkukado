/**
 * The single entry point of Zod for the stores. It loads the English locale
 * one time, so every error names the field and the cause. Without a locale,
 * `zod/mini` reports only "Invalid input".
 */

import { config } from 'zod/mini';
import { en } from 'zod/locales';

config( en() );

// Export each binding by name. A namespace object as one value export
// stops the tree shaking, and the bundle then holds all of Zod.
export * from 'zod/mini';
