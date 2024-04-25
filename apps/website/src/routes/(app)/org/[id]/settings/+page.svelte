<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ChevronDown, CopyIcon, PlusCircle, TrashIcon } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import * as Avatar from '$lib/components/ui/avatar';
	import { invalidate } from '$app/navigation';
	import { PUBLIC_APIKEY_PREFIX } from '$env/static/public';
	import { Label } from '$lib/components/ui/label';
	import InviteBox from './InviteBox.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import * as Tooltip from '$lib/components/ui/tooltip';

	page.subscribe((info) => console.log(info.form));
	let open = true;

	const handleCopyKey = (key: string) => {
		if (browser) {
			navigator.clipboard.writeText(key).then(() => {
				toast.success('API Key Copied to Clipboard');
			});
		}
	};

	const handleDeleteKey = async (keyId: string) => {
		const response = await fetch('/api/keys', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				keyId
			})
		});
		if (response.ok) {
			invalidate((url) => {
				console.log(url.pathname, $page.url.pathname);
				return url.pathname === $page.url.pathname;
			});
		}
	};
	export let data;
	console.log(data);

	export let form;

	console.log(form?.members);

	let imageUrl: string | undefined = undefined;

	// Function to handle the file selection and update the image preview
	function handleFileChange(event: any) {
		const file = event.target.files[0];
		if (file) {
			const fileSize = file.size / (1024 * 1024);
			if (fileSize > 5) {
				toast.error('File Size must be less than 5MB');
			}
			imageUrl = URL.createObjectURL(file);
		}
	}

	let techieMode = browser ? document.cookie === 'true' : false;
</script>

<div class="flex justify-between items-center mb-6">
	<h2 class="text-xl font-semibold">Settings</h2>

	<div class="flex items-center space-x-2">
		<Tooltip.Root>
			<Tooltip.Trigger class="flex items-center space-x-2"
				><Switch id="airplane-mode" bind:checked={techieMode} />
				<Label for="airplane-mode">Techie Mode</Label></Tooltip.Trigger
			>
			<Tooltip.Content>
				<p>Hope you have a tech committee</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>
</div>
<div class="p-6 grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
	<form class="p-2" method="post" action="?/updateLogo" enctype="multipart/form-data">
		<Card.Root class="sm:max-w-[425px]">
			<Card.Header>
				<Card.Title>Your Org Logo</Card.Title>
				<Card.Description>A little bit of branding</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="grid w-full max-w-sm items-center gap-1.5">
					{#if data.logo || imageUrl}
						<img
							src={imageUrl ?? data.logo}
							alt="Organization"
							width="100"
							height="100"
							class="mx-auto"
						/>
					{/if}
					<Input name="logo" id="logo" type="file" on:change={handleFileChange} />
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Update</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	<div class="p-2">
		<Dialog.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex justify-between"
						>Team Members

						<Dialog.Trigger class={buttonVariants({ variant: 'default' })}
							><PlusCircle class="mr-2 h-4 w-4" /> Invite</Dialog.Trigger
						>
						<Dialog.Content class="sm:max-w-[425px]">
							<Dialog.Header>
								<Dialog.Title>Upgrade Existing User Privileges</Dialog.Title>
								<Dialog.Description>Only existing users can be added as admins</Dialog.Description>
							</Dialog.Header>
							<InviteBox />
						</Dialog.Content>
					</Card.Title>
					<Card.Description>Invite your team members to collaborate</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-6">
					{#each data.members as member}
						<div class="flex items-center justify-between space-x-4">
							<div class="flex items-center space-x-4">
								<Avatar.Root>
									<Avatar.Image src={member.user.profilePictureUrl} alt="Sofia Davis" />
									<Avatar.Fallback>U</Avatar.Fallback>
								</Avatar.Root>
								<div>
									<p class="text-sm font-medium leading-none">
										{member.user.firstName}
										{member.user.lastName}
									</p>
									<p class="text-sm text-muted-foreground">{member.user.email}</p>
								</div>
							</div>
							<Popover.Root>
								<Popover.Trigger asChild let:builder>
									<Button builders={[builder]} variant="outline" class="ml-auto">
										{member.role}
										<ChevronDown class="ml-2 h-4 w-4 text-muted-foreground" />
									</Button>
								</Popover.Trigger>
								<Popover.Content class="p-0" align="end">
									<Command.Root>
										<Command.Input placeholder="Select new role..." />
										<Command.List>
											<Command.Empty>No roles found.</Command.Empty>
											<Command.Group>
												<Command.Item class="flex flex-col items-start space-y-1 px-4 py-2">
													<p>Admin</p>
													<p class="text-sm text-muted-foreground">
														Can view, comment and manage resources.
													</p>
												</Command.Item>
												<Command.Item class="flex flex-col items-start space-y-1 px-4 py-2">
													<p>Owner</p>
													<p class="text-sm text-muted-foreground">
														Admin-level access to all resources. Can delete org
													</p>
												</Command.Item>
											</Command.Group>
										</Command.List>
									</Command.Root>
								</Popover.Content>
							</Popover.Root>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		</Dialog.Root>
	</div>

	{#if techieMode}
		<form method="post" action="?/create">
			<Card.Root class="w-[500px]  m-2">
				<Card.Header class="p-4">
					<div class="flex justify-between">
						<Card.Title class="text-lg font-semibold">API Keys</Card.Title>

						{#if data.keys.length > 0}
							<Button type="submit">
								<PlusCircle class="mr-2 h-4 w-4" />
								<span>Create API Key</span>
							</Button>
						{/if}
					</div>
				</Card.Header>

				<Card.Content class="grid gap-4">
					{#if data.keys.length === 0}
						<div
							class="flex h-[250px] shrink-0 items-center justify-center rounded-md border border-dashed"
						>
							<div
								class="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center"
							>
								<h3 class="mt-4 text-lg font-semibold">No API Key Made</h3>
								<p class="mb-4 mt-2 text-sm text-muted-foreground">
									You can use API keys to connect Jonze to your website
								</p>
								<Button type="submit">
									<PlusCircle class="mr-2 h-4 w-4" />
									<span>Create API Key</span>
								</Button>
							</div>
						</div>
					{:else}
						{#each data.keys as key}
							<div class="flex w-full max-w-sm items-center space-x-2">
								<Input
									id="name"
									value={`${PUBLIC_APIKEY_PREFIX}_${key.hint}********************`}
									class="col-span-3"
									readonly
								/>
								<Button
									class="w-auto"
									variant="destructive"
									on:click={() => handleDeleteKey(key.keyId)}
								>
									<TrashIcon class="h-4 w-4 p-0" />
								</Button>
							</div>
						{/each}
					{/if}
				</Card.Content>
			</Card.Root>
			{#if typeof $page.form?.key === 'string'}
				<AlertDialog.Root bind:open closeOnOutsideClick={false}>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>API Key</AlertDialog.Title>
							<AlertDialog.Description>
								One you close this dialog, the API key will no longer be visible.
							</AlertDialog.Description>
							<div class="flex w-full max-w-sm items-center space-x-2">
								<Input id="name" value={$page.form.key} class="col-span-3" readonly />
								<AlertDialog.Action class="w-auto" on:click={() => handleCopyKey($page.form.key)}>
									<CopyIcon class="h-4 w-4 p-0" />
								</AlertDialog.Action>
							</div>
						</AlertDialog.Header>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{/if}
		</form>

		<div class="col-span-2">
			<Dialog.Root>
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex justify-between">Webhooks</Card.Title>
						<Card.Description>Send events out to other platforms</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-6">
						{#if data.webhookUrl}
							<iframe
								title="SVIX Webhook Portal"
								src={data.webhookUrl}
								style="width: 100%; border: none;"
								allow="clipboard-write"
								loading="lazy"
								class="h-[60vh]"
							>
							</iframe>
						{:else}
							<form
								class="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]"
								method="post"
								action="?/enable_webhooks"
							>
								<div class="flex flex-col items-center gap-1 text-center">
									<h3 class="text-2xl font-bold tracking-tight">
										You haven't enabled webhooks in this organization
									</h3>
									<p class="text-sm text-muted-foreground">
										Events can be sent downstream to endpoints when webhooks are enabled
									</p>
									<Button class="mt-4" type="submit">Enable Webhooks</Button>
								</div>
							</form>
						{/if}
					</Card.Content>
				</Card.Root>
			</Dialog.Root>
		</div>
	{/if}
</div>
