import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY, PUBLIC_URL } from '$env/static/public';
export const load = async ({ parent, data }) => {
	if (browser) {
		posthog.init(PUBLIC_POSTHOG_KEY, {
			api_host: PUBLIC_POSTHOG_HOST,
			person_profiles: 'identified_only',
			capture_pageview: false,
			capture_pageleave: false,
			opt_out_capturing_by_default: true
		});
		posthog.opt_out_capturing();
		if (!(PUBLIC_URL.includes('localhost') || PUBLIC_URL.includes('dev'))) {
			console.log('IGNORED');
			posthog.opt_in_capturing();
		}
	}
	return { user: data.user };
};
