import type { CustomField, CustomForm } from '$lib/types/forms';
import { writable } from 'svelte/store';

export const form = writable<CustomForm>({});
export const form_name = writable<string>();

export const add = (value: CustomField) => {
	form.update((f) => ({ ...f, [value.label]: value }));
};

export const edit = (key: string, value: CustomField) => {
	const copiedValue = structuredClone(value);
	form.update((f) => {
		const el = f[key];
		console.log(el, copiedValue);
		if (el) {
			if (el.type === 'text') {
				// Here 'value' is inferred as Partial<CustomTextField>
				if (copiedValue.label && copiedValue.label !== el.label) {
					delete f[key];
					return { [copiedValue.label]: { ...copiedValue }, ...f };
				}
				return { [key]: { ...el, copiedValue }, ...f };
			} else if (el.type === 'textarea') {
				if (copiedValue.label && copiedValue.label !== el.label) {
					delete f[key];
					return { [copiedValue.label]: { ...copiedValue }, ...f };
				}
				return { [key]: { ...el, copiedValue }, ...f };
			} else if (el.type === 'radio') {
				// Here 'value' is inferred as Partial<CustomRadioGroupField>
				return { ...f, [key]: { ...el, copiedValue } };
			} else if (el.type === 'dropdown') {
				// Here 'value' is inferred as Partial<CustomRadioGroupField>
				if (copiedValue.label && copiedValue.label !== el.label) {
					delete f[key];
					return { [copiedValue.label]: { ...copiedValue }, ...f };
				}
				return { ...f, [key]: { ...copiedValue } };
			}
		}

		return f;
	});
};

export const deleteElement = (key: string) => {
	form.update((f) => {
		const newF = Object.keys(f)
			.filter((undesired_key) => undesired_key !== key) // Keep keys not in keysToRemove
			.reduce((acc: Record<string, CustomField>, key) => {
				acc[key] = f[key]; // Add each remaining key-value pair to the accumulator
				return acc;
			}, {});
		console.log(newF);
		return newF;
	});
};

form.subscribe((value) => {
	console.log(value);
}); // logs '0'
