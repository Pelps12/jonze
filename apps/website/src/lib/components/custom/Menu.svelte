<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Sun, Moon, UserPlus, PlusCircle, MessageSquare, Menu } from 'lucide-svelte';
	import { setMode, resetMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';

	import { mediaQuery } from 'svelte-legos';
	import type { Organization, User } from '@workos-inc/node';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { cn, formatName, getInitials } from '$lib/utils';
	import * as Tooltip from '../ui/tooltip';
	import type { SessionType } from '$lib/types/misc';
	let open = false;
	const isDesktop = mediaQuery('(min-width: 768px)');

	export let user: Omit<SessionType, 'accessToken' | 'refreshToken'> | null | undefined;
	onMount(() => {
		console.log(user);
		console.log($page);
	});

	let currentOrg = user?.orgs.find((org) => org.id === $page.params.id);

	page.subscribe(() => {
		currentOrg = user?.orgs.find((org) => org.id === $page.params.id);
	});
	$: currentOrg, console.log(currentOrg);
	const handleLogout = () => {
		fetch('/api/auth/logout', {
			method: 'POST'
		}).then(() =>
			goto('/', {
				invalidateAll: true
			})
		);
	};

	function truncateString(input: string): string {
		if (input.length <= 20) {
			return input;
		}

		return input.length > 37
			? input.slice(0, 17) + '...' + input.slice(-3)
			: input.slice(0, 17) + '...';
	}

	const username = formatName(user?.firstName ?? null, user?.lastName ?? null);
</script>

<ModeWatcher />
<!-- ========== HEADER ========== -->
<header
	class="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full border-b text-sm py-2.5 sm:py-4"
>
	<nav
		class=" flex basis-full items-center w-full mx-auto px-4 sm:px-6 lg:px-8"
		aria-label="Global"
	>
		<div class="w-full flex items-end">
			{#if !currentOrg}
				<img src="/logo.svg" class="w-8 h-8" alt="Logo" />
				<a class="flex-none text-xl font-semibold dark:text-white d" href="/" aria-label="Jonze"
					>Jonze
				</a>
			{:else}
				<a
					class="flex items-center gap-2 text-xl font-semibold dark:text-white"
					href={`/org/${currentOrg.id}`}
					aria-label="Jonze"
					>{currentOrg.name}
					{#if currentOrg.plan === 'plus'}
						<Badge class="h-4">Plus</Badge>
					{/if}
				</a>
			{/if}
		</div>

		<DropdownMenu.Root closeOnItemClick={false}>
			<DropdownMenu.Trigger asChild let:builder>
				<Button class="md:hidden" builders={[builder]} variant="outline" size="icon">
					<Menu class="h-4 w-4" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item href="/pricing">Pricing</DropdownMenu.Item>
				<DropdownMenu.Item href="https://docs.jonze.co">Docs</DropdownMenu.Item>
				<DropdownMenu.Item href="/roadmap">Roadmap</DropdownMenu.Item>
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>Theme</DropdownMenu.SubTrigger>
					<DropdownMenu.SubContent align="start" side="left">
						<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
				{#if !user}
					<DropdownMenu.Item href="/api/auth">Log In / Sign Up</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		{#if user}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button
						variant="ghost"
						builders={[builder]}
						class={cn('relative h-8 w-8 ml-3 rounded-full block md:hidden')}
					>
						<Avatar.Root>
							<Avatar.Image src={user?.profilePictureUrl} alt="@shadcn" />
							<Avatar.Fallback>{getInitials(username)}</Avatar.Fallback>
						</Avatar.Root>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56 ml-5" align="end">
					<DropdownMenu.Label class="font-normal">
						<div class="flex flex-col space-y-1">
							<p class="text-sm font-medium leading-none">{username}</p>
							<p class="text-xs leading-none text-muted-foreground">{user.email}</p>
						</div>
					</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<UserPlus class="mr-2 h-4 w-4" />
								<span>Teams</span>
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{#each user.orgs as org}
									<a href={`/org/${org.id}`} data-sveltekit-preload-data="tap">
										<DropdownMenu.CheckboxItem id={org.id} checked={org.id === $page.params?.id}>
											{org.name}
										</DropdownMenu.CheckboxItem>
									</a>
								{/each}

								<DropdownMenu.Item href="/org/create">
									<PlusCircle class="mr-2 h-4 w-4" />
									<span>New Org</span>
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />

					<DropdownMenu.Item on:click={() => handleLogout()}>
						Log out
						<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}{/if}

		<div class="w-full items-center justify-end ms-auto sm:gap-x-3 sm:order-3 hidden md:flex">
			<div class="flex flex-row items-center justify-end gap-2">
				<div class="flex flex-row items-center justify-end gap-2">
					<Button variant="ghost" href="/pricing" class="text-zinc-800 dark:text-zinc-100 p-2">
						Pricing
					</Button>
					<Button
						variant="ghost"
						href="https://docs.jonze.co"
						class="text-zinc-800 dark:text-zinc-100 p-2"
					>
						Docs
					</Button>
					<Button variant="ghost" href="/roadmap" class="text-zinc-800 dark:text-zinc-100 p-2">
						Roadmap
					</Button>

					<DropdownMenu.Root closeOnItemClick={false}>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]} variant="outline" size="icon">
								<Sun
									class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
								/>
								<Moon
									class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
								/>
								<span class="sr-only">Toggle theme</span>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>

				{#if user}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
								<Avatar.Root>
									<Avatar.Image src={user?.profilePictureUrl} alt="@shadcn" />
									<Avatar.Fallback>{getInitials(username)}</Avatar.Fallback>
								</Avatar.Root>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<DropdownMenu.Label class="font-normal">
								<div class="flex flex-col space-y-1">
									<p class="text-sm font-medium leading-none">{username}</p>
									<p class="text-xs leading-none text-muted-foreground">{user.email}</p>
								</div>
							</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger>
										<UserPlus class="mr-2 h-4 w-4" />
										<span>Teams</span>
									</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent>
										{#each user.orgs as org}
											<a href={`/org/${org.id}`} data-sveltekit-preload-data="tap">
												<DropdownMenu.CheckboxItem
													id={org.id}
													checked={org.id === $page.params?.id}
												>
													<Tooltip.Root>
														<Tooltip.Trigger class="w-full text-left"
															>{truncateString(org.name)}
															{#if org.plan === 'plus'}
																<Badge class="text-xs h-4">Plus</Badge>
															{/if}
														</Tooltip.Trigger>
														{#if org.name.length > 20}
															<Tooltip.Content>
																<p>{org.name}</p>
															</Tooltip.Content>
														{/if}
													</Tooltip.Root>
												</DropdownMenu.CheckboxItem>
											</a>
										{/each}

										<DropdownMenu.Item href="/org/create">
											<PlusCircle class="mr-2 h-4 w-4" />
											<span>New Org</span>
										</DropdownMenu.Item>
									</DropdownMenu.SubContent>
								</DropdownMenu.Sub>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />

							<DropdownMenu.Item on:click={() => handleLogout()}>
								Log out
								<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Button variant="secondary" class="gap-2" href="/api/auth">Log In</Button>
					<Button class="gap-2" href="/api/auth">Sign Up</Button>
				{/if}
			</div>
		</div>
	</nav>
</header>
<!-- ========== END HEADER ========== -->
<slot />
