import type { ArrayElement } from '$lib/types/misc';
import { z } from 'zod';
export const intervals = {
	'1 year': '1 year',
	'6 months': '6 months'
} as const;

type Interval = keyof typeof intervals;

export const planCreationSchema = z.object({
	start: z.date(),
	amount: z.number(),
	interval: z.enum(Object.keys(intervals) as [Interval, ...Interval[]]),
	name: z.string(),
	formId: z.string().nullable()
});

export type PlanCreationSchema = typeof planCreationSchema;
