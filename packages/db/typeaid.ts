import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import schema from './schema';

const connection = neon(process.env.DATABASE_URL!);

const db = drizzle(connection, { schema });

export type DbType = typeof db;
