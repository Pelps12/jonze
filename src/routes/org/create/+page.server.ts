import { JWT_SECRET_KEY } from '$env/static/private';
import workos from '$lib/server/workos';
import { redirect, type Actions, error } from '@sveltejs/kit';
import { SignJWT } from 'jose';

export const actions: Actions = {
	create: async ({ locals, request, cookies }) => {
		// TODO register the user
		if (!locals.user) {
			error(401, 'Not Logged In');
		}
		const name = (await request.formData()).get('name');
		if (!name) {
			error(400, 'No name given');
		}
		const organization = await workos.organizations.createOrganization({
			name: name.toString(),
			allowProfilesOutsideOrganization: true
		});

		await workos.userManagement.createOrganizationMembership({
			organizationId: organization.id,
			userId: locals.user.id
		});
		const newUser = {
			...locals.user,
			orgs: [...locals.user.orgs, { id: organization.id, name: organization.name }]
		};
		const token = await new SignJWT({
			// Here you might lookup and retrieve user details from your database
			user: newUser
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
		redirect(302, `/org/${organization.id}`);
	}
};
