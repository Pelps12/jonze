/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import schema from './schema';
import 'dotenv/config';

// create the connection
const connection = connect({
	host: process.env.DATABASE_HOST,
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	fetch: (url: string, init: any) => {
		if (!process.env.PUBLIC_URL?.includes('localhost')) delete (init as any)['cache']; // Remove cache header
		return fetch(url, init);
	}
});

const db = drizzle(connection, { schema });
export default db;
