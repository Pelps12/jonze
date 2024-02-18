import { customAlphabet } from 'nanoid';
export const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

const prefixes = {
	form: 'form',
	response: 'resp',
	event: 'evt',
	attendance: 'atnd'
} as const;

export function newId(prefix: keyof typeof prefixes): string {
	return [prefixes[prefix], nanoid(16)].join('_');
}
