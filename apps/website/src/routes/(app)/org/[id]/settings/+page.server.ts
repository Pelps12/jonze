import db from '$lib/server/db';

import schema from '@repo/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from '@repo/db';
import type { Actions } from './$types';
import { PUBLIC_UPLODCARE_SECRET_KEY } from '$env/static/public';

/* 
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
			},
			subaccount: true
		}
	});

	if (!organization) {
		error(404, 'Org Not Found');
	}

	let webhookUrl = undefined;
	try {
		const dashboard = await svix.authentication.appPortalAccess(organization.id, {});
		webhookUrl = dashboard.url;
	} catch (err) {
		console.log(err);
	}

	let stripeClientSecret: string | undefined = undefined;

	if (organization.subaccount) {
		const { client_secret } = await stripe.accountSessions.create({
			account: organization.subaccount.subaccountId,
			components: {
				account_management: {
					enabled: true,
					features: {
						external_account_collection: true
					}
				}
			}
		});
		stripeClientSecret = client_secret;
	}

	const keys = organization.members.flatMap((member) => member.keys);
	console.log(keys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
	return {
		keys,
		members: organization.members,
		logo: organization.logo,
		webhookUrl,
		stripeClientSecret
	};
}; */

export const actions: Actions = {
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
	}
};
