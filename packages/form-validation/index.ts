import { z } from 'zod';
import parsePhoneNumber from 'libphonenumber-js';

// Base validator type
const ZodBaseValidator = z.object({
	required: z.boolean().optional().default(true),
	customValidation: z.function().args(z.any()).returns(z.boolean()).optional()
});

// Text field validator
const ZodTextValidator = ZodBaseValidator.extend({
	minLength: z.number().optional(),
	maxLength: z.number().optional(),
	pattern: z.string().optional(),
	format: z.enum(['none', 'email', 'url', 'phone']).optional()
});

// Textarea field validator
const ZodTextAreaValidator = ZodBaseValidator.extend({
	minLength: z.number().optional(),
	maxLength: z.number().optional()
});

// Radio field validator
const ZodRadioValidator = ZodBaseValidator;

// Dropdown field validator
const ZodDropdownValidator = ZodBaseValidator;

// Union of all validators
const ZodFieldValidator = z.union([
	ZodTextValidator,
	ZodTextAreaValidator,
	ZodRadioValidator,
	ZodDropdownValidator
]);

const ZodCustomFieldBase = z.object({
	label: z.string(),
	id: z.number(),
	placeholder: z.string().optional(),
	hidden: z.boolean().optional()
});

// Schema for text and textarea fields (without options)
const ZodTextField = ZodCustomFieldBase.extend({
	type: z.literal('text'),
	validator: ZodTextValidator.optional()
});

const ZodTextAreaField = ZodCustomFieldBase.extend({
	type: z.literal('textarea'),
	validator: ZodTextAreaValidator.optional()
});

// Schema for radio and dropdown fields (with options)
const ZodRadioField = ZodCustomFieldBase.extend({
	type: z.literal('radio'),
	options: z.array(z.object({ label: z.string() })),
	validator: ZodRadioValidator.optional()
});

const ZodDropdownField = ZodCustomFieldBase.extend({
	type: z.literal('dropdown'),
	options: z.array(z.object({ label: z.string() })),
	validator: ZodDropdownValidator.optional()
});

// Discriminated union of all field types
export const ZodCustomField = z.union([
	ZodTextField,
	ZodTextAreaField,
	ZodRadioField,
	ZodDropdownField
]);

export type CustomTextField = z.infer<typeof ZodTextField>;
export type CustomTextAreaField = z.infer<typeof ZodTextAreaField>;
export type CustomRadioGroupField = z.infer<typeof ZodRadioField>;
export type CustomDropDownField = z.infer<typeof ZodDropdownField>;

export type CustomField = z.infer<typeof ZodCustomField>;

export const ZodCustomForm = z.array(ZodCustomField);
export type CustomForm = z.infer<typeof ZodCustomForm>;
export type FieldValidator = z.infer<typeof ZodFieldValidator>;
export type TextValidator = z.infer<typeof ZodTextValidator>;

type RequiredFieldSchema =
	| z.ZodString
	| z.ZodDefault<z.ZodEnum<[string, ...string[]]>>
	| z.ZodArray<z.ZodEnum<[string, ...string[]]>>
	| z.ZodDefault<z.ZodDefault<z.ZodString>>
	| z.ZodEffects<z.ZodString, any, string>;

type OptionalFieldSchema =
	| z.ZodOptional<z.ZodString>
	| z.ZodOptional<z.ZodEnum<[string, ...string[]]>>
	| z.ZodOptional<z.ZodArray<z.ZodEnum<[string, ...string[]]>>>;

type FieldSchema = RequiredFieldSchema | OptionalFieldSchema;

// Type guard functions
function isTextValidator(validator: FieldValidator): validator is TextValidator {
	return 'format' in validator;
}

function isOptionsValidator(
	validator: FieldValidator
): validator is z.infer<typeof ZodRadioValidator> | z.infer<typeof ZodDropdownValidator> {
	return 'options' in validator;
}

function isZodStringSchema(schema: FieldSchema): schema is z.ZodString {
	return schema instanceof z.ZodString;
}

function isZodEnumSchema(
	schema: FieldSchema
): schema is z.ZodDefault<z.ZodEnum<[string, ...string[]]>> {
	return schema instanceof z.ZodEnum;
}

function isZodArraySchema(
	schema: FieldSchema
): schema is z.ZodArray<z.ZodEnum<[string, ...string[]]>> {
	return schema instanceof z.ZodArray;
}
function canRefine(schema: FieldSchema): schema is RequiredFieldSchema {
	return (
		schema instanceof z.ZodString || schema instanceof z.ZodEnum || schema instanceof z.ZodArray
	);
}

export function applyRefinement<T extends FieldSchema>(
	schema: T,
	refinement: (value: z.infer<T>) => boolean,
	message: string
): T {
	if (canRefine(schema)) {
		//@ts-ignore
		return schema.refine(
			(value: any) => {
				if (value === undefined) return true;
				return refinement(value);
			},
			{ message }
		) as T;
	}

	// If schema is not refineable, return as is
	return schema;
}

export function createDynamicSchema(fields: CustomForm) {
	const schemaObj: Record<string, z.ZodTypeAny> = {};

	fields.forEach((field) => {
		const id = field.id.toString();
		let fieldSchema: FieldSchema;

		switch (field.type) {
			case 'text':
			case 'textarea':
				fieldSchema = z.string();
				if (field.validator) {
					if ('minLength' in field.validator && field.validator.minLength) {
						fieldSchema = fieldSchema.min(
							field.validator.minLength,
							`Field must be at least ${field.validator.minLength} character(s)`
						);
					}
					if ('maxLength' in field.validator && field.validator.maxLength) {
						fieldSchema = fieldSchema.max(
							field.validator.maxLength,
							`Field must be at most ${field.validator.maxLength} character(s)`
						);
					}
					if (isTextValidator(field.validator)) {
						if (field.validator.pattern) {
							fieldSchema = fieldSchema.regex(new RegExp(field.validator.pattern));
						}
						if (field.validator.format) {
							switch (field.validator.format) {
								case 'email':
									fieldSchema = fieldSchema.email();
									break;
								case 'url':
									fieldSchema = fieldSchema.url();
									break;
								case 'phone':
									fieldSchema = fieldSchema.transform((value, ctx) => {
										const phoneNumber = parsePhoneNumber(value, {
											defaultCountry: 'US'
										});

										if (!phoneNumber?.isValid()) {
											ctx.addIssue({
												code: z.ZodIssueCode.custom,
												message: 'Invalid phone number'
											});
											return z.NEVER;
										}

										return phoneNumber.formatNational();
									});
									break;
							}
						}
					}
				}
				break;
			case 'radio':
			case 'dropdown':
				if (field.options && field.options.length > 0) {
					const optionLabels = field.options.map((option) => option.label);

					//TODO: Fix bug. Currently
					if (field.type === 'radio') {
						fieldSchema = z.enum(optionLabels as [string, ...string[]]).default(optionLabels[0]);
					} else {
						fieldSchema = z.string().default('Item 1').default(optionLabels[0]);
					}
				} else {
					fieldSchema = z.string();
				}
				break;
		}

		if (field.validator?.required) {
		} else {
			fieldSchema = fieldSchema.optional() as FieldSchema;
		}

		if (field.validator?.customValidation) {
			fieldSchema = applyRefinement(
				fieldSchema,
				field.validator.customValidation,
				`Custom validation failed for ${field.label}`
			);
		}

		schemaObj[id] = fieldSchema;
	});

	return z.object(schemaObj);
}
