import { BaselimeLogger } from '@baselime/edge-logger';
import workos, { clientId, verifyJwtToken, verifyAccessToken } from '$lib/server/workos';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import type { Organization, User } from '@workos-inc/node';
import { PUBLIC_URL } from '$env/static/public';
import {
	AXIOM_DATASET,
	AXIOM_ENDPOINT,
	AXIOM_TOKEN,
	BASELIME_API_KEY,
	BASELIME_SERVICE,
	JWT_SECRET_KEY,
	WORKOS_CLIENT_ID,
	WORKOS_REDIRECT_URI
} from '$env/static/private';
import { sealData, unsealData } from 'iron-session';
import type { SessionType } from '$lib/types/misc';
import { sequence } from '@sveltejs/kit/hooks';
import { nanoid } from '@repo/db/utils/createId';
import { dummyClient } from '$lib/server/posthog';

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();
	const context = event.platform?.context || {
		waitUntil: () => {},
		passThroughOnException: () => {}
	};
	console.error('HSBVODISNVODI');

	const url = new URL(event.request.url);

	const logger = new BaselimeLogger({
		service: BASELIME_SERVICE,
		namespace: `${event.request.method} ${url.hostname}${url.pathname}`,
		apiKey: BASELIME_API_KEY,
		isLocalDev: event.platform ? false : true,
		ctx: context
	});
	console.error(error);

	logger.error(error);

	await logger.flush();

	return;
};

const handleAnalytics: Handle = async ({ event, resolve }) => {
	const context = event.platform?.context || {
		waitUntil: () => {},
		passThroughOnException: () => {}
	};
	const response = resolve(event);
	context.waitUntil(dummyClient.flushAsync());
	return response;
};

const handleLog: Handle = async ({ event, resolve }) => {
	const context = event.platform?.context || {
		waitUntil: () => {},
		passThroughOnException: () => {}
	};
	const url = new URL(event.request.url);
	const logger = new BaselimeLogger({
		service: BASELIME_SERVICE,
		namespace: `${event.request.method} ${url.hostname}${url.pathname}`,
		apiKey: BASELIME_API_KEY,
		isLocalDev: event.platform ? false : true,
		ctx: context
	});

	event.locals.logger = logger;

	const response = await resolve(event);

	context.waitUntil(logger.flush());

	return response;
};

const handleAuth: Handle = async ({ event, resolve }) => {
	console.log('HANDLE AUTH BEGIN');
	event.locals.user = undefined;

	const sessionToken = event.cookies.get('workos-session');

	if (sessionToken) {
		const { accessToken, refreshToken, ...verifiedSessionUser } = await unsealData<SessionType>(
			sessionToken,
			{
				password: JWT_SECRET_KEY
			}
		);
		const valid = await verifyAccessToken(accessToken);

		if (valid) {
			console.log('VALID ACCESS TOKEN');
			event.locals.user = verifiedSessionUser;
		} else {
			try {
				console.log('REFRESHING TOKEN');
				const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
					await workos.userManagement.authenticateWithRefreshToken({
						clientId: WORKOS_CLIENT_ID,
						refreshToken: refreshToken
					});

				const newSessionToken = await sealData(
					{ ...verifiedSessionUser, accessToken: newAccessToken, refreshToken: newRefreshToken },
					{
						password: JWT_SECRET_KEY
					}
				);

				event.cookies.set('workos-session', newSessionToken, {
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'lax',
					maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
				});

				event.locals.user = verifiedSessionUser;
			} catch (err) {
				console.log(err);
				event.cookies.delete('workos-session', {
					path: '/'
				});
			}
		}
	}

	const response = await resolve(event);

	console.log('HANDLE AUTH END');
	return response;
};

const handleAdminRestrict: Handle = async ({ event, resolve }) => {
	if (event.request.url.startsWith(`${PUBLIC_URL}/org/org_`)) {
		console.log('HANDLE AUTH ADMIN RESTRICT BEGIN');
		if (!event.locals.user) {
			redirect(302, `/api/auth?callbackUrl=${event.url.toString()}`);
		}
		if (event.locals.user) {
			const pathname = event.url.pathname;

			// Split the pathname into parts
			const parts = pathname.split('/');

			// Find the part that starts with 'org_'
			const orgId = parts.find((part) => part.startsWith('org_')) as string;
			const org = event.locals.user.orgs.find((org) => org.id === orgId);
			if (!org) {
				error(401, 'User are not an admin for this organization');
			}

			event.locals.member = {
				id: org.memberId,
				userId: event.locals.user.id,
				orgId: org.id
			} as any;
		} else {
			redirect(302, `/api/auth?callbackUrl=${event.url.toString()}`);
		}
	}

	const response = await resolve(event);

	console.log('AFTERRRRRR');
	return response;
};

export const handle = sequence(handleAnalytics, handleLog, handleAuth, handleAdminRestrict);
