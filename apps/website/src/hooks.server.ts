import db from '$lib/server/db';
import schema from '@repo/db/schema';
import workos, { clientId, verifyJwtToken } from '$lib/server/workos';
import { error, redirect, type Handle } from '@sveltejs/kit';
import type { Organization, User } from '@workos-inc/node';
import { eq, and, or } from 'drizzle-orm';
import { PUBLIC_URL } from '$env/static/public';
import { WORKOS_REDIRECT_URI } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token');
	console.log('Token', token);
	const verifiedToken = token && (await verifyJwtToken(token));
	console.log('Verified', verifiedToken);

	// @ts-expect-error: Already valid
	event.locals.user = verifiedToken as User & { orgs: Organization[] };

	if (event.request.url.includes(`${PUBLIC_URL}/org/org_`)) {
		if (!event.locals.user) {
			const loginUrl = workos.userManagement.getAuthorizationUrl({
				// Specify that we'd like AuthKit to handle the authentication flow
				provider: 'authkit',
				state: event.url.toString(),
				// The callback endpoint that WorkOS will redirect to after a user authenticates
				redirectUri: `${WORKOS_REDIRECT_URI}`,
				clientId
			});
			redirect(302, loginUrl);
		}
		if (verifiedToken) {
			console.log('BUOCWNCIONWONEWIOEWFC');

			const pathname = event.url.pathname;

			// Split the pathname into parts
			const parts = pathname.split('/');

			// Find the part that starts with 'org_'
			const orgId = parts.find((part) => part.startsWith('org_')) as string;
			const org = event.locals.user.orgs.find((org) => org.id === orgId);
			console.log(org);
			console.log(event.locals.user, orgId);
			if (!org) {
				error(401, 'User are not an admin for this organization');
			}

			event.locals.member = {
				id: org.memberId,
				userId: event.locals.user.id,
				orgId: org.id
			} as any;
		} else {
			const loginUrl = workos.userManagement.getAuthorizationUrl({
				// Specify that we'd like AuthKit to handle the authentication flow
				provider: 'authkit',
				state: event.url.toString(),
				// The callback endpoint that WorkOS will redirect to after a user authenticates
				redirectUri: `${WORKOS_REDIRECT_URI}`,
				clientId
			});
			redirect(302, loginUrl);
		}
	}
	const response = await resolve(event);
	return response;
};
