import db from '$lib/server/db';
import schema from '@repo/db/schema';
import workos, { clientId, verifyJwtToken, verifyAccessToken } from '$lib/server/workos';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import type { Organization, User } from '@workos-inc/node';
import { eq, and, or } from 'drizzle-orm';
import { PUBLIC_URL } from '$env/static/public';
import {
	AXIOM_DATASET,
	AXIOM_ENDPOINT,
	AXIOM_TOKEN,
	JWT_SECRET_KEY,
	WORKOS_CLIENT_ID,
	WORKOS_REDIRECT_URI
} from '$env/static/private';
import { sealData, unsealData } from 'iron-session';
import type { SessionType } from '$lib/types/misc';
import { sequence } from '@sveltejs/kit/hooks';
import { nanoid } from '@repo/db/utils/createId';

const logsHttpMinStatusCode = 100; // Filter logs and send only logs with status code above or equal
const responseHeadersToCapture = ['cf-cache-status', 'cf-ray'];
const requestHeadersToCapture = ['user-agent'];

const Version = '0.3.0';

function getHeaderMap(headers: Headers, allowlist: string[]) {
	if (!allowlist.length) {
		return {};
	}

	return [...headers].reduce<Record<string, string>>((acc, [headerKey, headerValue]) => {
		if (allowlist.includes(headerKey)) {
			acc[headerKey] = headerValue;
		}

		return acc;
	}, {});
}

const handleLog: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const logs: any[] = [];

	const response = await resolve(event);

	const duration = Date.now() - start;
	const cf = {};

	const url = `${AXIOM_ENDPOINT}/v1/datasets/${AXIOM_DATASET}/ingest`;

	//@ts-ignore
	if (event.request.cf) {
		// delete does not work so we copy into a new object
		//@ts-ignore
		Object.keys(event.request.cf).forEach((key) => {
			if (key !== 'tlsClientAuth' && key !== 'tlsExportedAuthenticator') {
				//@ts-ignore
				cf[key] = event.request.cf[key];
			}
		});
	}
	if (response.status >= logsHttpMinStatusCode) {
		logs.push({
			_time: Date.now(),
			request: {
				url: event.request.url,
				headers: getHeaderMap(event.request.headers, requestHeadersToCapture),
				method: event.request.method,
				...cf
			},
			response: {
				duration,
				headers: getHeaderMap(response.headers, responseHeadersToCapture),
				status: response.status
			},
			worker: {
				version: Version,
				id: nanoid(6),
				started: start
			}
		});
	}

	event.platform?.context.waitUntil(
		fetch(url, {
			signal: AbortSignal.timeout(30_000),
			method: 'POST',
			body: logs.map((log) => JSON.stringify(log)).join('\n'),
			headers: {
				'Content-Type': 'application/x-ndjson',
				Authorization: `Bearer ${AXIOM_TOKEN}`,
				'User-Agent': 'axiom-cloudflare/' + Version
			}
		})
	);

	return response;
};

const handleAuth: Handle = async ({ event, resolve }) => {
	console.log('first pre-processing');
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

	return await resolve(event);
};

const handleAdminRestrict: Handle = async ({ event, resolve }) => {
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

	console.log('AFTERRRRRR');
	return response;
};

export const handle = sequence(handleLog, handleAuth, handleAdminRestrict);
