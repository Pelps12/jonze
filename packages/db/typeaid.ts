import { connect } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import schema from './schema';
const connection = connect({
	host: '',
	username: '',
	password: '',
	fetch: (url: string, init: any) => {
		if (!process.env.PUBLIC_URL?.includes('localhost')) delete (init as any)['cache']; // Remove cache header
		return fetch(url, init);
	}
});

const db = drizzle(connection, { schema });

export type DbType = typeof db;
