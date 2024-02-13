import type { PageServerLoad } from '../$types';
import { fail, type Actions, redirect, error } from '@sveltejs/kit';
import db from '$lib/server/drizzle/db';
import { and, eq } from 'drizzle-orm';
import schema from '$lib/server/drizzle/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function objectsHaveSameKeys(...objects: any[]) {
	const allKeys = objects.reduce((keys, object) => keys.concat(Object.keys(object)), []);
	const union = new Set(allKeys);
	return objects.every((object) => union.size === Object.keys(object).length);
}
export const load: PageServerLoad = async ({ params }) => {
	const orgId = params.orgId;
	const orgForm = await db.query.organizationForm.findFirst({
		where: and(
			eq(schema.organizationForm.orgId, orgId),
			eq(schema.organizationForm.name, 'User Info')
		)
	});
	if (!orgForm) {
		error(404, 'Org Not Found');
	}
	return { form: orgForm.form, formName: orgForm.name };
};

export const actions: Actions = {
	default: async ({ request, locals, url, params }) => {
		const callbackUrl = url.searchParams.get('callbackUrl');
		if (!locals.user) {
			redirect(302, '/');
		}
		const orgId = params.orgId;
		if (!orgId) {
			error(404, 'Org Not Found');
		}
		const orgForm = await db.query.organizationForm.findFirst({
			where: and(
				eq(schema.organizationForm.orgId, orgId),
				eq(schema.organizationForm.name, 'User Info')
			)
		});

		if (!orgForm) {
			error(404, 'Form Not Found');
		}
		const formData = await request.formData();

		const userResponseArray = Array.from(formData.entries()).filter(
			(val) => typeof val[1] === 'string'
		) as [string, string][];

		const userResponse = userResponseArray.reduce<Record<string, string>>((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {});
		console.log('userResponse', userResponse);

		if (!objectsHaveSameKeys(userResponse, orgForm.form)) {
			// Again, return { form } and things will just work.
			return fail(400);
		}

		await db.insert(schema.formResponse).values({
			formId: orgForm.id,
			response: userResponse
		});

		redirect(302, callbackUrl ?? '/');
	}
};
