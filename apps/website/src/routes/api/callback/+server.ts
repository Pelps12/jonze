import { signJWT } from '$lib/server/helpers';
import posthog, { dummyClient } from '$lib/server/posthog';
import workos, { clientId } from '$lib/server/workos';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies, platform, getClientAddress }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const callbackUrl = url.searchParams.get('state');
	console.log(callbackUrl);
	if (code) {
		const { user, accessToken, refreshToken } = await workos.userManagement.authenticateWithCode({
			code,
			clientId
		});
		console.log(accessToken);

		//Find Better Way
		const organizationMemberships = await workos.userManagement.listOrganizationMemberships({
			userId: user.id
		});
		const orgs = await Promise.all(
			organizationMemberships.data
				.filter((om) => om.role.slug !== 'member')
				.map(async (membership) => {
					const org = await workos.organizations.getOrganization(membership.organizationId);
					return {
						id: org.id,
						name: org.name,
						memberId: membership.id
					};
				})
		);
		console.log(user);
		const token = await signJWT({ ...user, orgs: orgs });

		const url = new URL(callbackUrl ? callbackUrl : request.url);

		// Cleanup params
		url.searchParams.delete('code');

		//Add identifying query param
		url.searchParams.set('signedIn', 'true');

		// Redirect to the requested path and store the session
		if (!callbackUrl) {
			url.pathname = '/';
		}

		cookies.set('token', token, {
			path: '/',
			httpOnly: true
		});

		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: user.id,
			event: 'user logged in',
			properties: {
				$ip: getClientAddress(),
				...(useragent && { $useragent: useragent })
			}
		});

		platform?.context.waitUntil(dummyClient.flushAsync());
		redirect(302, url.toString());
	}

	// Use the information in `user` for further business logic.

	// Redirect the user to the homepage
	error(400, {
		message: 'No authorization code was received from AuthKit'
	});
};
