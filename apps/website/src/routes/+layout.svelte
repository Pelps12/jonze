<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/stores';

	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	import posthog from 'posthog-js';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import type { LayoutData } from './$types';
	import { MetaTags } from 'svelte-meta-tags';
	import { PUBLIC_URL } from '$env/static/public';
	export let data: LayoutData;
	if (browser) {
		beforeNavigate(() => posthog.capture('$pageleave'));
		afterNavigate(() => posthog.capture('$pageview'));
		if ($page.url.searchParams.get('signedIn') === 'true' && data.user) {
			posthog.identify(data.user.id, {
				email: data.user.email,
				name: data.user.firstName + ' ' + data.user.lastName
			});
		} else if (!data.user) {
			posthog.reset();
		}
	}
</script>

<ModeWatcher />
<Toaster />

<svelte:head>
	<title>Jonze</title>
	<MetaTags
		title="Jonze"
		description="Member management for campus orgs."
		openGraph={{
			url: PUBLIC_URL,
			title: 'Jonze',
			description: 'Member management for campus orgs.',
			images: [
				{
					url: 'https://ucarecdn.com/b49dfb27-3d2b-4b3f-a556-e0022c76d2fb/',
					width: 1000,
					height: 525,
					alt: 'Jonze Alt'
				}
			],
			siteName: 'Jonze'
		}}
		twitter={{
			handle: '@Pelps12',
			site: '@Pelps12',
			cardType: 'summary_large_image',
			title: 'Jonze',
			description: 'Member management for campus orgs.',
			image: 'https://ucarecdn.com/b49dfb27-3d2b-4b3f-a556-e0022c76d2fb/',
			imageAlt: 'Twitter image alt'
		}}
	/>
</svelte:head>

<slot />
