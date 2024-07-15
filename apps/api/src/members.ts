// event.ts
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import { DbType } from '@repo/db/typeaid';
import { UnkeyContext, unkey } from '@unkey/hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '.';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
	zodOpenAPIFormResponse,
	zodOpenAPIMember,
	zodOpenAPIMemberTag,
	zodOpenAPISuccess,
	zodOpenAPIUnauthorized,
	zodOpenAPIUser
} from './utils/helper';
import { WrapperSvix } from '@repo/webhooks';

const app = new OpenAPIHono<{
	Bindings: Bindings;
	Variables: { unkey: UnkeyContext; db: DbType; svix: WrapperSvix };
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

const listMembersRoute = createRoute({
	method: 'get',
	path: '/',
	summary: 'List Members',
	security: [{ [security.name]: [] }],
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.array(zodOpenAPIMember)
				}
			},
			description: 'Retrieve members'
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
	tags: ['Members']
});

app.openapi(listMembersRoute, async (c) => {
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}
	const members = await c.get('db').query.member.findMany({
		where: eq(schema.member.orgId, metadata.orgId),
		orderBy: (member, { desc }) => [desc(member.createdAt)]
	});

	return c.json(members);
});

const getMemberRoute = createRoute({
	method: 'get',
	path: '/{id}',
	summary: 'Get Member',
	security: [{ [security.name]: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: 'id',
					in: 'path'
				},
				example: 'om_01HPCN296XBAKD6QYVKNMARD4N',
				description: 'ID of member'
			})
		})
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: zodOpenAPIMember.extend({
						user: zodOpenAPIUser.pick({
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							profilePictureUrl: true
						}),
						addtionalInfo: zodOpenAPIFormResponse.nullish(),
						tags: zodOpenAPIMemberTag.nullish()
					})
				}
			},
			description: 'Retrieve member by ID'
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
	tags: ['Members']
});

app.openapi(getMemberRoute, async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}

	const member = await c.get('db').query.member.findFirst({
		where: and(
			eq(schema.member.orgId, metadata.orgId),
			eq(schema.member.id, c.req.valid('param').id)
		),
		with: {
			user: {
				columns: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					profilePictureUrl: true
				}
			},
			tags: true,
			additionalInfo: true
		},
		orderBy: (member, { desc }) => [desc(member.createdAt)]
	});

	if (!member) {
		throw new HTTPException(404, {
			message: 'Member not found'
		});
	}

	return c.json(member);
});

const updateMemberTagsRoute = createRoute({
	method: 'put',
	path: '/{id}/tags',
	summary: 'Update Member Tags',
	security: [{ [security.name]: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({
				param: {
					name: 'id',
					in: 'path'
				},
				example: 'om_01HPCN296XBAKD6QYVKNMARD4N',
				description: 'ID of member'
			})
		}),
		body: {
			content: {
				'application/json': {
					schema: z.object({
						tags: z.array(z.string())
					})
				}
			}
		}
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: zodOpenAPISuccess
				}
			},
			description: "Update a member's tags"
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
	tags: ['Members']
});

app.openapi(updateMemberTagsRoute, async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}

	const member = await c.get('db').query.member.findFirst({
		where: and(
			eq(schema.member.orgId, metadata.orgId),
			eq(schema.member.id, c.req.valid('param').id)
		),
		with: {
			user: {
				columns: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					profilePictureUrl: true
				}
			},
			tags: true,
			additionalInfo: true
		},
		orderBy: (member, { desc }) => [desc(member.createdAt)]
	});

	if (!member) {
		throw new HTTPException(404, {
			message: 'Member or Member Tags not found'
		});
	}

	const [memberTags] = await c
		.get('db')
		.insert(schema.memberTag)
		.values({
			id: member.id,
			names: c.req.valid('json').tags
		})
		.onConflictDoUpdate({
			target: schema.member.id,
			set: {
				names: member.tags
					? Array.from(new Set([...member.tags.names, ...c.req.valid('json').tags]).values())
					: c.req.valid('json').tags
			}
		})
		.returning();
	console.log(c.env.SVIX_TOKEN, 'SVIX_TOKEN');

	c.executionCtx.waitUntil(
		Promise.all([
			c.get('svix').message.create(metadata.orgId, {
				eventType: 'member.updated',
				payload: {
					type: 'member.updated',
					data: { ...member, tags: memberTags }
				}
			})
		])
	);

	return c.json({
		code: 201,
		message: 'Success'
	});
});

export default app;
