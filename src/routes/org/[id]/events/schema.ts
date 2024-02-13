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
	image: z
		.custom<FileList>()
		.refine((files) => {
			return Array.from(files ?? []).length !== 0;
		}, 'Image is required')
		.refine((files) => {
			return Array.from(files ?? []).every((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE);
		}, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
		.refine((files) => {
			return Array.from(files ?? []).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
		}, 'File type is not supported'),
	description: z.string(),
	orgId: z.string(),
	name: z.string()
});

export type EventCreationSchema = typeof eventCreationSchema;
