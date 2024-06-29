import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { router } from '..';
import { memberRouter } from './members';
import { planRouter } from './plans';
import { eventRouter } from './events';
import { homePageRouter } from './homepage';
import { settingsRouter } from './settings';
import { formRouter } from './forms';

export const appRouter = router({
	memberRouter,
	planRouter,
	eventRouter,
	homePageRouter,
	settingsRouter,
	formRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
