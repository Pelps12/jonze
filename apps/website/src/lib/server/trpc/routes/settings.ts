import svix from '$lib/server/svix';
import schema from '@repo/db/schema';
import { and, or, eq, like } from '@repo/db';
import { adminProcedure, router } from '..';
import db from '$lib/server/db';
import { TRPCError } from '@trpc/server';
import unkey from '$lib/server/unkey';
import { UNKEY_API_KEY } from '$env/static/private';
import { PUBLIC_APIKEY_PREFIX } from '$env/static/public';
import { dummyClient } from '$lib/server/posthog';
import { z } from 'zod';
import workos from '$lib/server/workos';
import { stripe } from '$lib/server/stripe';

export const settingsRouter = router({
	getSettings: adminProcedure.query(async ({ ctx, input }) => {
		const organization = await db.query.organization.findFirst({
			where: eq(schema.organization.id, input.orgId),
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
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Org Not Found'
			});
		}

		let webhookUrl = undefined;
		try {
			const dashboard = await svix.authentication.appPortalAccess(organization.id, {});
			webhookUrl = dashboard.url;
			console.log(webhookUrl);
		} catch (err) {
			console.log(err);
		}

		let stripeClientSecret: string | undefined = undefined;

		const keys = organization.members.flatMap((member) => member.keys);
		console.log(keys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
		return {
			keys,
			members: organization.members,
			logo: organization.logo,
			homePage: organization.website,
			webhookUrl,
			stripeClientSecret
		};
	}),

	getStripeAccountDashboard: adminProcedure.mutation(async ({ input, ctx }) => {
		const subAccount = await db.query.organizationSubaccount.findFirst({
			where: eq(schema.organizationSubaccount.orgId, input.orgId),
			columns: {
				subaccountId: true
			}
		});
		if (!subAccount) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Org Not Found'
			});
		}

		const { client_secret } = await stripe.accountSessions.create({
			account: subAccount.subaccountId,
			components: {
				account_management: {
					enabled: true,
					features: {
						external_account_collection: true
					}
				}
			}
		});
		return { clientSecret: client_secret };
	}),
	createAPIKey: adminProcedure.mutation(async ({ input, ctx }) => {
		const createdKey = await unkey.keys.create({
			apiId: UNKEY_API_KEY,
			prefix: PUBLIC_APIKEY_PREFIX,
			ownerId: ctx.member.id,
			meta: {
				orgId: ctx.member.orgId
			}
		});

		if (createdKey.error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Error creating API Key'
			});
		}

		console.log(createdKey.result);

		const insertedApiKey = await db.insert(schema.apiKey).values({
			keyId: createdKey.result.keyId,
			memId: ctx.member.id,
			hint: createdKey.result.key.split('_')[2].slice(0, 4)
		});

		const useragent = ctx.event.request.headers.get('user-agent');
		dummyClient.capture({
			distinctId: ctx.member.userId,
			event: 'API Key Created',
			properties: {
				$ip: ctx.event.getClientAddress(),
				orgId: input.orgId,
				...(useragent && { $useragent: useragent })
			}
		});

		return { key: createdKey.result.key };
	}),
	enableWebhooks: adminProcedure.mutation(async ({ ctx, input }) => {
		const org = await db.query.organization.findFirst({
			where: eq(schema.organization.id, input.orgId)
		});

		if (!org) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Org not Found'
			});
		}

		const response = await svix.application.create({ name: org.name, uid: org.id });
		console.log(await response.text());
		const { url } = await svix.authentication.appPortalAccess(org.id, {});

		return { webhookUrl: url };
	}),
	createAdmin: adminProcedure
		.input(
			z.object({
				memberId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const memId = input.memberId;

			await workos.userManagement.updateOrganizationMembership(memId, {
				roleSlug: 'admin'
			});

			await db
				.update(schema.member)
				.set({
					role: 'ADMIN',
					updatedAt: new Date()
				})
				.where(eq(schema.member.id, memId));
		}),
	getMember: adminProcedure
		.input(
			z.object({
				email: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const userEmail = input.email;

			const members = await db
				.select({
					memId: schema.member.id,
					userEmail: schema.user.email
				})
				.from(schema.member)
				.innerJoin(schema.user, eq(schema.member.userId, schema.user.id))
				.where(
					and(
						eq(schema.member.orgId, input.orgId),
						like(schema.user.email, `%${userEmail}%`),
						eq(schema.member.role, 'MEMBER')
					)
				)
				.limit(5);

			console.log('bufornfoeifnoer');

			return { members };
		}),
	changeHomePage: adminProcedure
		.input(
			z.object({
				websiteUrl: z.string()
			})
		)
		.mutation(async ({ input }) => {
			await db
				.update(schema.organization)
				.set({
					website: input.websiteUrl
				})
				.where(eq(schema.organization.id, input.orgId));
		}),
	changeOrgLogo: adminProcedure
		.input(
			z.object({
				cdnUrl: z.string()
			})
		)
		.mutation(async ({ input }) => {
			await db
				.update(schema.organization)
				.set({
					logo: input.cdnUrl
				})
				.where(eq(schema.organization.id, input.orgId));
		})
});
