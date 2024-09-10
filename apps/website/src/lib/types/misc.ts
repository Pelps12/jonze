import type { User } from '@workos-inc/node';

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type SessionType = User & {
	orgs: {
		id: string;
		name: string;
		memberId: string;
		plan: 'standard' | 'plus';
	}[];
	accessToken: string;
	refreshToken: string;
};
