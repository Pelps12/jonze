import { z } from 'zod';
export const formSchema = z.object({
	firstName: z.string().min(2).max(50),
	lastName: z.string().min(2).max(50)
});

export type FormSchema = typeof formSchema;
