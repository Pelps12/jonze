<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';
	import type { PageData } from './$types';
	import * as Resizable from '$lib/components/ui/resizable';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { loadConnectAndInitialize } from '@stripe/connect-js';
	import { mode } from 'mode-watcher';
	import { CheckCircle2Icon, Circle } from 'lucide-svelte';

	export let data: PageData;

	export let layout: number[] | undefined = undefined;
	function onLayoutChange(sizes: number[]) {
		if (browser) {
			document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`;
		}
	}

	import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
	import { Bar } from 'svelte-chartjs';
	import { derived } from 'svelte/store';

	import { formatName } from '$lib/utils';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';

	Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	Chart.defaults.font.family = 'Onest';

	const isLight = derived(mode, ($mode) => $mode === 'light');

	isLight.subscribe((a) => console.log(a));

	const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
	const chartData = {
		labels: data.chartData.labels,
		datasets: [
			{
				label: 'Attendance',
				data: data.chartData.data,
				borderColor: $isLight ? '#000' : '#fff',
				backgroundColor: $isLight ? '#000' : '#fff',
				borderWidth: 0,
				borderRadius: 5,
				borderSkipped: false
			}
		]
	};

	onMount(() => {
		if (data.clientSecret) {
			const stripeConnectInstance = loadConnectAndInitialize({
				// This is your test publishable API key.
				publishableKey: PUBLIC_STRIPE_KEY,
				fetchClientSecret: async () => {
					return data.clientSecret ?? '';
				},
				fonts: [
					{
						cssSrc: 'https://fonts.googleapis.com/css2?family=Onest'
					}
				],
				appearance: {
					variables: {
						colorBackground: $mode === 'light' ? '#f3f2f1' : '#161413'
					}
				}
			});
			mode.subscribe((value) =>
				stripeConnectInstance.update({
					appearance: {
						variables: {
							colorBackground: value === 'light' ? '#f3f2f1' : '#161413'
						}
					}
				})
			);

			const paymentComponent = stripeConnectInstance.create('payments');
			const container = document.getElementById('connectElement');
			container?.appendChild(paymentComponent);
		}
	});
</script>

{#if data.organization.events.length == 0 && data.organization.members.length == 1}
	<div class="mb-6">
		<h2 class="text-xl font-semibold">Welcome to Jonze</h2>
		<p class="text-sm">Here are a few things you might want to get things going</p>
	</div>

	<div class="grid grid-cols-2 gap-5 max-w-2xl mx-auto">
		<Card.Root class="relative">
			<CheckCircle2Icon class="h-5 w-5 absolute top-0 right-0 m-3" />
			<Card.Header>
				<Card.Title>"User Info" Form (Optional)</Card.Title>
				<Card.Description>The additional fields your org requests from members</Card.Description>
			</Card.Header>
			<Card.Content><p class="text-sm">NOTE: Be sure to call it "User Info"</p></Card.Content>
			<Card.Footer>
				<Button href={`/org/${$page.params.id}/forms/create?form_name=User Info`}>Build</Button>
			</Card.Footer>
		</Card.Root>

		<Card.Root class="relative">
			<CheckCircle2Icon class="h-5 w-5 absolute top-0 right-0 m-3" />
			<Card.Header>
				<Card.Title>Attendance Form</Card.Title>
				<Card.Description>A form that can be attached to created events</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-sm">This can be named anything</p>
			</Card.Content>
			<Card.Footer>
				<Button href={`/org/${$page.params.id}/forms/create`}>Form</Button>
			</Card.Footer>
		</Card.Root>

		<Card.Root class="relative">
			<CheckCircle2Icon class="h-5 w-5 absolute top-0 right-0 m-3" />
			<Card.Header>
				<Card.Title>First Event</Card.Title>
				<Card.Description
					>Members can start marking attendace when you create an event.
				</Card.Description>
			</Card.Header>

			<Card.Content>
				<p class="text-sm">Copy the link or QR Code and that's it</p>
			</Card.Content>
			<Card.Footer>
				<Button href={`/org/${$page.params.id}/events?newevent=true`}>Create</Button>
			</Card.Footer>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>You're Done</Card.Title>
				<Card.Description>Or are you? 🤔</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-sm">
					There's more. Like a lot more. We've got APIs, membership plans and more
				</p>
			</Card.Content>
			<Card.Footer>
				<Button disabled variant="ghost">Explore</Button>
			</Card.Footer>
		</Card.Root>
	</div>
{:else}
	<Resizable.PaneGroup
		direction="horizontal"
		class=" rounded-lg border max-h-[30rem]"
		{onLayoutChange}
	>
		<Resizable.Pane
			defaultSize={layout ? layout[0] : 60}
			collapsedSize={0}
			collapsible={true}
			minSize={50}
			onResize={(e) => Chart.getChart('')?.resize(10, 10)}
		>
			<Card.Root class=" m-2">
				<Card.Header class="p-4">
					<div class="grid gap-4">
						<Card.Title class="text-lg font-semibold">Event Metrics</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="grid gap-4 h-auto">
					<Bar
						data={chartData}
						options={{
							maintainAspectRatio: false,
							aspectRatio: 1,
							scales: { x: { display: false }, y: { ticks: { stepSize: 1 } } }
						}}
					/>
				</Card.Content>
			</Card.Root>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane
			defaultSize={layout ? layout[0] : 40}
			minSize={30}
			collapsedSize={0}
			collapsible={true}
		>
			<Card.Root class=" m-2 h-auto">
				<Card.Header class="p-4">
					<div class="grid gap-4">
						<Card.Title class="text-lg font-semibold">Recent Members</Card.Title>
						<Card.Description class="text-sm">Recent additions to your org</Card.Description>
					</div>
				</Card.Header>
				<Card.Content class="grid gap-4">
					{#each data.organization.members as member}
						<a
							class="relative flex items-start space-x-4"
							href={`/org/${$page.params.id}/members/${member.id}`}
						>
							<Avatar.Root class="w-10 h-10 border">
								<Avatar.Image src={member.user.profilePictureUrl} />
								<Avatar.Fallback
									>{(member.user.firstName?.charAt(0) ?? 'U') +
										(member.user.lastName?.charAt(0) ?? '')}</Avatar.Fallback
								>
							</Avatar.Root>
							<div class="text-sm grid gap-1">
								<Card.Title class="text-base font-semibold">
									{formatName(member.user.firstName, member.user.lastName)}
								</Card.Title>
								<Card.Description class="text-sm">
									{member.user.email}
								</Card.Description>
							</div>

							<div class="ml-auto absolute right-0 text-sm self-center">
								{member.createdAt.toLocaleString('en-US', {
									month: 'short',
									day: 'numeric'
								})}
							</div>
						</a>
					{/each}
				</Card.Content>
			</Card.Root>
		</Resizable.Pane>
	</Resizable.PaneGroup>
{/if}

<div id="connectElement" class="my-5" />
