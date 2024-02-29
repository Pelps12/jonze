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
		params: z.object({
			eventId: z.string().openapi({
				param: {
					name: 'eventId',
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
					schema: z.array(zodOpenAPIAttendance)
				}
			},
			description: 'Retrieve attendance by eventID'
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

	const event = await c.get('db').query.event.findFirst({
		where: and(eq(schema.event.id, c.req.valid('param').eventId)),
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
		where: and(eq(schema.attendance.eventId, c.req.valid('param').eventId)),
		orderBy: (attendance, { desc }) => [desc(attendance.createdAt)]
	});

	return c.json(attendance);
});

export default app;
