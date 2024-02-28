import { OpenAPIHono, z } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { UnkeyContext, unkey } from '@unkey/hono';
import schema from '@repo/db/schema';
import { connect, drizzle, eq } from '@repo/db';
import type { DbType } from '@repo/db/typeaid';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import events from './events';
import members from './members';
import { swaggerUI } from '@hono/swagger-ui';

export type Bindings = {
	DATABASE_HOST: string;
	DATABASE_USERNAME: string;
	DATABASE_PASSWORD: string;
	TEST_SECRET: string;
	ENVIRONMENT: string;
};

const app = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: { unkey: UnkeyContext; db: DbType };
}>();

app.use('*', async (c, next) =>
	cors({
		origin:
			c.env.ENVIRONMENT === 'production'
				? 'https://jonze.co'
				: ['https://dev.jonze.co', 'http://localhost:5173'],
		allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
		maxAge: 600,
		credentials: true
	})(c, next)
);

app.use(logger());

app.get('/', async (c) => {
	return c.text('Welcome to Jonze API');
});

app.use('*', async (c, next) => {
	console.log(c.env.DATABASE_HOST, c.env.DATABASE_PASSWORD, c.env.DATABASE_USERNAME);
	console.log('abc', c.env.TEST_SECRET);
	const connection = connect({
		host: c.env.DATABASE_HOST,
		username: c.env.DATABASE_USERNAME,
		password: c.env.DATABASE_PASSWORD,
		fetch: (url: string, init: any) => {
			delete (init as any)['cache'];
			return fetch(url, init);
		}
	});
	console.log('PLEASE', connection.config);
	const db = drizzle(connection, { schema });
	c.set('db', db);
	return await next();
});

app.route('/events', events);
app.route('/members', members);

app.doc('/doc', (c) => ({
	openapi: '3.1.0',
	info: {
		version: '1.0.0',
		title: 'My API'
	},
	servers: [
		{
			url: new URL(c.req.url).origin
		}
	]
}));

app.get('/ui', swaggerUI({ url: '/doc' }));

export default app;
