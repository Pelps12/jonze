import { z } from 'zod';
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const MAX_IMAGE_SIZE = 4; //In MegaBytes

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
	const result = sizeInBytes / (1024 * 1024);
	return +result.toFixed(decimalsNum);
};

export const eventCreationSchema = z.object({
	start: z.date().min(new Date()),
	end: z.date().min(new Date()),
	image: z.string().nullable(),
	description: z.string().nullable(),
	name: z.string(),
	formId: z.string().nullable(),
	tags: z.array(z.string()).default([])
});

export const eventUpdationSchema = z.object({
	id: z.string(),
	start: z.date(),
	end: z.date(),
	image: z.string().nullable(),
	description: z.string().nullable(),
	name: z.string(),
	formId: z.string().nullable(),
	tags: z.array(z.string()).default([])
});

export type EventCreationSchema = typeof eventCreationSchema;
export type EventUpdationSchema = typeof eventUpdationSchema;
