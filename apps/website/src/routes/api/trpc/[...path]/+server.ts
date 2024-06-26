import { createContext } from '$lib/server/trpc/context';
import { appRouter } from '$lib/server/trpc/routes';
import type { RequestHandler } from '@sveltejs/kit';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const requestHandler: RequestHandler = (event) =>
	fetchRequestHandler({
		req: event.request,
		router: appRouter,
		endpoint: '/api/trpc',
		createContext: () => createContext(event)
	});

export const GET = requestHandler;
export const POST = requestHandler;
