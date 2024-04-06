import { UNKEY_API_KEY } from '$env/static/private';
import db from '$lib/server/db';
import unkey from '$lib/server/unkey';
import schema from '@repo/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, or, like } from '@repo/db';
import type { PageServerLoad, Actions } from './$types';
import { PUBLIC_APIKEY_PREFIX, PUBLIC_UPLODCARE_SECRET_KEY } from '$env/static/public';
import posthog, { dummyClient } from '$lib/server/posthog';
import workos from '$lib/server/workos';

export const load: PageServerLoad = async ({ locals, params, url }) => {
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
	return { keys, members: organization.members, logo: organization.logo };
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
	},

	createAdmin: async ({ request, locals, params }) => {
		if (!params.id) error(400, 'Organization ID Required');

		if (!locals.member) {
			error(401, 'You are not an admin');
		}
		const formData = await request.formData();
		const memId = formData.get('memId');

		if (typeof memId !== 'string') error(400, 'Invalid form');

		await workos.userManagement.updateOrganizationMembership(memId, {
			roleSlug: 'admin'
		});

		await db
			.update(schema.member)
			.set({
				role: 'ADMIN'
			})
			.where(eq(schema.member.id, memId));
	},

	updateLogo: async ({ request, params }) => {
		const formData = await request.formData();

		const file = formData.get('logo');
		if (file && typeof file !== 'string') {
			const uploadFormData = new FormData();
			uploadFormData.append('UPLOADCARE_PUB_KEY', PUBLIC_UPLODCARE_SECRET_KEY);
			uploadFormData.append('UPLOADCARE_STORE', 'auto');
			uploadFormData.append(file.name, file);
			uploadFormData.append('metadata[orgId]', params.id);
			uploadFormData.append('metadata[type]', 'logo');

			const uploadResponse = await fetch('https://upload.uploadcare.com/base/', {
				body: uploadFormData,
				method: 'POST'
			});

			if (uploadResponse) {
				const uploadResult = await uploadResponse.json();

				const cdnUrl = `https://ucarecdn.com/${uploadResult[file.name]}/`;

				console.log(cdnUrl);

				await db
					.update(schema.organization)
					.set({
						logo: cdnUrl
					})
					.where(eq(schema.organization.id, params.id));
			}
		} else {
			console.log(file, 'IFLRNOFIERNOFERON');
			error(400, 'Come on');
		}
	},

	searchMember: async ({ params, locals, url, request }) => {
		if (!params.id) error(400, 'Organization ID Required');

		if (!locals.member) {
			error(401, 'You are not an admin');
		}

		const formData = await request.formData();
		const userEmail = formData.get('invitee_email');

		const members = await db
			.select({
				memId: schema.member.id,
				userEmail: schema.user.email
			})
			.from(schema.member)
			.innerJoin(schema.user, eq(schema.member.userId, schema.user.id))
			.where(
				and(
					eq(schema.member.orgId, params.id),
					like(schema.user.email, `%${userEmail}%`),
					eq(schema.member.role, 'MEMBER')
				)
			)
			.limit(5);

		console.log('bufornfoeifnoer');

		return { members };
	}
};
