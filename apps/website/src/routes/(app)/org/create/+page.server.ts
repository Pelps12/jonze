import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { signJWT } from '$lib/server/helpers';
import workos, { clientId } from '$lib/server/workos';
import { redirect, type Actions, error } from '@sveltejs/kit';
import posthog, { dummyClient } from '$lib/server/posthog';
import type { PageServerLoad } from './$types';
import { JWT_SECRET_KEY, WORKOS_REDIRECT_URI } from '$env/static/private';
import { unsealData, sealData } from 'iron-session';
import type { SessionType } from '$lib/types/misc';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) {
		redirect(302, `/api/auth?callbackUrl=${url.toString()}`);
	}
};

export const actions: Actions = {
	create: async ({ locals, request, cookies, getClientAddress, platform }) => {
		// TODO register the user
		if (!locals.user) {
			error(401, 'Not Logged In');
		}

		const sessionToken = cookies.get('workos-session');
		if (!sessionToken) {
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

		//Insert into our DB
		await db.insert(schema.organization).values({
			id: organization.id,
			name: organization.name
		});

		await db.insert(schema.plan).values({
			name: 'Default Plan',
			orgId: organization.id,
			amount: '0.00',
			start: new Date(),
			interval: '1 year'
		});

		const om = await workos.userManagement.createOrganizationMembership({
			organizationId: organization.id,
			userId: locals.user.id,
			roleSlug: 'owner'
		});

		await db.insert(schema.member).values({
			id: om.id,
			orgId: om.organizationId,
			userId: om.userId,
			role: 'OWNER'
		});

		const originalSession = await unsealData<SessionType>(sessionToken, {
			password: JWT_SECRET_KEY
		});

		const newUser: SessionType = {
			...originalSession,
			orgs: [
				...originalSession.orgs,
				{ id: organization.id, name: organization.name, memberId: om.id }
			],
			accessToken: originalSession.accessToken,
			refreshToken: originalSession.refreshToken
		};
		const token = await signJWT(newUser);

		const newSessionToken = await sealData(newUser, {
			password: JWT_SECRET_KEY
		});

		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'organization created',
			properties: {
				$ip: getClientAddress(),
				orgId: organization.id,
				name: name.toString(),
				...(useragent && { $useragent: useragent })
			}
		});

		const url = new URL(request.url);

		// Cleanup params
		url.searchParams.delete('code');

		// Redirect to the requested path and store the session
		url.pathname = '/';

		cookies.set('workos-session', newSessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
		});
		redirect(302, `/org/${organization.id}`);
	}
};
