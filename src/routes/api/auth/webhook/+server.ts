import { WORKOS_WEBHOOK_SECRET } from '$env/static/private';
import db from '$lib/server/drizzle/db';
import schema from '$lib/server/drizzle/schema';
import workos from '$lib/server/workos';
import { error, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const sigHeader = request.headers.get('WorkOS-Signature');
	console.log(sigHeader, WORKOS_WEBHOOK_SECRET);
	if (!sigHeader) {
		error(401);
	}

	const payload = await request.json();

	const webhook = workos.webhooks.constructEvent({
		payload: payload,
		sigHeader: sigHeader,
		secret: WORKOS_WEBHOOK_SECRET
	});

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
					emailVerified: updatedUser.emailVerified
				})
				.where(eq(schema.user.id, updatedUser.id));
			break;
		}

		case 'organization_membership.added': {
			const member = webhook.data;
			const existingMember = await db.query.member.findFirst({
				where: eq(schema.member.orgId, member.organizationId)
			});
			await db.insert(schema.member).values({
				id: member.id,
				orgId: member.organizationId,
				userId: member.userId,
				role: existingMember ? 'MEMBER' : 'OWNER'
			});
			break;
		}

		case 'organization_membership.removed': {
			const member = webhook.data;
			await db.delete(schema.member).where(eq(schema.member.id, member.id));
			break;
		}
	}

	return new Response(null, {
		status: 200
	});
};
