import type { Context } from '$lib/server/trpc/context';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError, z } from 'zod';

const t = initTRPC.context<Context>().create({
	transformer: superjson
});
export const adminProcedure = t.procedure
	.input(z.object({ orgId: z.string() }))
	.use(({ ctx, next }) => {
		return next({
			ctx
		});
	});
export const { procedure, router, middleware, createCallerFactory } = t;
