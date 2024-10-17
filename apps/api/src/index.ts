import { OpenAPIHono, z } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { UnkeyContext, unkey } from '@unkey/hono';
import schema from '@repo/db/schema';
import { neon, drizzle, eq } from '@repo/db';
import type { DbType } from '@repo/db/typeaid';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import events from './events';
import members from './members';
import attendance from './attendance';
import forms from './forms';
import responses from './responses';
import { swaggerUI } from '@hono/swagger-ui';
import { WrapperSvix } from '@repo/webhooks';
import integrations from './integrations';

export type Bindings = {
	DATABASE_HOST: string;
	DATABASE_USERNAME: string;
	DATABASE_PASSWORD: string;
	DATABASE_URL: string;
	TEST_SECRET: string;
	ENVIRONMENT: string;
	SVIX_TOKEN: string;
	RESEND_API_KEY: string;
	GOOGLE_WALLET_PRIVATE_KEY: string;
	GOOGLE_WALLET_ISSUER_ID: string;
	GOOGLE_WALLET_SERVICE_ACC_EMAIL: string;
};

const app = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: { unkey: UnkeyContext; db: DbType; svix: WrapperSvix };
}>();

app.use('*', async (c, next) =>
	cors({
		origin:
			c.env.ENVIRONMENT === 'production'
				? '*'
				: ['https://dev.jonze.co', 'http://localhost:5173', 'http://localhost:8787'],
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
	console.log('abc', c.env.TEST_SECRET);
	const connection = neon(c.env.DATABASE_URL);
	const db = drizzle(connection, { schema });
	const svix = new WrapperSvix(c.env.SVIX_TOKEN);
	c.set('db', db);
	c.set('svix', svix);
	return await next();
});

app.route('/events', events);
app.route('/members', members);
app.route('/attendance', attendance);
app.route('/forms', forms);
app.route('/responses', responses);

app.doc('/doc', (c) => ({
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'Jonze API'
	},
	servers: [
		{
			url: 'https://api.jonze.co'
		},
		{
			url: 'https://dev-api.jonze.co'
		},
		{
			url: 'http://127.0.0.1:8787'
		}
	]
}));

app.route('/integrations', integrations);

app.get('/ui', swaggerUI({ url: '/doc' }));

export default app;
