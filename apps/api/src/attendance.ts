// attendance.ts
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import { DbType } from '@repo/db/typeaid';
import { UnkeyContext, unkey } from '@unkey/hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '.';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { zodOpenAPIAttendance, zodOpenAPIUnauthorized } from './utils/helper';

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

const getAttendanceRoute = createRoute({
	method: 'get',
	path: '/{eventId}',
	summary: 'Get Attendance',
	security: [{ [security.name]: [] }],
	request: {
		query: z.object({
			eventId: z
				.string()
				.optional()
				.openapi({
					param: {
						name: 'eventId',
						in: 'query'
					},
					example: 'evt_SP6prmGnMzt5spsr',
					description: 'ID of event'
				}),
			memId: z
				.string()
				.optional()
				.openapi({
					param: {
						name: 'memId',
						in: 'query'
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
					schema: z.array(zodOpenAPIAttendance)
				}
			},
			description: 'Retrieve attendance by event or member ID'
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
	tags: ['Attendance']
});

app.openapi(getAttendanceRoute, async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}
	const eventId = c.req.valid('query').eventId;
	const memId = c.req.valid('query').memId;

	if (!memId && !eventId) {
		throw new HTTPException(400, {
			message: 'Member or Event ID required'
		});
	}
	if (eventId) {
		const event = await c.get('db').query.event.findFirst({
			where: and(eq(schema.event.id, eventId)),
			columns: {
				orgId: true
			}
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

		const attendance = await c.get('db').query.attendance.findMany({
			where: and(eq(schema.attendance.eventId, eventId)),
			orderBy: (attendance, { desc }) => [desc(attendance.createdAt)]
		});

		return c.json(attendance);
	} else if (memId) {
		const member = await c.get('db').query.member.findFirst({
			where: and(eq(schema.member.id, memId)),
			columns: {
				orgId: true
			}
		});

		if (!member) {
			throw new HTTPException(404, {
				message: 'Event not found'
			});
		}

		if (member.orgId !== metadata.orgId) {
			throw new HTTPException(401, {
				message: 'Invalide API Token'
			});
		}

		const attendance = await c.get('db').query.attendance.findMany({
			where: and(eq(schema.attendance.memId, memId)),
			orderBy: (attendance, { desc }) => [desc(attendance.createdAt)]
		});

		return c.json(attendance);
	} else {
		throw new HTTPException(400, {
			message: 'Member or Event ID required'
		});
	}
});

export default app;
