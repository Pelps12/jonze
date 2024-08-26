import type { Context } from '$lib/server/trpc/context';
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError, z } from 'zod';
import workos, { verifyAccessToken, verifyJwtToken } from '../workos';
import type { Organization, User } from '@workos-inc/node';
import { JWT_SECRET_KEY, WORKOS_CLIENT_ID } from '$env/static/private';
import { sealData, unsealData } from 'iron-session';
import type { SessionType } from '$lib/types/misc';

const t = initTRPC.context<Context>().create({
	transformer: superjson
});
export const adminProcedure = t.procedure
	.input(z.object({ orgId: z.string() }))
	.use(async ({ ctx, next, input }) => {
		const sessionToken = ctx.event.cookies.get('workos-session');

		if (!sessionToken) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Make this request logged in'
			});
		}

		const { accessToken, refreshToken, ...verifiedSessionUser } = await unsealData<SessionType>(
			sessionToken,
			{
				password: JWT_SECRET_KEY
			}
		);

		const valid = await verifyAccessToken(accessToken);

		if (valid) {
			console.log('VALID ACCESS TOKEN');
			ctx.event.locals.user = verifiedSessionUser;
		}

		const user = ctx.event.locals.user;

		if (!user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Make this request logged in'
			});
		}

		// Find the part that starts with 'org_'
		const orgId = input.orgId;
		const org = user.orgs.find((org) => org.id === orgId);
		if (!org) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User are not an admin for this organization'
			});
		}

		const member = {
			id: org.memberId,
			userId: user.id,
			orgId: org.id
		};

		return next({
			ctx: { ...ctx, member, user }
		});
	});
export const { procedure, router, middleware, createCallerFactory } = t;
