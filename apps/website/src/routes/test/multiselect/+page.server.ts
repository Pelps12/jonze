import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { schema } from './schema';
export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(schema))
	};
};
