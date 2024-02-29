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

class DummyPostHog {
	apiKey: string;
	host: string;
	store: Promise<Response>[];
	enabled: boolean;
	constructor({
		apiKey,
		host,
		enabled = true
	}: {
		apiKey: string;
		host: string;
		enabled?: boolean;
	}) {
		this.apiKey = apiKey;
		this.host = host;
		this.store = [];
		this.enabled = enabled;
	}
	capture(body: {
		distinctId: string;
		event: string;
		properties: Record<string, string | Record<string, string>>;
	}) {
		if (this.enabled) {
			const { distinctId, ...otherFields } = body;
			this.store.push(
				fetch(`${this.host}/capture/`, {
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						distinct_id: distinctId,
						...otherFields,
						api_key: this.apiKey,
						timestamp: new Date().toISOString(),
						$lib: 'posthog-node'
					}),
					method: 'POST'
				})
			);
		}
	}

	async flushAsync() {
		const result = await Promise.allSettled(this.store);

		result.map((val) => {
			if (val.status === 'rejected') {
				console.log(val.reason);
			} else {
				console.log(val.value.text(), 'RESULT OF POSTHOG THING');
			}
		});
	}
}

export const dummyClient = new DummyPostHog({
	apiKey: PUBLIC_POSTHOG_KEY,
	host: PUBLIC_POSTHOG_HOST,
	enabled: !PUBLIC_URL.includes('localhost') && !PUBLIC_URL.includes('dev')
});

export default client;
