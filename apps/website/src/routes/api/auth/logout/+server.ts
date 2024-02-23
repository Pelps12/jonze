import posthog from '$lib/server/posthog';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, locals, getClientAddress }) => {
	cookies.delete('token', {
		path: '/'
	});
	if (locals.user) {
		posthog.capture({
			distinctId: locals.user.id,
			event: 'user logged out',
			properties: {
				$ip: getClientAddress()
			}
		});
	}

	redirect(302, '/');
};
