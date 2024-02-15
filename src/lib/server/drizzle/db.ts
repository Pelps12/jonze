/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import { DATABASE_HOST, DATABASE_PASSWORD, DATABASE_USERNAME } from '$env/static/private';
import schema from './schema';

// create the connection
const connection = connect({
	host: DATABASE_HOST,
	username: DATABASE_USERNAME,
	password: DATABASE_PASSWORD,
	fetch: (url: string, init: any) => {
		delete (init as any)['cache']; // Remove cache header
		return fetch(url, init);
	}
});

const db = drizzle(connection, { schema });
export default db;
