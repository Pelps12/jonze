import { z } from 'zod';

export const colors = {
	blu: 'Blue',
	red: 'Red',
	grn: 'Green',
	ylw: 'Yellow',
	blk: 'Black'
} as const;

type Color = keyof typeof colors;

export const schema = z.object({
	colors: z
		.array(z.enum(Object.keys(colors) as [Color, ...Color[]]))
		.min(1, 'Please select at least one color.')
});
