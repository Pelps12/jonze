import { verifyJwtToken } from '$lib/server/workos';
import type { Handle } from '@sveltejs/kit';
import type { Organization, User } from '@workos-inc/node';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token');
	console.log('Token', token);
	const verifiedToken = token && (await verifyJwtToken(token));
	console.log('Verified', verifiedToken);

	if (verifiedToken) {
		event.locals.user = verifiedToken.user as User & { orgs: Organization[] };
	}
	const response = await resolve(event);
	return response;
};
