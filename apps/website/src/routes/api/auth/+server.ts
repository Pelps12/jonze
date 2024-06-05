import { WORKOS_REDIRECT_URI } from '$env/static/private';

import workos, { clientId } from '$lib/server/workos';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const callbackUrl = url.searchParams.get('callbackUrl');
	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		// Specify that we'd like AuthKit to handle the authentication flow
		provider: 'authkit',
		state: callbackUrl ?? undefined,
		// The callback endpoint that WorkOS will redirect to after a user authenticates
		redirectUri: WORKOS_REDIRECT_URI,
		clientId
	});

	redirect(302, authorizationUrl);
};
