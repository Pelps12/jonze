import { Hono } from 'hono';
import { UnkeyContext, unkey } from '@unkey/hono';
import schema from '@repo/db/schema';
import { connect, drizzle, eq } from '@repo/db';
import type { DbType } from '@repo/db/typeaid';
import { HTTPException } from 'hono/http-exception';
import events from './events';
import members from './members';
type Bindings = {
	DATABASE_HOST: string;
	DATABASE_USERNAME: string;
	DATABASE_PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: { unkey: UnkeyContext; db: DbType } }>();

app.get('/', async (c) => {
	return c.text('Welcome to Jonze API');
});

app.use(
	'*',
	unkey({
		getKey: (c) => c.req.header('x-api-key')
	})
);

app.use('*', (c, next) => {
	if (c.get('unkey').valid === false) {
		throw new HTTPException(401, {
			message: 'Invalid API Key'
		});
	}
	return next();
});

app.use('*', async (c, next) => {
	const connection = connect({
		host: c.env.DATABASE_HOST,
		username: c.env.DATABASE_USERNAME,
		password: c.env.DATABASE_PASSWORD,
		fetch: (url: string, init: any) => {
			delete (init as any)['cache']; // Remove cache header
			return fetch(url, init);
		}
	});
	const db = drizzle(connection, { schema });
	c.set('db', db);
	return await next();
});

app.route('/events', events);
app.route('/members', members);

export default app;
