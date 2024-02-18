// See https://kit.svelte.dev/docs/types#app

import type { Organization, User } from '@workos-inc/node';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User & { orgs: Pick<Organization, 'id' | 'name'>[] }; // Your type here
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
