import { browser } from '$app/environment';
import { QueryCache, QueryClient } from '@tanstack/svelte-query';
import type { LayoutLoad } from './$types';
import { toast } from 'svelte-sonner';

export const load: LayoutLoad = async () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 60 * 1000
			}
		},
		queryCache: new QueryCache({
			onError: (error) => {
				if (browser) {
					if (error.message) {
						toast.error(`${error.message}`);
					}
				}
			}
		})
	});

	return { queryClient };
};
