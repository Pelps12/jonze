import { WORKOS_WEBHOOK_SECRET } from '$env/static/private';
import db from '$lib/server/db';
import schema from '@repo/db/schema';
import workos from '$lib/server/workos';
import { error, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { Webhooks } from './helper';
import posthog from '$lib/server/posthog';

export const POST: RequestHandler = async ({ request, platform }) => {
	const sigHeader = request.headers.get('WorkOS-Signature');
	console.log(sigHeader, WORKOS_WEBHOOK_SECRET);
	if (!sigHeader) {
		error(401);
	}

	const payload = await request.json();
	console.log('16');

	const webhook = await workos.webhooks.constructEvent({
		payload,
		sigHeader,
		secret: WORKOS_WEBHOOK_SECRET
	});

	console.log('24');

	switch (webhook.event) {
		case 'user.created': {
			const newUser = webhook.data;
			await db.insert(schema.user).values({
				id: newUser.id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				profilePictureUrl: newUser.profilePictureUrl,
				email: newUser.email,
				emailVerified: newUser.emailVerified
			});

			posthog.capture({
				distinctId: newUser.id,
				event: 'user signed up',
				properties: {
					$set: { name: `${newUser.firstName} ${newUser.lastName}`, email: newUser.email }
				}
			});
			break;
		}

		case 'user.updated': {
			const updatedUser = webhook.data;
			await db
				.update(schema.user)
				.set({
					firstName: updatedUser.firstName,
					lastName: updatedUser.lastName,
					profilePictureUrl: updatedUser.profilePictureUrl,
					email: updatedUser.email,
					emailVerified: updatedUser.emailVerified,
					updatedAt: new Date()
				})
				.where(eq(schema.user.id, updatedUser.id));

			posthog.capture({
				distinctId: updatedUser.id,
				event: 'user updated',
				properties: {
					$set: {
						name: `${updatedUser.firstName} ${updatedUser.lastName}`,
						email: updatedUser.email
					}
				}
			});
			break;
		}

		case 'organization_membership.removed': {
			const member = webhook.data;
			await db.delete(schema.member).where(eq(schema.member.id, member.id));
			break;
		}
	}
	console.log('64');

	platform?.context.waitUntil(posthog.shutdownAsync());
	return new Response(null, {
		status: 200
	});
};
