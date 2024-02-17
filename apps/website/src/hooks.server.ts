import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { verifyJwtToken } from '$lib/server/workos';
import { error, type Handle } from '@sveltejs/kit';
import type { Organization, User } from '@workos-inc/node';
import { eq, and, or } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token');
	console.log('Token', token);
	const verifiedToken = token && (await verifyJwtToken(token));
	console.log('Verified', verifiedToken);

	if (verifiedToken) {
		// @ts-expect-error: Already valid
		event.locals.user = verifiedToken as User & { orgs: Organization[] };
		if (event.request.url.includes('/org')) {
			const authorized = await db.query.member.findFirst({
				where: and(
					eq(schema.member.orgId, event.params.id ?? ''),
					eq(schema.member.userId, event.locals.user.id),
					or(eq(schema.member.role, 'ADMIN'), eq(schema.member.role, 'OWNER'))
				)
			});

			if (!authorized) {
				error(401, 'User are not an admin for this org');
			}
		}
	}
	const response = await resolve(event);
	return response;
};
