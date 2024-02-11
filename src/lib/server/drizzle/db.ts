import 'dotenv/config';
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import { DATABASE_HOST, DATABASE_PASSWORD, DATABASE_USERNAME } from '$env/static/private';

// create the connection
const connection = connect({
	host: DATABASE_HOST,
	username: DATABASE_USERNAME,
	password: DATABASE_PASSWORD
});

const db = drizzle(connection);
export default db;
