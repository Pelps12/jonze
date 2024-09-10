import { JWT_SECRET_KEY } from '$env/static/private';
import { PUBLIC_URL } from '$env/static/public';
import db from '$lib/server/db';
import { signJWT } from '$lib/server/helpers';
import posthog, { dummyClient } from '$lib/server/posthog';
import workos, { clientId } from '$lib/server/workos';
import type { ArrayElement, SessionType } from '$lib/types/misc';
import { inArray } from '@repo/db';
import schema from '@repo/db/schema';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import type { Organization } from '@workos-inc/node';
import type { Organization as dbOrganization } from '@repo/db';
import { sealData, unsealData } from 'iron-session';

type HasId = {
	id: number | string;
	[key: string]: any;
};

function mergeArraysById(
	arr1: Pick<dbOrganization, 'id' | 'name' | 'plan'>[],
	arr2: { memberId: string; id: string }[]
): SessionType['orgs'] {
	const merged = new Map<number | string, SessionType['orgs']>();

	// Add all items from arr1 to the map
	for (const item of arr1) {
		//@ts-ignore
		merged.set(item.id, item);
	}

	// Update or add items from arr2
	for (const item of arr2) {
		if (merged.has(item.id)) {
			// If item exists, merge properties
			merged.set(item.id, { ...merged.get(item.id)!, ...item });
		} else {
			// If item doesn't exist, add it
			//@ts-ignore
			merged.set(item.id, item);
		}
	}

	// Convert map values back to an array
	//@ts-ignore
	return Array.from(merged.values());
}

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

		const adminOms = organizationMemberships.data.filter((om) => om.role.slug !== 'member');
		let orgs: SessionType['orgs'];
		if (adminOms.length > 0) {
			const dbOrg = await db.query.organization.findMany({
				where: inArray(
					schema.organization.id,
					adminOms.map((om) => om.organizationId)
				),
				columns: {
					id: true,
					name: true,
					plan: true
				}
			});

			orgs = mergeArraysById(
				dbOrg,
				adminOms.map((om) => ({ id: om.organizationId, memberId: om.id }))
			);
		} else {
			orgs = [];
		}

		console.log(user);
		const token = await signJWT({ ...user, orgs: orgs });
		const sessionData: SessionType = { ...user, orgs: orgs, accessToken, refreshToken };
		const sessionToken = await sealData(sessionData, {
			password: JWT_SECRET_KEY
		});

		const url = new URL(callbackUrl ? callbackUrl : request.url);

		// Cleanup params
		url.searchParams.delete('code');

		//Add identifying query param
		url.searchParams.set('signedIn', 'true');

		// Redirect to the requested path and store the session
		if (!callbackUrl) {
			url.pathname = '/';
		}

		cookies.set('workos-session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
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
		redirect(302, url.toString());
	}

	// Use the information in `user` for further business logic.

	// Redirect the user to the homepage
	error(400, {
		message: 'No authorization code was received from AuthKit'
	});
};
