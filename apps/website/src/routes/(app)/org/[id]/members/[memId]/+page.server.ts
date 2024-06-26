/* import db from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dummyClient } from '$lib/server/posthog';
import svix from '$lib/server/svix';
import { memberUpdationSchema, membershipCreationSchema } from '$lib/formSchema/member';

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
			},
			tags: true
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
						planId: member.memberships[0].planId,
						provider: member.memberships[0].provider
					}
				: {},
			zod(membershipCreationSchema)
		),
		memberForm: await superValidate(
			member.tags ? { tags: member.tags.names } : {},
			zod(memberUpdationSchema)
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

		const member = await db.query.member.findFirst({
			where: eq(schema.member.id, event.params.memId)
		});

		if (!member) {
			error(404, 'Member not found');
		}
		const [newMembership] = await db
			.insert(schema.membership)
			.values({
				planId: form.data.planId,
				memId: event.params.memId,
				provider: form.data.provider,
				...(form.data.createdAt ? { createdAt: form.data.createdAt } : {})
			})
			.returning();
		console.log(newMembership, 'MEMBERSHIP');
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
					id: newMembership.id,
					...(useragent && { $useragent: useragent })
				}
			});
		if (newMembership) {
			event.platform?.context.waitUntil(
				Promise.all([
					dummyClient.flushAsync(),
					svix.message.create(event.params.id, {
						eventType: 'membership.updated',
						payload: {
							type: 'membership.updated',
							data: {
								...{ ...newMembership, member }
							}
						}
					})
				])
			);
			redirect(302, event.url);
		}

		return {
			form
		};
	},
	updatemember: async (event) => {
		const form = await superValidate(event, zod(memberUpdationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		console.log(form.data, 'Update Data');

		const member = await db.query.member.findFirst({
			where: eq(schema.member.id, event.params.memId)
		});

		if (!member) {
			error(404, 'Member not found');
		}

		if (form.data.tags.length > 0) {
			await db
				.insert(schema.memberTag)
				.values({ id: member.id, names: form.data.tags })
				.onConflictDoUpdate({
					target: schema.memberTag.id,
					set: { names: form.data.tags }
				});
		}

		const useragent = event.request.headers.get('user-agent');
		event.locals.user &&
			dummyClient.capture({
				distinctId: event.locals.user.id,
				event: 'new user tags',
				properties: {
					$ip: event.getClientAddress(),
					orgId: event.params.id,
					memId: event.params.memId,
					...(useragent && { $useragent: useragent })
				}
			});

		event.platform?.context.waitUntil(Promise.all([dummyClient.flushAsync()]));

		return {
			form
		};
	}
};
 */
