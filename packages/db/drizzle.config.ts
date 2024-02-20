import type { Config } from 'drizzle-kit';
import 'dotenv/config';
export default {
	schema: './schema/*.ts',
	out: './',
	dbCredentials: {
		uri: process.env.DATABASE_URL as string
	},
	driver: 'mysql2'
} satisfies Config;
