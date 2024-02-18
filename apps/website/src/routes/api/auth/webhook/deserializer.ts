import type { EventResponse, Event, EventBase, UserResponse, User } from '@workos-inc/node';
import type {
	OrganizationMembershipResponse,
	OrganizationMembership
} from '@workos-inc/node/lib/user-management/interfaces/organization-membership.interface';

export const deserializeEvent = (event: EventResponse): Event => {
	const eventBase: EventBase = {
		id: event.id,
		createdAt: event.created_at
	};

	switch (event.event) {
		case 'user.created':
		case 'user.updated':
		case 'user.deleted':
			return {
				...eventBase,
				event: event.event,
				data: deserializeUser(event.data)
			};
		case 'organization_membership.added':
		case 'organization_membership.removed':
			return {
				...eventBase,
				event: event.event,
				data: deserializeOrganizationMembership(event.data)
			};
		default:
			throw Error('Event Type not Interally Supported');
	}
};

export const deserializeUser = (user: UserResponse): User => ({
	object: user.object,
	id: user.id,
	email: user.email,
	emailVerified: user.email_verified,
	firstName: user.first_name,
	profilePictureUrl: user.profile_picture_url,
	lastName: user.last_name,
	createdAt: user.created_at,
	updatedAt: user.updated_at
});

export const deserializeOrganizationMembership = (
	organizationMembership: OrganizationMembershipResponse
): OrganizationMembership => ({
	object: organizationMembership.object,
	id: organizationMembership.id,
	userId: organizationMembership.user_id,
	organizationId: organizationMembership.organization_id,
	createdAt: organizationMembership.created_at,
	updatedAt: organizationMembership.updated_at
});
