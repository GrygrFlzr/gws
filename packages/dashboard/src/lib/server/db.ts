import { createDatabase } from '@gws/core/db';
import { DATABASE_URL } from '$env/static/private';

export const db = createDatabase(DATABASE_URL);
