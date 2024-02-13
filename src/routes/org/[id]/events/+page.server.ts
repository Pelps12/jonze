import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { eventCreationSchema } from './schema';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const events = [
		{
			id: 'be6fab0e-44ee-4d9b-893b-56edb84fce9c',
			createdAt: '2024-02-08T23:25:07.871Z',
			date: null,
			numAttendants: null,
			description: 'Valentine Meeting',
			image: 'https://ucarecdn.com/\nb6b86e5c-bef8-4383-aef9-737fe93a089b/',
			type: 'meeting',
			gif: null,
			link: null,
			name: '2nd General Body Meeting',
			grayBy: '2024-02-09T05:59:59.000Z',
			importance: 1,
			buttonText: null
		},
		{
			id: '2e1ac13e-a94b-4c11-a38b-e657f07e6c29',
			createdAt: '2024-01-25T22:50:59.086Z',
			date: '2024-01-26T01:00:00.000Z',
			numAttendants: null,
			description: 'Welcome Back',
			image: 'https://ucarecdn.com/\n2d3a0c12-b4df-4e97-943e-201ed8d459dd/',
			type: 'meeting',
			gif: null,
			link: null,
			name: 'First General Body Meeting',
			grayBy: '2024-01-26T05:59:59.000Z',
			importance: 1,
			buttonText: null
		},
		{
			id: '2b5cc630-8777-42d6-af74-7066d1000fbb',
			createdAt: '2023-10-26T22:52:25.072Z',
			date: '2023-10-27T00:00:00.000Z',
			numAttendants: null,
			description: 'Halloween Scavenger Hunt',
			image:
				'https://ucarecdn.com/\n8f864e2e-da79-41cc-a90b-3c5d4cbd3fb3/\n-/preview/500x500/\n-/quality/smart_retina/\n-/format/auto/',
			type: 'meeting',
			gif: null,
			link: null,
			name: 'Fifth General Body Meeting',
			grayBy: '2023-10-27T04:59:59.000Z',
			importance: 1,
			buttonText: null
		},
		{
			id: 'b65da6af-a90d-40e3-9862-e43169827d02',
			createdAt: '2023-02-10T01:36:56.901Z',
			date: '2023-02-10T01:00:00.000Z',
			numAttendants: null,
			description: 'Join IMs',
			image: 'https://ucarecdn.com/8753b79a-ac7d-4b87-929f-c2addeb97086/',
			type: 'special',
			gif: '',
			link: 'https://docs.google.com/forms/d/e/1FAIpQLSeZUWZ0yPFNiMxa_Y7WEHJJYLvQWzajQeC5UtoQcVr2QXQf_g/viewform?edit_requested=true',
			name: 'IM Registration',
			grayBy: '2023-02-19T05:59:59.000Z',
			importance: 2,
			buttonText: 'REGISTER'
		}
	];
	return { events, form: await superValidate(eventCreationSchema) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, eventCreationSchema);
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		return {
			form
		};
	}
};
