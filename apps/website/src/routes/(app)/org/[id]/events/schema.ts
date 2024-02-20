import { z } from 'zod';
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const MAX_IMAGE_SIZE = 4; //In MegaBytes

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
	const result = sizeInBytes / (1024 * 1024);
	return +result.toFixed(decimalsNum);
};

export const eventCreationSchema = z.object({
	start: z.string(),
	end: z.string(),
	image: z.string().nullable(),
	description: z.string().nullable(),
	name: z.string(),
	timezone: z.string()
});

export const eventUpdationSchema = z.object({
	id: z.string(),
	start: z.string(),
	end: z.string(),
	image: z.string().nullable(),
	description: z.string().nullable(),
	name: z.string()
});

export type EventCreationSchema = typeof eventCreationSchema;
export type EventUpdationSchema = typeof eventUpdationSchema;
