import { UNKEY_API_KEY } from '$env/static/private';
import db from '$lib/server/db';
import unkey from '$lib/server/unkey';
import schema from '@repo/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { PUBLIC_APIKEY_PREFIX } from '$env/static/public';
import posthog, { dummyClient } from '$lib/server/posthog';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	console.log(params.id);

	if (!locals.member) {
		error(401, 'You are not an admin');
	}

	const organization = await db.query.organization.findFirst({
		where: eq(schema.organization.id, params.id),
		with: {
			members: {
				where: or(eq(schema.member.role, 'ADMIN'), eq(schema.member.role, 'OWNER')),
				with: {
					keys: true,
					user: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							profilePictureUrl: true
						}
					}
				}
			}
		}
	});

	if (!organization) {
		error(404, 'Org Not Found');
	}
	const keys = organization.members.flatMap((member) => member.keys);
	console.log(keys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
	return { keys, members: organization.members };
};

export const actions: Actions = {
	create: async ({ locals, params, getClientAddress, platform, request }) => {
		if (!params.id) error(400, 'Organization ID Required');

		if (!locals.member) {
			error(401, 'You are not an admin');
		}
		const createdKey = await unkey.keys.create({
			apiId: UNKEY_API_KEY,
			prefix: PUBLIC_APIKEY_PREFIX,
			ownerId: locals.member.id,
			meta: {
				orgId: locals.member.orgId
			}
		});

		if (createdKey.error) {
			error(500, 'Error creating API Key');
		}

		console.log(createdKey.result);

		const insertedApiKey = await db.insert(schema.apiKey).values({
			keyId: createdKey.result.keyId,
			memId: locals.member.id,
			hint: createdKey.result.key.split('_')[2].slice(0, 4)
		});

		const useragent = request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: locals.member.userId,
			event: 'API Key Created',
			properties: {
				$ip: getClientAddress(),
				orgId: params.id,
				...(useragent && { $useragent: useragent })
			}
		});

		platform?.context.waitUntil(dummyClient.flushAsync());

		return { key: createdKey.result.key };
	}
};
