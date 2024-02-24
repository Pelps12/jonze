import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY, PUBLIC_URL } from '$env/static/public';
import { PostHog } from 'posthog-node';

const client = new PostHog(PUBLIC_POSTHOG_KEY, {
	flushAt: 1,
	flushInterval: 0,
	disableGeoip: false,
	fetch: fetch,
	enable: !PUBLIC_URL.includes('localhost') && !PUBLIC_URL.includes('dev')
});

client.debug(true);

export default client;
