/**
 * The single entry point of Zod for the stores. It loads the English locale
 * one time, so every error names the field and the cause. Without a locale,
 * `zod/mini` reports only "Invalid input".
 */

import * as z from 'zod/mini';
import { en } from 'zod/locales';

z.config( en() );

export { z };
