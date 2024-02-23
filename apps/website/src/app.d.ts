// See https://kit.svelte.dev/docs/types#app

import type { Member } from '@repo/db/types';
import type { Organization, User } from '@workos-inc/node';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User & { orgs: Pick<Organization, 'id' | 'name'>[] }; // Your type here
			member?: Member;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			context: {
				waitUntil(promise: Promise<any>): void;
			};
		}
	}


}

export {};
