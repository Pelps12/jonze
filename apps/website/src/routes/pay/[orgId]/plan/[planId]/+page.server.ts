import { WORKOS_REDIRECT_URI } from '$env/static/private';
import { PUBLIC_URL } from '$env/static/public';
import { stripe } from '$lib/server/stripe';
import workos, { clientId } from '$lib/server/workos';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import db from '$lib/server/db';
import { eq, and, not } from '@repo/db';
import schema from '@repo/db/schema';
import { getApplicationFee } from '$lib/utils';

export const load: PageServerLoad = async ({ url, locals, params }) => {
	const callbackUrl = url.searchParams.get('callbackUrl');
	if (!locals.user) {
		const loginUrl = workos.userManagement.getAuthorizationUrl({
			// Specify that we'd like AuthKit to handle the authentication flow
			provider: 'authkit',
			state: url.toString(),
			// The callback endpoint that WorkOS will redirect to after a user authenticates
			redirectUri: `${WORKOS_REDIRECT_URI}`,
			clientId
		});
		console.log(`${WORKOS_REDIRECT_URI}`);
		redirect(302, loginUrl);
	}
	const member = await db.query.member.findFirst({
		where: and(eq(schema.member.userId, locals.user.id), eq(schema.member.orgId, params.orgId)),
		columns: {
			id: true,
			additionalInfoId: true
		},
		with: {
			organization: {
				columns: {},
				with: {
					forms: {
						where: eq(schema.organizationForm.name, 'User Info')
					}
				}
			}
		}
	});
	console.log(member);

	if (!member || (member.organization.forms.length > 0 && !member.additionalInfoId)) {
		redirect(302, `/user/signup/${params.orgId}?callbackUrl=${url.toString()}`);
	}
	const plan = await db.query.plan.findFirst({
		where: and(eq(schema.plan.id, params.planId), not(eq(schema.plan.amount, '0.0'))),
		with: {
			organization: {
				columns: {
					id: true,
					name: true,
					logo: true
				},
				with: {
					subaccount: {
						columns: {
							subaccountId: true
						}
					}
				}
			}
		}
	});

	if (!plan) {
		error(404, 'Plan Not Found');
	}

	if (!plan.organization?.subaccount?.subaccountId) {
		error(403, 'Managed Memberships Not Enabled on This Org');
	}

	const price_data = {
		name: plan.name,
		amount: parseFloat(plan.amount ?? '0.0') * 100
	};

	let stripeCustomerId: string;
	const name =
		locals.user.firstName && locals.user.lastName
			? `${locals.user.firstName} ${locals.user.lastName}`
			: locals.user.firstName
				? locals.user.firstName
				: locals.user.lastName
					? locals.user.lastName
					: locals.user.email;

	const dbCustomer = await db.query.customer.findFirst({
		where: eq(schema.customer.memId, member.id),
		with: {
			member: {
				with: {
					user: true
				}
			}
		}
	});
	console.log(dbCustomer, locals.user.id);

	if (dbCustomer) {
		stripeCustomerId = dbCustomer.stripeId;
	} else {
		const stripeCustomer = await stripe.customers.create(
			{
				email: locals.user.email,
				name
			},
			{
				stripeAccount: plan.organization.subaccount.subaccountId
			}
		);

		stripeCustomerId = stripeCustomer.id;

		await db.insert(schema.customer).values({
			memId: member.id,
			stripeId: stripeCustomerId,
			orgId: plan.organization.id,
			userId: locals.user.id
		});
	}

	const session = await stripe.checkout.sessions.create(
		{
			customer: stripeCustomerId,
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: plan.name
						},
						unit_amount: price_data.amount
					},
					quantity: 1
				}
			],
			payment_intent_data: {
				description: `Payment for ${plan.name} by ${name}`,
				application_fee_amount: getApplicationFee(price_data.amount)
			},
			mode: 'payment',
			ui_mode: 'custom' as any,
			// The URL of your payment completion page
			return_url: callbackUrl ?? PUBLIC_URL,
			metadata: {
				planId: plan.id,
				memId: member.id
			}
		},
		{
			stripeAccount: plan.organization.subaccount.subaccountId
		}
	);
	/* 	const paymentIntent = await stripe.paymentIntents.create(
		{
			amount: price_data.amount,
			currency: 'usd',
			customer: stripeCustomerId,
			setup_future_usage: 'on_session',
			// In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
			automatic_payment_methods: {
				enabled: true
			},
			application_fee_amount:
				Math.ceil(0.07 * price_data.amount + 80) - Math.ceil(0.029 * price_data.amount + 30)
		},
		{
			stripeAccount: 'acct_1P0qIyF71HtSmbUP'
		}
	);
 */
	return {
		clientSecret: session.client_secret,
		stripeAccount: plan.organization.subaccount.subaccountId,
		price_data,
		org: plan.organization
	};
};
