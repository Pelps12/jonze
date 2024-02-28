// event.ts
import { and, eq } from '@repo/db';
import schema from '@repo/db/schema';
import { DbType } from '@repo/db/typeaid';
import { UnkeyContext } from '@unkey/hono';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '.';

const app = new Hono<{ Bindings: Bindings; Variables: { unkey: UnkeyContext; db: DbType } }>();

app.get('/', async (c) => {
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
app.get('/:id', async (c) => {
	console.log(c.get('unkey'));
	const metadata = c.get('unkey').meta as Record<string, string | undefined>;
	if (!metadata.orgId) {
		throw new HTTPException(400, {
			message: 'Bad API Key'
		});
	}

	const member = await c.get('db').query.member.findFirst({
		where: and(eq(schema.member.orgId, metadata.orgId), eq(schema.member.id, c.req.param('id'))),
		with: {
			user: {
				columns: {
					firstName: true,
					lastName: true,
					email: true,
					profilePictureUrl: true
				}
			}
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

export default app;
