import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { eq } from '@repo/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import fm from 'front-matter';

export const load: PageServerLoad = async ({ params }) => {
	const blogResponse = await fetch(`https://files.jonze.co/${params.name}.md`);

	if (!blogResponse.ok) error(400, 'Something Happened While Fetching Blog');

	const blog = await blogResponse.text();

	const formatted = fm(blog);
	const newTransform = await marked.parse(formatted.body);
	console.log(formatted);

	console.log(newTransform);

	return {
		content: {
			code: newTransform,
			attributes: formatted.attributes
		}
	};
};
