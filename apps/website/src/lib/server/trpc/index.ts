import type { Context } from '$lib/server/trpc/context';
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError, z } from 'zod';
import { verifyJwtToken } from '../workos';
import type { Organization, User } from '@workos-inc/node';

const t = initTRPC.context<Context>().create({
	transformer: superjson
});
export const adminProcedure = t.procedure
	.input(z.object({ orgId: z.string() }))
	.use(async ({ ctx, next, input }) => {
		const token = ctx.event.cookies.get('token');
		console.log('Token', token);
		const verifiedToken = token && (await verifyJwtToken(token));
		console.log('Verified', verifiedToken);

		// @ts-expect-error: Already valid
		const user = verifiedToken as User & {
			orgs: {
				id: string;
				name: string;
				memberId: string;
			}[];
		};

		if (!user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'Make this request logged in'
			});
		}

		console.log('BUOCWNCIONWONEWIOEWFC');

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
