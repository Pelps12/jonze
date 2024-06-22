// forms.ts
import { and, arrayContains, eq, getTableColumns } from '@repo/db';
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
			}),
			responseField: z
				.string()
				.openapi({
					param: {
						name: 'responseField',
						in: 'query'
					}
				})
				.optional(),
			responseValue: z
				.string()
				.openapi({
					param: {
						name: 'responseValue',
						in: 'query'
					}
				})
				.optional()
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

	if (!!c.req.valid('query').responseField !== !!c.req.valid('query').responseValue) {
		throw new HTTPException(400, {
			message: 'Both Field and Value must be present'
		});
	}
	const responseField = c.req.valid('query').responseField;
	const responseValue = c.req.valid('query').responseValue;

	const responses = await c
		.get('db')
		.select({ ...getTableColumns(schema.formResponse) })
		.from(schema.formResponse)
		.innerJoin(schema.organizationForm, eq(schema.organizationForm.id, schema.formResponse.formId))
		.where(
			and(
				eq(schema.organizationForm.id, c.req.valid('query').id),
				eq(schema.organizationForm.orgId, metadata.orgId),
				responseField && responseValue
					? arrayContains(schema.formResponse.response, [
							{ label: responseField, response: responseValue }
						])
					: undefined
			)
		);

	return c.json(responses);
});

export default app;
