import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function formatName(firstName: string | null, lastName: string | null): string {
	// Check if both firstName and lastName are undefined
	if (firstName === null && lastName === null) {
		return 'No Name';
	} else {
		// Return the one that is defined, or an empty string if one is undefined
		return `${firstName ?? ''} ${lastName ?? ''}`.trim();
	}
}

export function getInitials(fullName: string): string {
	// Trim the fullName to remove any extra spaces before and after the name
	fullName = fullName.trim();

	// Check if the fullName is "No Name" or empty
	if (fullName === '' || fullName.toLowerCase() === 'no name') {
		return '?'; // Return an empty string or adjust as needed
	}

	// Split the name by spaces
	const names = fullName.split(/\s+/);

	// Get the first letter of each part of the name
	const initials = names.map((name) => name[0].toUpperCase()).join('');

	return initials;
}

export const getApplicationFee = (
	amount: number,
	transaction_type: 'standard' | 'plus' = 'standard'
): number => {
	return Math.ceil(0.07 * amount + 80) - Math.ceil(0.029 * amount + 30);
};
