// Define interfaces for type safety
interface EventData {
	type: string;
	data: any;
}

interface MessageCreateParams {
	eventType: string;
	eventId?: string;
	payload: EventData;
}

interface MessageOut {
	success: boolean;
	messageId?: string;
	error?: string;
}

class Message {
	private token: string;
	private serverUrl: string;

	constructor(token: string, serverUrl: string) {
		this.token = token;
		this.serverUrl = serverUrl;
	}

	create(appId: string, messageIn: MessageCreateParams): Promise<Response> {
		return fetch(`${this.serverUrl}/api/v1/app/${appId}/msg/`, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`
			},
			body: JSON.stringify(messageIn),
			method: 'POST'
		});
	}
}

class Authentication {
	private token: string;
	private serverUrl: string;

	constructor(token: string, serverUrl: string) {
		this.token = token;
		this.serverUrl = serverUrl;
	}

	async appPortalAccess(appId: string, addtional: {}): Promise<any> {
		const response = await fetch(`${this.serverUrl}/api/v1/auth/app-portal-access/${appId}/`, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`
			},
			body: JSON.stringify(addtional),
			method: 'POST'
		});

		return response.json();
	}
}

class Application {
	private token: string;
	private serverUrl: string;

	constructor(token: string, serverUrl: string) {
		this.token = token;
		this.serverUrl = serverUrl;
	}

	create(input: { name: string; uid: string }): Promise<Response> {
		return fetch(`${this.serverUrl}/api/v1/app/`, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.token}`
			},
			body: JSON.stringify(input),
			method: 'POST'
		});
	}
}

export class WrapperSvix {
	public message: Message;
	public authentication: Authentication;
	public application: Application;
	private serverUrl: string;

	constructor(token: string) {
		this.serverUrl = `https://api${token.includes('.eu') ? '' : '.us'}.svix.com`;

		this.message = new Message(token, this.serverUrl);
		this.authentication = new Authentication(token, this.serverUrl);
		this.application = new Application(token, this.serverUrl);
	}
}
