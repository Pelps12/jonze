import type { AppRouter } from '$lib/server/trpc/routes';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';
import { svelteQueryWrapper } from 'trpc-svelte-query-adapter';
import type { QueryClient } from '@tanstack/svelte-query';

const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: 'http://localhost:5173/api/trpc'
		})
	],
	transformer: SuperJSON
});

export const trpc = (queryClient?: QueryClient) =>
	svelteQueryWrapper<AppRouter>({
		client,
		queryClient
	});
