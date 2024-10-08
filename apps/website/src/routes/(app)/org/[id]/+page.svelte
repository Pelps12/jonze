<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { PUBLIC_ENVIRONMENT, PUBLIC_STRIPE_KEY } from '$env/static/public';
	import type { PageData } from './$types';
	import * as Resizable from '$lib/components/ui/resizable';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { loadConnectAndInitialize } from '@stripe/connect-js';
	import { mode } from 'mode-watcher';

	import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
	import {
		Area,
		Axis,
		Chart as NewChart,
		Highlight,
		Svg,
		Tooltip as NewTooltip,
		TooltipItem,
		Bars,
		RectClipPath
	} from 'layerchart';
	import { Bar } from 'svelte-chartjs';
	import { derived } from 'svelte/store';

	import { cn, formatName, getInitials } from '$lib/utils';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { twJoin } from 'tailwind-merge';
	import { trpc } from '$lib/client/trpc';
	import { ChevronRight, RefreshCw } from 'lucide-svelte';
	import posthog from 'posthog-js';
	import { scaleBand, scalePoint } from 'd3-scale';
	import { format } from 'date-fns';
	import { goto } from '$app/navigation';

	let newGraphFlagEnabled = PUBLIC_ENVIRONMENT === 'dev';
	onMount(() => {
		posthog.onFeatureFlags(() => {
			if (posthog.isFeatureEnabled('new-chart-component')) {
				newGraphFlagEnabled = true;
			}
		});
	});

	export let layout: number[] | undefined = undefined;

	$: pageQuery = trpc().homePageRouter.home.createQuery(
		{
			orgId: $page.params.id
		},
		{
			refetchInterval: false
		}
	);

	const utils = trpc().createUtils();

	const transactionHistoryMutation =
		trpc().homePageRouter.stripeTransactionHistory.createMutation();

	function onLayoutChange(sizes: number[]) {
		if (browser) {
			document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`;
		}
	}

	Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	Chart.defaults.font.family = 'Onest';

	const isLight = derived(mode, ($mode) => $mode === 'light');

	isLight.subscribe((a) => console.log(a));

	let chartData: {
		labels: string[];
		datasets: {
			label: string;
			data: number[];
			borderColor: string;
			backgroundColor: string;
			borderWidth: number;
			borderRadius: number;
			borderSkipped: boolean;
		}[];
	};
	$: chartData = {
		labels: data?.chartData?.labels ?? [],
		datasets: [
			{
				label: 'Attendance',
				data: data?.chartData.data ?? [],
				borderColor: $isLight ? '#000' : '#fff',
				backgroundColor: $isLight ? '#000' : '#fff',
				borderWidth: 0,
				borderRadius: 5,
				borderSkipped: false
			}
		]
	};

	const mergeArrays = (ar1: any[], ar2: any[], ar3: any[]) => {
		console.log(
			ar1.map(function (x, i) {
				return { value: x, label: ar2[i] };
			})
		);
		return ar1.map(function (x, i) {
			return { value: x, label: ar2[i], id: ar3[i], hiddenId: i };
		});
	};

	let transactionHistoryVisible: 'not_fetched' | 'fetched' | 'attached' = 'not_fetched';

	//m
	page.subscribe(() => {
		if (browser) {
			const container = document.getElementById('connectElement');

			console.log('NFvioernivoervnioeri');

			while (container?.firstChild) {
				if (container.lastChild) {
					container.removeChild(container.lastChild);
				}
			}

			const stripeConnectInstance = loadConnectAndInitialize({
				// This is your test publishable API key.
				publishableKey: PUBLIC_STRIPE_KEY,
				fetchClientSecret: async () => {
					const clientSecret =
						(await $transactionHistoryMutation.mutateAsync({ orgId: $page.params.id })) ?? '';
					transactionHistoryVisible = 'fetched';
					return clientSecret;
				},
				fonts: [
					{
						cssSrc: 'https://fonts.googleapis.com/css2?family=Onest'
					}
				],
				appearance: {
					variables: {
						colorBackground: $mode === 'light' ? '#f3f2f1' : '#1B1918'
					}
				}
			});
			console.log(stripeConnectInstance);
			mode.subscribe((value) =>
				stripeConnectInstance.update({
					appearance: {
						variables: {
							colorBackground: value === 'light' ? '#f3f2f1' : '#1B1918'
						}
					}
				})
			);

			const paymentComponent = stripeConnectInstance.create('payments');
			container?.appendChild(paymentComponent);

			setTimeout(() => {
				transactionHistoryVisible = 'attached';
			}, 2000);
		}
	});

	const handleReload = async () => {
		await utils.homePageRouter.invalidate();
	};

	$: data = $pageQuery.data;
</script>

{#if data}
	<div class="relative">
		{#if data.organization.events.length == 0 && data.organization.members.length == 1}
			<div
				class="mb-6 text-center h-[90vh] flex flex-col justify-center absolute top-0 left-0 right-0 z-10"
			>
				<div class="my-auto">
					<h2 class="text-5xl font-semibold my-2">
						Welcome to <span class="text-primary">Jonze</span>
					</h2>
					<p class="text-lg text-balance my-2">Get started by making your First Event.</p>
					<Button size="lg" class="text-xl" href={`/org/${$page.params.id}/events?newevent=true`}
						>CREATE</Button
					>
				</div>
			</div>

			<!-- <div class="grid gap-5 max-w-xl mx-auto">
		<Card.Root class="relative">
			<CircleIcon class="h-5 w-5 absolute top-0 right-0 m-3" />
			<Card.Header>
				<Card.Title></Card.Title>
				<Card.Description></Card.Description>
			</Card.Header>

			<Card.Content>
				<p class="text-sm">Copy the link or QR Code and that's it</p>
			</Card.Content>
			<Card.Footer></Card.Footer>
		</Card.Root>
	</div> -->
		{/if}

		<div class="grid md:grid-cols-2 xl:grid-cols-3">
			<Card.Root class=" m-2 xl:col-span-2 h-[40vh] md:h-auto">
				<Card.Header class="p-4 relative">
					<div class="grid gap-4">
						<Card.Title class="text-lg font-semibold">Event Metrics</Card.Title>
					</div>

					<a
						class="absolute top-0 right-0 p-3 text-sm flex items-center"
						href={`/org/${$page.params.id}/events?view=graph`}
						on:mouseenter={() =>
							utils.eventRouter.getEvents.prefetch({
								orgId: $page.params.id
							})}
					>
						<p>See More</p>
						<ChevronRight class="ml-2 h-4 w-4" />
					</a>
				</Card.Header>
				<Card.Content class="grid gap-4 h-[90%]">
					{#if newGraphFlagEnabled}
						<NewChart
							data={mergeArrays(data.chartData.data, data.chartData.labels, data.chartData.ids)}
							x="hiddenId"
							xScale={scaleBand().padding(0.4)}
							y="value"
							yDomain={[0, null]}
							yNice={4}
							padding={{ left: 16, bottom: 24 }}
							tooltip={{
								mode: 'band',
								onClick: ({ data }) => {
									goto(`/org/${$page.params.id}/events/${data.id}`);
									//alert('You clicked on:' + JSON.stringify(data, null, 2));
								}
							}}
						>
							<Svg>
								<Axis placement="left" grid rule />
								<Bars
									radius={4}
									strokeWidth={1}
									class="fill-foreground stroke-none group-hover:fill-foreground transition-colors"
								/>
								<Highlight area>
									<svelte:fragment slot="area" let:area>
										<RectClipPath
											x={area.x}
											y={area.y}
											width={area.width}
											height={area.height}
											spring
										>
											<Bars radius={4} strokeWidth={1} class="fill-primary" />
										</RectClipPath>
									</svelte:fragment>
								</Highlight>
							</Svg>
							<NewTooltip header={(data) => data.label} let:data>
								<TooltipItem label="Attendance Count" value={data.value} />
							</NewTooltip>
						</NewChart>
					{:else}
						<Bar
							data={chartData}
							on:click={(e) => console.log(e)}
							options={{
								maintainAspectRatio: false,
								aspectRatio: 1,
								scales: { x: { display: false }, y: { ticks: { stepSize: 1 } } }
							}}
						/>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root class=" m-2 h-auto">
				<Card.Header class="p-4 relative">
					<div class="grid gap-4">
						<Card.Title class="text-lg font-semibold">Recent Members</Card.Title>
						<Card.Description class="text-sm">Recent additions to your org</Card.Description>
					</div>

					<a
						class="absolute top-0 right-0 p-3 text-sm flex items-center"
						href={`/org/${$page.params.id}/members`}
						on:mouseenter={() =>
							utils.eventRouter.getEvents.prefetch({
								orgId: $page.params.id
							})}
					>
						<p>See More</p>
						<ChevronRight class="ml-2 h-4 w-4" />
					</a>
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
									>{getInitials(
										formatName(member.user.firstName, member.user.lastName)
									)}</Avatar.Fallback
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
		</div>
	</div>
{/if}

<Card.Root
	class={cn(
		' relative my-4 hidden',
		transactionHistoryVisible === 'fetched' && 'block animate-pulse',
		transactionHistoryVisible === 'attached' && 'animate-none block'
	)}
>
	<Card.Header class="p-4 absolute z-[20]">
		<div class="grid gap-4">
			<Card.Title class="text-lg font-semibold">Transaction History</Card.Title>
		</div>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<div id="connectElement" class="my-5" />
	</Card.Content>
</Card.Root>
