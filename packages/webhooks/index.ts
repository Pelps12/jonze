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

	constructor(token: string) {
		this.token = token;
	}

	create(appId: string, messageIn: MessageCreateParams): Promise<Response> {
		return fetch(`https://api.svix.com/api/v1/app/${appId}/msg/`, {
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

	constructor(token: string) {
		this.token = token;
	}

	async appPortalAccess(appId: string, addtional: {}): Promise<any> {
		const response = await fetch(`https://api.svix.com/api/v1/auth/app-portal-access/${appId}/`, {
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

	constructor(token: string) {
		this.token = token;
	}

	create(input: { name: string; uid: string }): Promise<Response> {
		const eu = this.token.includes('.eu');

		return fetch(`https://api${eu ? '' : '.us'}.svix.com/api/v1/app/`, {
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

	constructor(token: string) {
		this.message = new Message(token);
		this.authentication = new Authentication(token);
		this.application = new Application(token);
	}
}
