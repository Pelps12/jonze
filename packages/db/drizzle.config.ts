import type { Config } from 'drizzle-kit';
import 'dotenv/config';
export default {
	schema: './schema/*.ts',
	out: './',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL as string
	},
	driver: 'pg'
} satisfies Config;
