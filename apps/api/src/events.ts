// event.ts
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import { DbType } from '@repo/db/typeaid';
import { UnkeyContext, unkey } from '@unkey/hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '.';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { createZodObject, zodOpenAPIEvent, zodOpenAPIUnauthorized } from './utils/helper';

const app = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: { unkey: UnkeyContext; db: DbType };
}>();

const security = app.openAPIRegistry.registerComponent('securitySchemes', 'API Key', {
	type: 'apiKey',
	in: 'header',
	name: 'x-api-key'
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

const listEventsRoute = createRoute({
	method: 'get',
	path: '/',
	summary: 'List Events',
	security: [{ [security.name]: [] }],
	request: {
		query: z.object({
			limit: z
				.string()
				.optional()
				.default('10')
				.openapi({
					param: {
						name: 'limit',
						in: 'query'
					},
					example: '10',
					description: 'Limit of event returned'
				})
		})
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.array(zodOpenAPIEvent)
				}
			},
			description: 'Retrieve events'
		},
		401: {
			content: {
				'application/json': {
					schema: zodOpenAPIUnauthorized
				}
			},
			description: 'Returns an error'
		}
	},
	tags: ['Events']
});

app.openapi(listEventsRoute, async (c) => {
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}
	const limit = c.req.query('limit');
	const events = await c.get('db').query.event.findMany({
		where: eq(schema.event.orgId, metadata.orgId),
		orderBy: (event, { desc }) => [desc(event.start)],
		limit: limit ? parseInt(limit) : 100
	});

	return c.json(events);
});

const getEventRoute = createRoute({
	method: 'get',
	path: '/{id}',
	summary: 'Get Event',
	security: [{ [security.name]: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: 'id',
					in: 'path'
				},
				example: 'evt_SP6prmGnMzt5spsr',
				description: 'ID of event'
			})
		})
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: zodOpenAPIEvent
				}
			},
			description: 'Retrieve event by ID'
		},
		401: {
			content: {
				'application/json': {
					schema: zodOpenAPIUnauthorized
				}
			},
			description: 'Returns an error'
		}
	},
	tags: ['Events']
});

app.openapi(getEventRoute, async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}

	const event = await c.get('db').query.event.findFirst({
		where: and(eq(schema.event.id, c.req.valid('param').id)),
		orderBy: (event, { desc }) => [desc(event.start)]
	});

	if (!event) {
		throw new HTTPException(404, {
			message: 'Event not found'
		});
	}

	if (event.orgId !== metadata.orgId) {
		throw new HTTPException(401, {
			message: 'Invalide API Token'
		});
	}

	return c.json(event);
});

export default app;
