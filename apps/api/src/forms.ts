// forms.ts
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import { DbType } from '@repo/db/typeaid';
import { UnkeyContext, unkey } from '@unkey/hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '.';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { zodOpenAPIEvent, zodOpenAPIForm, zodOpenAPIUnauthorized } from './utils/helper';

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

const listFormsRoute = createRoute({
	method: 'get',
	path: '/',
	summary: 'List Forms',
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
					description: 'Limit of forms returned'
				})
		})
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.array(zodOpenAPIForm)
				}
			},
			description: 'Retrieve Forms'
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
	tags: ['Forms']
});

app.openapi(listFormsRoute, async (c) => {
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}
	const limit = c.req.query('limit');
	const forms = await c.get('db').query.organizationForm.findMany({
		where: eq(schema.organizationForm.orgId, metadata.orgId),
		orderBy: (form, { desc }) => [desc(form.createdAt)],
		limit: limit ? parseInt(limit) : 100
	});

	return c.json(forms);
});

const getEventRoute = createRoute({
	method: 'get',
	path: '/{id}',
	summary: 'Get Form',
	security: [{ [security.name]: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: 'id',
					in: 'path'
				},
				example: 'form_FDCxyzsw9oBrkEBZ',
				description: 'ID of form'
			})
		})
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: zodOpenAPIForm
				}
			},
			description: 'Retrieve form by ID'
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
	tags: ['Forms']
});

app.openapi(getEventRoute, async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}

	const form = await c.get('db').query.organizationForm.findFirst({
		where: and(eq(schema.organizationForm.id, c.req.valid('param').id))
	});

	if (!form) {
		throw new HTTPException(404, {
			message: 'Event not found'
		});
	}

	if (form.orgId !== metadata.orgId) {
		throw new HTTPException(401, {
			message: 'Invalide API Token'
		});
	}

	return c.json(form);
});

export default app;
