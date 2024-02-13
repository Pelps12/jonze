import type { Config } from 'drizzle-kit';
export default {
	schema: './src/lib/server/drizzle/schema/*.ts',
	out: './src/lib/server/drizzle',
	dbCredentials: {
		uri: process.env.DATABASE_URL as string
	},
	driver: 'mysql2'
} satisfies Config;
