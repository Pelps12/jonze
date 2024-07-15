// See https://kit.svelte.dev/docs/types#app

import type { SessionType } from '$lib/types/misc';
import type { Member } from '@repo/db/types';
import type { Organization, User } from '@workos-inc/node';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: Omit<SessionType, 'accessToken' | 'refreshToken'>;
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
