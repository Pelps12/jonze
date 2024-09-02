import { JWT_SECRET_KEY } from '$env/static/private';
import { PUBLIC_URL } from '$env/static/public';
import posthog, { dummyClient } from '$lib/server/posthog';
import workos from '$lib/server/workos';
import type { SessionType } from '$lib/types/misc';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { unsealData } from 'iron-session';
import { decodeJwt } from 'jose';

export const POST: RequestHandler = async ({
	cookies,
	locals,
	getClientAddress,
	platform,
	request
}) => {
	cookies.delete('token', {
		path: '/'
	});

	const session = cookies.get('workos-session');

	if (!session) {
		redirect(302, PUBLIC_URL);
	}
	cookies.delete('workos-session', {
		path: '/'
	});
	if (locals.user) {
		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: locals.user.id,
			event: 'user logged out',
			properties: {
				$ip: getClientAddress(),
				...(useragent && { $useragent: useragent })
			}
		});
	}

	const { accessToken } = await unsealData<SessionType>(session, {
		password: JWT_SECRET_KEY
	});

	const sessionId = decodeJwt(accessToken).sid as string;

	redirect(302, workos.userManagement.getLogoutUrl({ sessionId }));
};
