import { DATABASE_HOST, DATABASE_PASSWORD, DATABASE_USERNAME } from '$env/static/private';
import { PUBLIC_URL } from '$env/static/public';
import { connect, drizzle } from '@repo/db';
import schema from '@repo/db/schema';

const connection = connect({
	host: DATABASE_HOST,
	username: DATABASE_USERNAME,
	password: DATABASE_PASSWORD,
	fetch: (url: string, init: any) => {
		if (!PUBLIC_URL?.includes('localhost')) delete (init as any)['cache']; // Remove cache header
		return fetch(url, init);
	}
});

const db = drizzle(connection, { schema });
export default db;
