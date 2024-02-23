import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY, PUBLIC_URL } from '$env/static/public';
export const load = async ({ parent, data }) => {
	if (browser) {
		posthog.init(PUBLIC_POSTHOG_KEY, {
			api_host: PUBLIC_POSTHOG_HOST,
			capture_pageview: false,
			capture_pageleave: false
		});
		if (PUBLIC_URL.includes('localhost') || PUBLIC_URL.includes('dev')) {
			console.log('IGNORED');
			//@ts-ignore
			posthog.opt_out_capturing();
		}
	}
	return { user: data.user };
};
