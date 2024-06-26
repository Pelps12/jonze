<script lang="ts">
	import DataTable from './data-table.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Copy, LoaderCircle, PlusCircle, QrCode, XIcon } from 'lucide-svelte';
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

	$: $page.url.searchParams.get('tag'), console.log($page.url.searchParams.get('tag'));

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
		goto(url.toString());
	};

	$: console.log(selected);
</script>

{#if !$result.data?.organizationForm}
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

{#if $result.data}
	<div class=" mx-auto py-10">
		<DataTable data={$result.data} isLoading={$result.isLoading} />
	</div>
{/if}
