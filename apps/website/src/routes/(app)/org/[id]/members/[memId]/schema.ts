import { providerEnum } from '@repo/db/schema/membership';
import { z } from 'zod';

export const membershipCreationSchema = z.object({
	planId: z.string(),
	provider: z.enum(providerEnum.enumValues).default('None'),
	createdAt: z.date().optional()
});

export type MembershipCreationSchema = typeof membershipCreationSchema;
