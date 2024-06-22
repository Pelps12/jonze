<script>
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { Calendar } from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import listPlugin from '@fullcalendar/list';
	import { browser } from '$app/environment';
	import { PUBLIC_URL } from '$env/static/public';
	import { page } from '$app/stores';
	export let data;

	const calendarEvents = [
		{ title: 'Team Meeting', start: '2024-06-15T09:00:00', end: '2024-06-15T10:00:00' },
		{ title: 'Lunch with Sarah', start: '2024-06-16T12:00:00', end: '2024-06-16T13:00:00' },
		{ title: 'Conference', start: '2024-06-20', end: '2024-06-23' },
		{ title: 'Webinar', start: '2024-06-18T15:00:00', end: '2024-06-18T17:00:00' },
		{ title: 'Doctor Appointment', start: '2024-06-19T11:00:00', end: '2024-06-19T12:00:00' },
		{ title: 'Workshop', start: '2024-06-21' },
		{ title: 'Birthday Party', start: '2024-06-24T19:00:00', end: '2024-06-24T23:00:00' },
		{ title: 'Yoga Class', start: '2024-06-25T07:00:00', end: '2024-06-25T08:00:00' },
		{ title: 'Software Release', start: '2024-06-27T00:00:00' }, // All-day event
		{ title: 'Annual General Meeting', start: '2024-06-29T10:00:00', end: '2024-06-29T12:00:00' },
		{ title: 'Project Kickoff', start: '2024-07-01T09:00:00', end: '2024-07-01T10:30:00' },
		{ title: 'Dentist Appointment', start: '2024-07-03T15:00:00', end: '2024-07-03T16:00:00' },
		{ title: 'Independence Day Party', start: '2024-07-04' }, // All-day event
		{ title: 'Team Lunch', start: '2024-07-08T12:00:00', end: '2024-07-08T13:00:00' },
		{ title: 'Client Review Meeting', start: '2024-07-10T11:00:00', end: '2024-07-10T12:30:00' },
		{ title: 'Software Training', start: '2024-07-15T09:00:00', end: '2024-07-15T17:00:00' },
		{ title: 'Book Club', start: '2024-07-17T19:00:00', end: '2024-07-17T20:30:00' },
		{ title: 'Family BBQ', start: '2024-07-20' }, // All-day event
		{ title: 'Quarterly Review', start: '2024-07-22T10:00:00', end: '2024-07-22T12:00:00' },
		{ title: 'Yoga Class', start: '2024-07-25T18:00:00', end: '2024-07-25T19:00:00' },
		{ title: 'Marketing Presentation', start: '2024-07-28T14:00:00', end: '2024-07-28T15:30:00' },
		{ title: 'Tech Meetup', start: '2024-07-30T18:00:00', end: '2024-07-30T20:00:00' },
		{ title: 'Summer Concert', start: '2024-07-31T20:00:00', end: '2024-07-31T23:00:00' }
	];

	onMount(() => {
		var calendarEl = document.getElementById('calendar');
		if (calendarEl) {
			const calendar = new Calendar(calendarEl, {
				initialView: 'dayGridMonth',
				plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
				events: data.events.map((event) => ({
					title: event.name,
					...event
				})),
				headerToolbar: {
					left: 'prev,next today',
					center: 'title',

					right: 'dayGridMonth,timeGridWeek,listWeek'
				}
			});
			calendar.render();
		}
	});
</script>

<svelte:head>
	<meta charset="utf-8" />
	<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.14/index.global.min.js"></script>
	<script>
	</script>
</svelte:head>

<div class="relative">
	<div id="calendar" class="m-0 p-0 w-full"></div>
	<div class="absolute right-0">
		{#if browser}
			<div
				class=" text-sm bg-secondary rounded-bl-md rounded-br-md font-semibold px-4 py-2 flex items-start w-20 gap-0.5"
			>
				<img src="/logo.svg" alt="Logo" class="h-4 w-4" />
				Jonze
			</div>
		{/if}
	</div>
</div>
