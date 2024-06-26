/* import db from '$lib/server/db';
import { and, eq, or } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { attendance } from '@repo/db/schema/attendance';
import { stripe } from '$lib/server/stripe'; */

/* export const load: PageServerLoad = async ({ params, locals, cookies }) => {
	console.log('888888', locals.user);
	if (!locals.user) {
		redirect(302, '/');
	}
	let layout: number[] | undefined;
	const rawLayoutCookie = cookies.get('PaneForge:layout');
	if (rawLayoutCookie) {
		console.log(rawLayoutCookie);
		layout = JSON.parse(rawLayoutCookie);
	}
	const authorized = await db.query.member.findFirst({
		where: and(
			eq(schema.member.orgId, params.id),
			eq(schema.member.userId, locals.user.id),
			or(eq(schema.member.role, 'ADMIN'), eq(schema.member.role, 'OWNER'))
		)
	});

	if (!authorized) {
		error(401, 'User are not an admin for this org');
	}
	const organization = await db.query.organization.findFirst({
		where: eq(schema.organization.id, params.id),
		with: {
			members: {
				with: {
					user: {
						columns: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							profilePictureUrl: true
						}
					}
				},
				limit: 5,
				orderBy: (member, { desc }) => [desc(member.createdAt)]
			},
			events: {
				with: {
					attendances: {
						columns: {
							id: true
						}
					}
				},
				orderBy: (event, { desc }) => [desc(event.start)]
			},
			forms: {
				where: eq(schema.organizationForm.name, 'User Info')
			},
			subaccount: true
		}
	});
	if (!organization) {
		error(404, 'Organization not Found');
	}

	console.log(organization.members);

	let clientSecret: string | undefined = undefined;
	if (organization.subaccount) {
		const accountSession = await stripe.accountSessions.create({
			account: organization.subaccount.subaccountId,
			components: {
				payments: {
					enabled: true,
					features: {
						refund_management: true,
						dispute_management: true,
						capture_payments: true
					}
				}
			}
		});
		clientSecret = accountSession.client_secret;
	}
	const arr = Array.from([1, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4, 4]);

	const chartData = {
		labels: organization.events.map((event) => event.name).reverse(),
		data: organization.events.map((event) => event.attendances.length).reverse()
	};

	return { organization, layout, chartData, clientSecret };
}; */

/* export const actions: Actions = {
	upgrade: async (event) => {
		if (!event.locals.user) error(401);
		const member = await db.query.member.findFirst({
			where: and(
				eq(schema.member.orgId, event.params.id),
				eq(schema.member.role, 'OWNER'),
				eq(schema.member.userId, event.locals.user.id)
			)
		});
		if (!member)
			error(401, 'Only the owner of this org has such privileges. \nSpeak with them about it');
		const formdata = await event.request.formData();

		const period = formdata.get('period');

		if (!period || (period !== 'yearly' && period !== 'monthly')) {
			error(400, 'Period missing');
		}

		const prices = await stripe.prices.list({
			lookup_keys: [`plus_${period}`],
			expand: ['data.product']
		});
		const session = await stripe.checkout.sessions.create({
			billing_address_collection: 'auto',
			line_items: [
				{
					price: prices.data[0].id,
					// For metered billing, do not pass quantity
					quantity: 1
				}
			],
			mode: 'subscription',
			success_url: event.url.toString(),
			cancel_url: event.url.toString()
		});

		if (!session.url) error(500);

		return redirect(302, session.url);
	}
}; */
