import { eq } from '@repo/db';
import { adminProcedure, router } from '..';
import schema from '@repo/db/schema';
import db from '$lib/server/db';
import { TRPCError } from '@trpc/server';
import { stripe } from '$lib/server/stripe';

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
	})
});
