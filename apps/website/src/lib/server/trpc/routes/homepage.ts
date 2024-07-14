import { and, eq } from '@repo/db';
import { adminProcedure, router } from '..';
import schema from '@repo/db/schema';
import db from '$lib/server/db';
import { TRPCError } from '@trpc/server';
import { stripe } from '$lib/server/stripe';
import { z } from 'zod';

export const homePageRouter = router({
	home: adminProcedure.query(async ({ input, ctx }) => {
		const organization = await db.query.organization.findFirst({
			where: eq(schema.organization.id, input.orgId),
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
				}
			}
		});
		if (!organization) {
			throw new TRPCError({
				message: 'Organization not Found',
				code: 'NOT_FOUND'
			});
		}

		console.log(organization.members);

		const arr = Array.from([1, 2, 2, 2, 2, 2, 2, 3, 3, 4, 4, 4]);

		const chartData = {
			labels: organization.events.map((event) => event.name).reverse(),
			data: organization.events.map((event) => event.attendances.length).reverse()
		};

		return { organization, chartData, clientSecret: undefined };
	}),
	stripeTransactionHistory: adminProcedure.mutation(async ({ input }) => {
		const orgSubAccount = await db.query.organizationSubaccount.findFirst({
			where: eq(schema.organizationSubaccount.orgId, input.orgId),
			columns: {
				subaccountId: true
			}
		});
		if (!orgSubAccount)
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Org Not Found'
			});

		const { client_secret: clientSecret } = await stripe.accountSessions.create({
			account: orgSubAccount.subaccountId,
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
		return clientSecret;
	}),
	upgradePlan: adminProcedure
		.input(z.object({ period: z.enum(['monthly', 'yearly']), returnURL: z.string().url() }))
		.mutation(async ({ input, ctx }) => {
			if (!ctx.event.locals.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
			const member = await db.query.member.findFirst({
				where: and(
					eq(schema.member.orgId, input.orgId),
					eq(schema.member.role, 'OWNER'),
					eq(schema.member.userId, ctx.event.locals.user.id)
				)
			});
			if (!member) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Only the owner of this org has such privileges. \nSpeak with them about it'
				});
			}

			const period = input.period;

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
				success_url: input.returnURL,
				cancel_url: input.returnURL
			});

			if (!session.url)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "I really don't know 😅"
				});

			return {
				sessionUrl: session.url
			};
		})
});
