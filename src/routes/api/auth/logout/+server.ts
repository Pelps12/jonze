import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('token', {
		path: '/'
	});

	redirect(302, '/');
};
