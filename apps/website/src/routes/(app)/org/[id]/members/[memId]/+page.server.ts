import db from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { membershipCreationSchema } from './schema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dummyClient } from '$lib/server/posthog';

export const load: PageServerLoad = async ({ params }) => {
	const member = await db.query.member.findFirst({
		where: eq(schema.member.id, params.memId),
		with: {
			attendances: {
				with: {
					event: {
						columns: {
							id: true,
							name: true
						}
					}
				},
				orderBy: (attendance, { desc }) => [desc(attendance.createdAt)]
			},
			memberships: {
				with: {
					plan: {
						columns: {
							id: true,
							name: true
						}
					}
				},
				orderBy: (membership, { desc }) => [desc(membership.createdAt)],
				limit: 1
			},
			user: {
				columns: {
					id: true,
					firstName: true,
					lastName: true,
					profilePictureUrl: true,
					email: true
				}
			}
		}
	});

	const availablePlans = db.query.plan.findMany({
		where: eq(schema.plan.orgId, params.id),
		columns: {
			id: true,
			name: true
		}
	});
	if (!member) {
		error(404, 'User not Found');
	}

	console.log(member);
	return {
		member,
		form: await superValidate(
			member.memberships[0]
				? {
						planId: member.memberships[0].planId
					}
				: {},
			zod(membershipCreationSchema)
		),
		plans: availablePlans
	};
};

export const actions: Actions = {
	updatemembership: async (event) => {
		const form = await superValidate(event, zod(membershipCreationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		console.log(form.data, 'Update Data');
		const newEvent = await db
			.insert(schema.membership)
			.values({
				planId: form.data.planId,
				memId: event.params.memId,
				provider: form.data.provider,
				...(form.data.createdAt ? { createdAt: form.data.createdAt } : {})
			})
			.returning({ insertedId: schema.membership.id });

		//Capture event updated

		const useragent = event.request.headers.get('user-agent');
		event.locals.user &&
			dummyClient.capture({
				distinctId: event.locals.user.id,
				event: 'new user membership',
				properties: {
					$ip: event.getClientAddress(),
					planId: form.data.planId,
					orgId: event.params.id,
					memId: event.params.memId,
					id: newEvent[0].insertedId,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newEvent) {
			event.platform?.context.waitUntil(dummyClient.flushAsync());
			redirect(302, event.url);
		}

		return {
			form
		};
	}
};
