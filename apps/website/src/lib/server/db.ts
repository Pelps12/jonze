import {
	DATABASE_HOST,
	DATABASE_PASSWORD,
	DATABASE_URL,
	DATABASE_USERNAME
} from '$env/static/private';
import { PUBLIC_URL } from '$env/static/public';
import { neon, drizzle } from '@repo/db';
import schema from '@repo/db/schema';

const connection = neon(DATABASE_URL);

const db = drizzle(connection, { schema });
export default db;
