import { z } from 'zod';

export const ZodCustomTextField = z.object({
	label: z.string(),
	type: z.literal('text'),
	placeholder: z.string()
});

export type CustomTextField = z.infer<typeof ZodCustomTextField>;

export const ZodCustomTextAreaField = z.object({
	label: z.string(),
	type: z.literal('textarea'),
	placeholder: z.string()
});

export type CustomTextAreaField = z.infer<typeof ZodCustomTextAreaField>;

export const ZodCustomRadioGroupField = z.object({
	label: z.string(),
	type: z.literal('radio'),
	options: z.array(
		z.object({
			label: z.string()
		})
	)
});

export type CustomRadioGroupField = z.infer<typeof ZodCustomRadioGroupField>;

export const ZodCustomDropDownField = z.object({
	label: z.string(),
	type: z.literal('dropdown'),
	options: z.array(
		z.object({
			label: z.string()
		})
	)
});

export type CustomDropDownField = z.infer<typeof ZodCustomDropDownField>;

export const ZodCustomField = z.union([
	ZodCustomDropDownField,
	ZodCustomRadioGroupField,
	ZodCustomTextAreaField,
	ZodCustomTextField
]);

export type CustomField = z.infer<typeof ZodCustomField>;

export type CustomResponseField = {
	label: string;
	response: string | string[];
	type: CustomField['type'];
};

export type CustomFormData = {
	json: CustomField;
};

export type CustomFormContext = {
	data: CustomFormData[];
	add: (value: CustomFormData) => void;
	setData: (value: CustomFormData[]) => void;
	edit: (id: number, value: Partial<CustomField>) => void;
	deleteElement: (id: number) => void;
};
