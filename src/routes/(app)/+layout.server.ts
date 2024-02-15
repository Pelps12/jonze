import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	console.log(locals);
	if (locals.user) {
		return {
			isAuthenticated: true,
			user: locals.user
		};
	}

	return { isAuthenticated: false };
};
