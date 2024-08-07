import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
export default defineConfig({
	schema: './schema/*.ts',
	out: './drizzle',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL as string
	},
	driver: 'pg'
});
