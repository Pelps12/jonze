import { JWT_SECRET_KEY } from '$env/static/private';
import workos, { clientId } from '$lib/server/workos';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { SignJWT } from 'jose';

export const GET: RequestHandler = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	if (code) {
		const { user } = await workos.userManagement.authenticateWithCode({
			code,
			clientId
		});

		//Find Better Way
		const organizationMemberships = await workos.userManagement.listOrganizationMemberships({
			userId: user.id
		});
		const orgs = await Promise.all(
			organizationMemberships.data.map(async (membership) => {
				const org = await workos.organizations.getOrganization(membership.organizationId);
				return org;
			})
		);
		console.log(user);
		const token = await new SignJWT({
			// Here you might lookup and retrieve user details from your database
			user: { ...user, orgs: orgs }
		})
			.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
			.setIssuedAt()
			.setExpirationTime('1h')
			.sign(new Uint8Array(Buffer.from(JWT_SECRET_KEY, 'base64')));

		const url = new URL(request.url);

		// Cleanup params
		url.searchParams.delete('code');

		// Redirect to the requested path and store the session
		url.pathname = '/';

		cookies.set('token', token, {
			path: '/',
			httpOnly: true
		});

		redirect(302, url.toString());
	}

	// Use the information in `user` for further business logic.

	// Redirect the user to the homepage
	error(400, {
		message: 'No authorization code was received from AuthKit'
	});
};
