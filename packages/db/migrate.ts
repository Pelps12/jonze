import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

async function migrateHelper() {
	const DATABASE_URL = process.env.DATABASE_URL;
	if (!DATABASE_URL) throw Error('Missing DATABASE_URL');
	const connection = neon(DATABASE_URL);
	const db = drizzle(connection);
	console.log('⏳ Running Migrations...');
	const start = Date.now();
	await migrate(db, { migrationsFolder: 'drizzle' });
	const end = Date.now();
	console.log(`✅ Migrations completed in ${end - start}ms`);
	process.exit(0);
}

migrateHelper().catch((err) => {
	console.error('❌ Migration Failed');
	console.error(err);
	process.exit(1);
});
