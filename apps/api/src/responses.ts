// forms.ts
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import { DbType } from '@repo/db/typeaid';
import { UnkeyContext, unkey } from '@unkey/hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '.';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
	zodOpenAPIEvent,
	zodOpenAPIForm,
	zodOpenAPIFormResponse,
	zodOpenAPIUnauthorized
} from './utils/helper';

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

const listResponsesRoute = createRoute({
	method: 'get',
	path: '/',
	summary: 'List Responses',
	security: [{ [security.name]: [] }],
	request: {
		query: z.object({
			id: z.string().openapi({
				param: {
					name: 'id',
					in: 'query'
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
					schema: z.array(zodOpenAPIFormResponse)
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
	tags: ['Responses']
});

app.openapi(listResponsesRoute, async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}

	const form = await c.get('db').query.organizationForm.findFirst({
		where: and(eq(schema.organizationForm.id, c.req.valid('query').id)),
		with: {
			responses: true
		}
	});

	if (!form) {
		throw new HTTPException(404, {
			message: 'Form not found'
		});
	}

	if (form.orgId !== metadata.orgId) {
		throw new HTTPException(401, {
			message: 'Invalide API Token'
		});
	}

	return c.json(form.responses);
});

export default app;
