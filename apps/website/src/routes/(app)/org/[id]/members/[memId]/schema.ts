import { providerEnum } from '@repo/db/schema/membership';
import { z } from 'zod';

export const membershipCreationSchema = z.object({
	planId: z.string(),
	provider: z.enum(providerEnum.enumValues).default('None'),
	createdAt: z.date().optional()
});

export const memberUpdationSchema = z.object({
	tags: z.array(z.string()).default([])
});

export type MemberUpdationSchema = typeof memberUpdationSchema;

export type MembershipCreationSchema = typeof membershipCreationSchema;
