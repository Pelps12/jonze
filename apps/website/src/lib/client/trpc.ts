import type { AppRouter } from '$lib/server/trpc/routes';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';
import { svelteQueryWrapper } from 'trpc-svelte-query-adapter';
import type { QueryClient } from '@tanstack/svelte-query';
import { PUBLIC_URL } from '$env/static/public';

const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${PUBLIC_URL}/api/trpc`
		})
	],
	transformer: SuperJSON
});

export const trpc = (queryClient?: QueryClient) =>
	svelteQueryWrapper<AppRouter>({
		client,
		queryClient
	});
