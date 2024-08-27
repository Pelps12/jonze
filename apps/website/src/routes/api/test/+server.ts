import { applyRefinement } from '@repo/form-validation';

import type { RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

export const GET: RequestHandler = async () => {
	const schema = z.string();
	const newSchema = applyRefinement(schema, (val) => val.length < 10, 'Invalid Value Length');

	console.log(
		await newSchema.parseAsync('edhoadhwoadwioadwiaodwa'),
		await newSchema.parseAsync('edh')
	);
	return new Response();
};
