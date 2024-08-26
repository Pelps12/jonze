import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { createDynamicSchema, type CustomForm } from '@repo/form-validation';
import { error, fail, type Actions } from '@sveltejs/kit';
import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { eq } from '@repo/db';
const customFields: CustomForm = [
	{
		label: 'Phone Number',
		id: 1,
		type: 'text',
		placeholder: 'Enter your phone number',
		validator: {
			required: true,
			format: 'phone'
		}
	},
	{
		label: 'Email',
		id: 2,
		type: 'text',
		placeholder: 'Enter your email',
		validator: {
			required: true,
			format: 'email'
		}
	},
	{
		label: 'Bio',
		id: 3,
		type: 'textarea',
		placeholder: 'Tell us about yourself',
		validator: {
			required: true,
			maxLength: 500
		}
	},
	{
		label: 'Gender',
		id: 4,
		type: 'dropdown',
		options: [{ label: 'Male' }, { label: 'Female' }, { label: 'Other' }]
	},

	{
		label: 'Countries visited',
		id: 5,
		type: 'dropdown',
		options: [{ label: 'USA' }, { label: 'Canada' }, { label: 'Australia' }, { label: 'Other' }]
	},

	{
		label: 'Age',
		id: 6,
		type: 'text',
		placeholder: 'Enter your age',
		validator: {
			required: true
		}
	}
];

export const load: PageServerLoad = async () => {
	const orgForm = await db.query.organizationForm.findFirst({
		where: eq(schema.organizationForm.id, 'form_M4nwfCDanpsKjWwc')
	});

	if (!orgForm) error(400);

	const modifiedForm: CustomForm = orgForm.form.map((element) => {
		if (element.type === 'textarea' || element.type === 'text') {
			return {
				...element,
				validator: {
					required: true,
					minLength: 2
				}
			};
		}

		return { ...element };
	});
	const dynamicSchema = createDynamicSchema(customFields);
	return {
		modifiedForm,
		form: await superValidate(zod(dynamicSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const orgForm = await db.query.organizationForm.findFirst({
			where: eq(schema.organizationForm.id, 'form_M4nwfCDanpsKjWwc')
		});

		if (!orgForm) error(400);
		const dynamicSchema = createDynamicSchema(customFields);
		const form = await superValidate({ request }, zod(dynamicSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const formResponse = orgForm.form.map((field) => ({
			id: field.id,
			label: field.label,
			response: form.data[field.id]
		}));

		console.log(formResponse);

		console.log(form.data);
		return {
			form
		};
	}
};
