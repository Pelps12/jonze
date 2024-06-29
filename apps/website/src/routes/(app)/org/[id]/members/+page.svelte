<script lang="ts">
	import DataTable from './data-table.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		ChevronLeft,
		ChevronRight,
		Copy,
		FileDown,
		LoaderCircle,
		PlusCircle,
		QrCode,
		XIcon
	} from 'lucide-svelte';
	import { PUBLIC_URL } from '$env/static/public';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import QRCode from 'qrcode';
	import { Input } from '$lib/components/ui/input';
	import { derived, writable } from 'svelte/store';
	import { goto, invalidate } from '$app/navigation';
	import { organizationForm } from '@repo/db/schema/organizationForm';
	import * as Select from '$lib/components/ui/select';
	import { trpc } from '$lib/client/trpc';
	import type { RouterOutput } from '$lib/server/trpc/routes';
	import { json2csv } from 'json-2-csv';
	import LoadingTable from '$lib/components/custom/LoadingTable.svelte';

	const queryParams = derived(page, ($page) => ({
		orgId: $page.params.id,
		email: $page.url.searchParams.get('email'),
		name: $page.url.searchParams.get('name'),
		customValue: $page.url.searchParams.get('custom_value'),
		customType: $page.url.searchParams.get('custom_type'),
		tag: $page.url.searchParams.get('tag'),
		limit: $page.url.searchParams.get('limit'),
		plan: $page.url.searchParams.get('plan'),
		before: $page.url.searchParams.get('before'),
		after: $page.url.searchParams.get('after')
	}));

	$: result = trpc().memberRouter.getMembers.createQuery($queryParams);

	queryParams.subscribe((params) => console.log(params));

	let selected: any = undefined;
	const defaultFilters = ['name', 'email', 'plan', 'tag'];
	const nameFilter = $page.url.searchParams.get('name');
	const emailFilter = $page.url.searchParams.get('email');
	const planFilter = $page.url.searchParams.get('plan');
	const tagFilter = $page.url.searchParams.get('tag');
	const customFilter = $page.url.searchParams.get('custom_value');
	const customFilterType = $page.url.searchParams.get('custom_type');
	const filterValue = writable<string>();
	if (nameFilter) {
		selected = {
			value: 'name',
			label: 'Name'
		};
		filterValue.set(nameFilter);
	} else if (emailFilter) {
		selected = {
			value: 'email',
			label: 'Email'
		};

		filterValue.set(emailFilter);
	} else if (planFilter) {
		selected = {
			value: 'plan',
			label: 'Plan'
		};

		filterValue.set(planFilter);
	} else if (tagFilter) {
		selected = {
			value: 'tag',
			label: 'Tag'
		};

		filterValue.set(tagFilter);
	} else if (customFilter && customFilterType) {
		selected = {
			value: customFilterType,
			label: customFilterType
		};
		filterValue.set(customFilter);
	}

	const handleCopyLink = (link: string) => {
		if (browser) {
			navigator.clipboard.writeText(link).then(() => {
				toast.success('SIgnup Link added to Clipboard');
			});
		}
	};

	const createQRCode = async (fileName: string, link: string) => {
		if (browser) {
			const aElement = document.createElement('a');
			aElement.setAttribute('download', fileName);
			const href = await QRCode.toDataURL(link, {
				width: 800
			});
			aElement.href = href;
			aElement.setAttribute('target', '_blank');
			aElement.click();
			URL.revokeObjectURL(href);
		}
	};

	const removeAllFilters = (url: URL) => {
		url.searchParams.delete('email');
		url.searchParams.delete('name');
		url.searchParams.delete('plan');
		url.searchParams.delete('tag');
		url.searchParams.delete('before');
		url.searchParams.delete('after');
		url.searchParams.delete('limit');
		url.searchParams.delete('custom_type');
		url.searchParams.delete('custom_value');
		url.searchParams.delete('no_filter');

		return url;
	};

	const handleFilterSubmit = async () => {
		if (selected && selected.value) {
			const url = removeAllFilters(new URL($page.url));
			if (defaultFilters.includes(selected.value)) {
				url.searchParams.set(selected.value, $filterValue);
			} else {
				url.searchParams.set('custom_type', selected.value);
				url.searchParams.set('custom_value', $filterValue);
			}

			goto(url.toString());

			//$page.url.searchParams.set('email', $emailFilter);
		} else {
			toast.warning('Pick a filter');
		}
	};

	const handleReset = () => {
		const url = removeAllFilters(new URL($page.url));
		url.searchParams.set('no_filter', 'true');
		selected = undefined;
		filterValue.update(() => '');
		goto(url.toString());
	};

	$: console.log(selected);

	const handlePagination = async (direction: 'prev' | 'next') => {
		const newUrl = new URL($page.url);
		const pagination = $result.data?.pagination;
		if (pagination) {
			if (direction == 'prev' && pagination.prevCursor) {
				newUrl.searchParams.set('before', pagination.prevCursor);
				newUrl.searchParams.delete('after');
			} else if (direction == 'next' && pagination.nextCursor) {
				newUrl.searchParams.set('after', pagination.nextCursor);
				newUrl.searchParams.delete('before');
			}
		}

		goto(newUrl);
	};

	const handleLimitChange = (newLimit: any) => {
		const newUrl = new URL($page.url);
		const currentLimit = newUrl.searchParams.get('limit') ?? '10';
		if (currentLimit !== newLimit) {
			newUrl.searchParams.set('limit', newLimit);
			goto(newUrl);
		}
	};

	const handleExport = async (members: RouterOutput['memberRouter']['getMembers']['members']) => {
		const csv = json2csv(
			members.map((member) => {
				const additionalInfo = member.additionalInfo?.response?.reduce<any>(
					(accumulator, current) => {
						accumulator[current.label] =
							typeof current.response === 'string' ? current.response : current.response[0];
						return accumulator;
					},
					{}
				);
				const newMember = { ...member, additionalInfo };
				return newMember;
			}),
			{
				expandNestedObjects: true,
				expandArrayObjects: true
			}
		);

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

		// Create a link element for the download
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', 'members.csv');
		link.style.visibility = 'hidden';

		// Append to the document and trigger the download
		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	const limitelected = {
		value: $page.url.searchParams.get('limit') ?? '10',
		label:
			$page.url.searchParams.get('limit') === 'all'
				? 'All'
				: $page.url.searchParams.get('limit') ?? '10'
	};
	$: console.log(selected);
</script>

{#if $result.data && !$result.data?.organizationForm}
	<Alert.Root class="mb-2">
		<Alert.Title>Quick Tip!</Alert.Title>
		<Alert.Description
			>You can add <a
				class="underline pointer-events-auto"
				href={`/org/${$page.params.id}/forms/create?form_name=User Info`}>custom user info</a
			> if your org requires additional fields from members on sign up</Alert.Description
		>
	</Alert.Root>
{/if}

<div class="flex justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="outline" class="border-dotted" builders={[builder]}>Signup Form</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item
				on:click={() => handleCopyLink(`${PUBLIC_URL}/user/signup/${$page.params.id}`)}
				class="justify-between"
			>
				<span>Signup Link</span>
				<Copy class="ml-2 h-4 w-4" />
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="justify-between"
				on:click={() =>
					createQRCode(`Sign up - QR Code`, `${PUBLIC_URL}/user/signup/${$page.params.id}`)}
			>
				<span>SignUp QRCode</span>
				<QrCode class="ml-2 h-4 w-4" />
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<form class="my-3 flex gap-2 flex-start">
	<Select.Root
		{selected}
		onSelectedChange={(e) => {
			selected = e;
		}}
	>
		<Select.Trigger class="w-[100px]">
			<Select.Value placeholder="Filter by" />
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="email">Email</Select.Item>
			<Select.Item value="name">Name</Select.Item>
			<Select.Item value="plan">Plan</Select.Item>
			<Select.Item value="tag">Tag</Select.Item>
			{#each $result.data?.organizationForm?.form ?? [] as formValue}
				<Select.Item value={formValue.label}>{formValue.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	<Input
		bind:value={$filterValue}
		on:keydown={(e) => e.key === 'Enter' && handleFilterSubmit()}
		placeholder={`Filter ${!!selected?.label ? `by ${selected?.label}` : ''}`}
		class="max-w-md"
	/>
	<Button on:click={() => handleFilterSubmit()} disabled={$result.isLoading}>
		{#if $result.isLoading}
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		Apply</Button
	>
	<Button on:click={() => handleReset()} variant="outline">
		<XIcon class="w-4 h-4" />
		Reset
	</Button>
</form>

<div class="flex justify-end gap-2">
	<Button
		variant="outline"
		on:click={() => $result.data?.members && handleExport($result.data.members)}
		><FileDown class="h-4 w-4 mr-2" /><span class="hidden sm:block">Export</span></Button
	>
	<Button
		disabled={!$result.data || !$result.data.pagination.prevCursor || $result.isLoading}
		variant="outline"
		on:click={() => handlePagination('prev')}
	>
		<ChevronLeft class="h-4 w-4" />
		<span class="hidden sm:block">Previous</span>
	</Button>

	<Select.Root selected={limitelected} onSelectedChange={(e) => handleLimitChange(e?.value)}>
		<Select.Trigger class="w-[80px]">
			<Select.Value placeholder="10" />
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="10">10</Select.Item>
			<Select.Item value="20">20</Select.Item>
			<Select.Item value="50">50</Select.Item>
			<Select.Item value="all">All</Select.Item>
		</Select.Content>
	</Select.Root>

	<Button
		disabled={!$result.data || !$result.data.pagination.nextCursor || $result.isLoading}
		variant="outline"
		on:click={() => handlePagination('next')}
	>
		<span class="hidden sm:block">Next</span>
		<ChevronRight class="h-4 w-4" />
	</Button>
</div>

<div class=" mx-auto py-10">
	{#if $result.data}
		<DataTable data={$result.data} />
	{:else}
		<LoadingTable />{/if}
</div>
