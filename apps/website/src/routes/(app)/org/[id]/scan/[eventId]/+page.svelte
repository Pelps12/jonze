<script lang="ts">
	import { onMount } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	import { Search, UserCheck, UserX, Check } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { ArrayElement } from '$lib/types/misc';
	import { cn, formatName } from '$lib/utils';
	import { trpc } from '$lib/client/trpc';
	import { page } from '$app/stores';
	import type { Attendance } from '@repo/db';

	// Mock user data for demonstration
	const mockUsers = [
		{ id: '1', name: 'John Doe', email: 'john@example.com', checkedIn: false },
		{ id: '2', name: 'Jane Smith', email: 'jane@example.com', checkedIn: true }
	];
	let searchQuery: string = '';
	let memberId: string | null = null;

	$: getMembersQuery = trpc().memberRouter.getMembersToScan.createQuery(
		{
			name: searchQuery !== '' ? searchQuery : null,
			memberId,
			eventId: $page.params.eventId,
			orgId: $page.params.id
		},
		{
			enabled: searchQuery.length > 2 || !!memberId
		}
	);

	const updateAttendance = trpc().memberRouter.upsertAttendance.createMutation();

	let selectedUser: ArrayElement<typeof mockUsers> | null = null;
	let showScanner = false;
	let html5QrCode: Html5Qrcode;

	const utils = trpc().createUtils();

	onMount(() => {
		html5QrCode = new Html5Qrcode('qr-reader');
		console.log(html5QrCode);
		return () => {
			if (html5QrCode && html5QrCode.isScanning) {
				html5QrCode.stop();
			}
		};
	});

	function handleScan(decodedText: string) {
		console.log(decodedText);
		memberId = decodedText;
		showScanner = false;
	}

	function handleCheckInOut(memberId: string, attendanceId?: string) {
		$updateAttendance
			.mutateAsync({
				memberId,
				orgId: $page.params.id,
				eventId: $page.params.eventId,
				attendanceId
			})
			.then(() => utils.memberRouter.getMembersToScan.invalidate());
	}
	$: showScanner, console.log(showScanner);

	$: if (showScanner && html5QrCode && !html5QrCode.isScanning) {
		html5QrCode.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			handleScan,
			() => {}
		);
	} else if (!showScanner && html5QrCode && html5QrCode.isScanning) {
		html5QrCode.stop();
	}
	let timer: any;

	const debounce = (v: string) => {
		console.log(v);
		clearTimeout(timer);
		timer = setTimeout(() => {
			searchQuery = v;
		}, 1000);
	};

	const getCheckInState = (
		attendance: Attendance | null
	): 'not_checked' | 'checked_in' | 'checked_out' => {
		return attendance
			? attendance?.createdAt.getTime() === attendance?.updatedAt.getTime()
				? 'checked_in'
				: 'checked_out'
			: 'not_checked';
	};
</script>

<div class="container mx-auto p-4 max-w-2xl">
	<Card.Root>
		<div class="p-6">
			<h2 class="text-2xl font-bold text-center mb-4">Member Check-In</h2>
			<div class="space-y-4">
				<div class="flex space-x-2">
					<Input
						type="text"
						placeholder="Search by name or email"
						value={searchQuery}
						class="flex-grow"
						on:keyup={({ target }) => target && debounce(target.value)}
					/>
				</div>
				<div class="text-center">
					<Button on:click={() => (showScanner = !showScanner)}>
						{showScanner ? 'Hide QR Scanner' : 'Show QR Scanner'}
					</Button>

					<Button variant="secondary" href={`../events/${$page.params.eventId}`}
						>View Attendance</Button
					>
				</div>

				<div class={cn('mt-4 w-full h-[500px]', !showScanner && 'hidden')}>
					<div id="qr-reader" style="width: 100%"></div>
				</div>

				{#if $getMembersQuery.data?.new_members}
					{#each $getMembersQuery.data.new_members as data}
						<Card.Root>
							<div class="p-4">
								<h3 class="text-lg font-semibold">
									{formatName(data.User.firstName, data.User.lastName)}
								</h3>
								<p class="text-sm text-gray-500">{data.User.email}</p>
								<p class="text-sm font-medium mt-2">
									Status: {data.Attendance
										? data.Attendance?.createdAt.getTime() === data.Attendance?.updatedAt.getTime()
											? 'Checked In'
											: 'Checked Out'
										: 'Not Checked In'}
								</p>
								<Button
									on:click={() => handleCheckInOut(data.Member.id, data.Attendance?.id)}
									variant={data.Attendance
										? data.Attendance?.createdAt.getTime() === data.Attendance?.updatedAt.getTime()
											? 'destructive'
											: 'secondary'
										: 'default'}
									disabled={(data.Attendance &&
										data.Attendance?.createdAt.getTime() !==
											data.Attendance?.updatedAt.getTime()) ||
										$updateAttendance.isPending ||
										$getMembersQuery.isPending}
									class="mt-4 "
								>
									{#if data.Attendance}
										{#if data.Attendance?.createdAt.getTime() === data.Attendance?.updatedAt.getTime()}
											<UserX class="h-4 w-4 mr-2" />
											Check Out
										{:else}
											<Check class="h-4 w-4 mr-2" />
											Checked Out
										{/if}
									{:else}
										<UserCheck class="h-4 w-4 mr-2" />
										Check In
									{/if}
								</Button>
							</div>
						</Card.Root>
					{/each}
				{/if}
			</div>
		</div>
	</Card.Root>
</div>
