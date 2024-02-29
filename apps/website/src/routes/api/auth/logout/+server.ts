import posthog, { dummyClient } from '$lib/server/posthog';
import { redirect, type RequestHandler } from '@sveltejs/kit';

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

	platform?.context.waitUntil(dummyClient.flushAsync());

	redirect(302, '/');
};
