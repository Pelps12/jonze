import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY, PUBLIC_URL } from '$env/static/public';
import { PostHog } from 'posthog-node';

const client = new PostHog(PUBLIC_POSTHOG_KEY, {
	host: PUBLIC_POSTHOG_HOST,
	flushAt: 1,
	flushInterval: 0,
	disableGeoip: false
});

client.debug(true);
if (PUBLIC_URL.includes('localhost') || PUBLIC_URL.includes('dev')) {
	console.log('IGNORED');
	client.optOut();
}

export default client;
