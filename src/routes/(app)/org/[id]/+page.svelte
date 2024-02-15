
<script lang="ts">
	import * as Card from "$lib/components/ui/card";
    import * as Avatar from "$lib/components/ui/avatar";
	import { Button } from "$lib/components/ui/button";
	import { UserCheckIcon } from "lucide-svelte";

	import type { PageData } from "./$types";


    export let data: PageData;
    import { scaleLinear } from "d3-scale";
    const chartData = [
		{
			event_id: 'be6fab0e-44ee-4d9b-893b-56edb84fce9c',
			name: '2nd General Body Meeting',
			created_at: '2024-02-08T23:25:07.871848+00:00',
			type: 'meeting',
			participants: 20
		},
		{
			event_id: '2e1ac13e-a94b-4c11-a38b-e657f07e6c29',
			name: 'First General Body Meeting',
			created_at: '2024-01-25T22:50:59.086916+00:00',
			type: 'meeting',
			participants: 47
		},
		{
			event_id: '2452a678-fc0e-48ea-b3c5-02cc42e442eb',
			name: 'Seventh General Body Meeting',
			created_at: '2023-11-30T21:53:51.370046+00:00',
			type: 'meeting',
			participants: 24
		},
		{
			event_id: '2b5cc630-8777-42d6-af74-7066d1000fbb',
			name: 'Fifth General Body Meeting',
			created_at: '2023-10-26T22:52:25.072001+00:00',
			type: 'meeting',
			participants: 31
		},
		{
			event_id: '0b97c2c6-b094-455e-a380-07e7f5ba9714',
			name: 'Fourth General Body Meeting',
			created_at: '2023-10-16T17:12:12+00:00',
			type: 'meeting',
			participants: 50
		},
		{
			event_id: 'd130197f-e0b8-4333-8721-6405c3d29c0b',
			name: 'Third GBM',
			created_at: '2023-09-28T06:42:23.541029+00:00',
			type: 'meeting',
			participants: 50
		},
		{
			event_id: '7d398f31-fb5c-4752-8649-ebf3aed22a8e',
			name: 'Second General Body Meeting',
			created_at: '2023-09-14T21:12:04.999196+00:00',
			type: 'meeting',
			participants: 34
		},
		{
			event_id: 'e08303d1-f493-4cdd-9de9-25bfe178bd00',
			name: 'First General Body Meeting',
			created_at: '2023-08-31T05:03:25.083682+00:00',
			type: 'meeting',
			participants: 132
		},
		{
			event_id: '715b9d43-4c56-43d2-b230-2ca0aca011c1',
			name: 'Career Panel Meeting',
			created_at: '2023-04-20T22:36:37.756413+00:00',
			type: 'meeting',
			participants: 25
		},
		{
			event_id: 'acc8b280-13c8-41f3-b4e5-95a5609bfadf',
			name: 'Seventh General Body Meeting',
			created_at: '2023-03-23T23:52:30.295869+00:00',
			type: 'meeting',
			participants: 12
		}
	];


	const xTicks = chartData.map((d) => d.name);
	const yTicks = [0, 200];
	const padding = { top: 20, right: 15, bottom: 20, left: 45 };

	let width = 500;
	let height = 200;

	function formatMobile(tick: number | string) {
		return "'" + tick.toString().slice(-2);
	}

	$: xScale = scaleLinear()
		.domain([0, xTicks.length])
		.range([padding.left, width - padding.right]);

	$: yScale = scaleLinear()
		.domain([0, Math.max.apply(null, yTicks)])
		.range([height - padding.bottom, padding.top]);

	$: innerWidth = width - (padding.left + padding.right);
	$: barWidth = innerWidth / xTicks.length;


</script>

<div class="flex flex-col w-full md:flex-row">
    <Card.Root class="w-full basis-2/3 m-2">
        <Card.Header class="p-4">
          <div class="grid gap-4">
            <Card.Title class="text-lg font-semibold">Event Metrics</Card.Title>
            <Card.Description class="text-sm">Performance of last 10 events</Card.Description>
          </div>
        </Card.Header>
        <Card.Content class="grid gap-4">
            <div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
                <svg>
                    <!-- y axis -->
                    <g class="axis y-axis">
                        {#each yTicks as tick}
                            <g class="text-xs" transform="translate(0, {yScale(tick)})">
                                <text
                                    stroke="none"
                                    font-size="12"
                                    orientation="left"
                                    width="60"
                                    height="310"
                                    x="57"
                                    y="-4"
                                    fill="#888888"
                                    text-anchor="end"><tspan x="36" dy="0.355em">${tick}</tspan></text
                                >
                            </g>
                        {/each}
                    </g>
            
                    <!-- x axis -->
                    <g class="axis x-axis">
                        {#each chartData as point, i}
                            <g class="text-xs" transform="translate({xScale(i)},{height})">
                                <text
                                    stroke="none"
                                    font-size="12"
                                    orientation="bottom"
                                    width="531"
                                    height="30"
                                    x={barWidth / 2}
                                    y="-15"
                                    fill="#888888"
                                    text-anchor="middle"
                                    ><tspan x={barWidth / 2} dy="0.71em"
                                        >{width > 380 ? point.name : formatMobile(point.name)}</tspan
                                    ></text
                                >
                            </g>
                        {/each}
                    </g>
            
                    <g>
                        {#each chartData as point, i}
                            <rect
                                class="bg-primary-foreground"
                                x={xScale(i) + 2}
                                y={yScale(point.participants)}
                                width={barWidth - 8}
                                height={yScale(0) - yScale(point.participants)}
                                fill="currentColor"
                                rx="4"
                                ry="4"
                            />
                        {/each}
                    </g>
                </svg>
            </div>
            

        </Card.Content>
    </Card.Root>
    
    
    <Card.Root class="w-full basis-1/3 m-2">
        <Card.Header class="p-4">
          <div class="grid gap-4">
            <Card.Title class="text-lg font-semibold">Recent Members</Card.Title>
            <Card.Description class="text-sm">Recent additions to your org</Card.Description>
          </div>
        </Card.Header>
        <Card.Content class="grid gap-4">
            {#each data.organization.members as member}
                <div class="relative flex items-start space-x-4 ">
                    <Avatar.Root class="w-10 h-10 border">
                        <Avatar.Image src={member.user.profilePictureUrl} />
                        <Avatar.Fallback>{(member.user.firstName?.charAt(0) ?? "U") + (member.user.lastName?.charAt(0) ?? "")}</Avatar.Fallback>
                    </Avatar.Root>
                    <div class="text-sm grid gap-1">
                        <Card.Title class="text-base font-semibold">
                            {((member.user.firstName ?? "No")+ " " + (member.user.lastName ?? "Name"))}
                        </Card.Title>
                        <Card.Description class="text-sm">
                            {member.user.email}
                        </Card.Description>
                    </div>

                    <div class="ml-auto absolute right-0 text-sm self-center">
                        {member.createdAt.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                    </div>
                </div>
            {/each}
        </Card.Content>
    </Card.Root>
</div>

<style>
    .chart {
        width: 100%;
        margin: 0 auto;
    }

    svg {
        position: relative;
        width: 100%;
        height: 350px;
    }

    rect {
        max-width: 51px;
    }
</style>

