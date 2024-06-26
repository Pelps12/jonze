/* import db from '$lib/server/db';
import { stripe } from '$lib/server/stripe';
import { eq } from '@repo/db';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_URL } from '$env/static/public';

export const load: PageServerLoad = async (event) => {
	let subAccountId: string | undefined = undefined;
	let onboardingComplete = false;

	const orgSubAccount = await db.query.organizationSubaccount.findFirst({
		where: eq(schema.organizationSubaccount.orgId, event.params.id),
		columns: {
			subaccountId: true
		}
	});
	if (!orgSubAccount) {
		const { id } = await stripe.accounts.create({
			type: 'standard'
		});

		await db.insert(schema.organizationSubaccount).values({
			orgId: event.params.id,
			subaccountId: id
		});
		subAccountId = id;
	} else {
		const { details_submitted } = await stripe.accounts.retrieve(orgSubAccount.subaccountId);
		console.log('HAVE DETAILS BEN SUBMITTED', details_submitted);
		if (details_submitted) redirect(302, `${PUBLIC_URL}/org/${event.params.id}/plans`);
		subAccountId = orgSubAccount.subaccountId;
	}

	const accountSession = await stripe.accountSessions.create({
		account: subAccountId,
		components: {
			account_onboarding: {
				enabled: true,
				features: {
					external_account_collection: true
				}
			}
		}
	});
	return { clientSecret: accountSession.client_secret };
};
 */
