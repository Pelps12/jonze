import type {
	CustomDropDownField,
	CustomField,
	CustomForm,
	CustomRadioGroupField,
	CustomTextAreaField,
	CustomTextField
} from '@repo/form-validation';
import { writable } from 'svelte/store';

export const form = writable<CustomForm>([]);
export const form_name = writable<string | undefined>();

export const add = (value: CustomField) => {
	form.update((f) => [...f, value]);
};

export const edit = (id: number, value: CustomField) => {
	const copiedValue = structuredClone(value);
	form.update((data) => {
		return data.map((el, index) => {
			if (id === index) {
				if (el.type === 'text') {
					// Here 'value' is inferred as Partial<CustomTextField>
					return { ...el, ...copiedValue } as CustomTextField;
				} else if (el.type === 'textarea') {
					// Here 'value' is inferred as Partial<CustomTextAreaField>
					return { ...el, ...copiedValue } as CustomTextAreaField;
				} else if (el.type === 'radio') {
					// Here 'value' is inferred as Partial<CustomRadioGroupField>
					return { ...el, ...copiedValue } as CustomRadioGroupField;
				} else if (el.type === 'dropdown') {
					// Here 'value' is inferred as Partial<CustomRadioGroupField>
					return { ...el, ...copiedValue } as CustomDropDownField;
				}
			}

			return el;
		});
	});
};

export const deleteElement = (id: number) => {
	form.update((data) => {
		return data.filter((_, index) => index !== id);
	});
};

form.subscribe((value) => {
	console.log(value);
}); // logs '0'
