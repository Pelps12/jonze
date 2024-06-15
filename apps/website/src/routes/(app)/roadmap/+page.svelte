<script>
	import { Button } from '$lib/components/ui/button';
</script>

<section class="w-full py-3 md:py-6 lg:py-9">
	<div class="container px-4 md:px-6">
		<div class="flex flex-col items-center justify-center space-y-4 text-center">
			<div class="space-y-2">
				<div class="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
					Roadmap
				</div>
				<h2 class="text-3xl font-bold tracking-tighter sm:text-5xl">
					Upcoming Features and Improvements
				</h2>
				<p class="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
					Stay up-to-date with our roadmap and see what's coming next for Jonze
				</p>
			</div>
		</div>
		<div class="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:gap-12 justify-center">
			<div class="relative flex flex-col gap-6">
				<div class="grid gap-4">
					<div class="grid grid-cols-[30px_1fr] gap-4">
						<div class="relative flex items-center justify-center">
							<div class="absolute h-full w-px bg-gray-300 dark:bg-gray-700"></div>
							<div class="aspect-square w-5 rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
						<div>
							<h3 class="text-xl font-bold">Event Tagging</h3>
							<p class="">
								Enable event tags (e.g. #social, #gbm, #collab) for events so as to filter them by
								those tags.
							</p>
							<div class="flex items-center gap-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-4 w-4"
								>
									<path d="M8 2v4"></path>
									<path d="M16 2v4"></path>
									<rect width="18" height="18" x="3" y="4" rx="2"></rect>
									<path d="M3 10h18"></path>
								</svg>
								<span>Q3 2024</span>
							</div>
						</div>
					</div>
					<div class="grid grid-cols-[30px_1fr] gap-4">
						<div class="relative flex items-center justify-center">
							<div class="absolute h-full w-px bg-gray-300 dark:bg-gray-700"></div>
							<div class="aspect-square w-5 rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
						<div>
							<h3 class="text-xl font-bold">Bulk Data Import/Export</h3>
							<p class=" ">
								Streamline member data management with bulk import and export capabilities.
							</p>
							<div class="flex items-center gap-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-4 w-4"
								>
									<path d="M8 2v4"></path>
									<path d="M16 2v4"></path>
									<rect width="18" height="18" x="3" y="4" rx="2"></rect>
									<path d="M3 10h18"></path>
								</svg>
								<span>Q3 2024</span>
							</div>
						</div>
					</div>
					<div class="grid grid-cols-[30px_1fr] gap-4">
						<div class="relative flex items-center justify-center">
							<div class="absolute h-full w-px bg-gray-300 dark:bg-gray-700"></div>
							<div class="aspect-square w-5 rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
						<div>
							<h3 class="text-xl font-bold">Org Profile Enhancements</h3>
							<p class="">
								Improve organization customization through org logos and custom themes.
							</p>
							<div class="flex items-center gap-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-4 w-4"
								>
									<path d="M8 2v4"></path>
									<path d="M16 2v4"></path>
									<rect width="18" height="18" x="3" y="4" rx="2"></rect>
									<path d="M3 10h18"></path>
								</svg>
								<span>Q3 2024</span>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-[30px_1fr] gap-4">
						<div class="relative flex items-center justify-center">
							<div class="absolute h-full w-px bg-gray-300 dark:bg-gray-700"></div>
							<div class="aspect-square w-5 rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
						<div>
							<h3 class="text-xl font-bold">Out-of-The-Box Integrations</h3>
							<p class="">
								Enhance member engagement with connections to tools such as SendGrid, Discord,
								SquareSpace.
							</p>
							<div class="flex items-center gap-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-4 w-4"
								>
									<path d="M8 2v4"></path>
									<path d="M16 2v4"></path>
									<rect width="18" height="18" x="3" y="4" rx="2"></rect>
									<path d="M3 10h18"></path>
								</svg>
								<span>Q4 2024</span>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-[30px_1fr] gap-4">
						<div class="relative flex items-center justify-center">
							<div class="absolute h-full w-px bg-gray-300 dark:bg-gray-700"></div>
							<div class="aspect-square w-5 rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
						<div>
							<h3 class="text-xl font-bold">Advanced Reporting and Analytics</h3>
							<p class="">
								Gain deeper insights into your member data with advanced reporting and analytics
								tools.
							</p>
							<div class="flex items-center gap-2 text-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-4 w-4"
								>
									<path d="M8 2v4"></path>
									<path d="M16 2v4"></path>
									<rect width="18" height="18" x="3" y="4" rx="2"></rect>
									<path d="M3 10h18"></path>
								</svg>
								<span>Q4 2024</span>
							</div>
						</div>
					</div>
				</div>
				<div class="absolute inset-y-0 left-[15px] w-px bg-gray-300 dark:bg-gray-700"></div>
			</div>
			<!-- 			<div class="flex flex-col justify-center space-y-4">
				<div class="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
					Progress
				</div>
				<div class="grid gap-4">
					<div>
						<h3 class="text-xl font-bold">Bulk Data Import/Export</h3>

						<div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
							<div class="h-full w-[60%] rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
					</div>
					<div>
						<h3 class="text-xl font-bold">Org Profile Enhancements</h3>
						<div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
							<div class="h-full w-[30%] rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
					</div>
					<div>
						<h3 class="text-xl font-bold">Out-of-The-Box Integrations</h3>
						<div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
							<div class="h-full w-[10%] rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
					</div>
					<div>
						<h3 class="text-xl font-bold">Advanced Reporting and Analytics</h3>
						<div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
							<div class="h-full w-[5%] rounded-full bg-gray-900 dark:bg-gray-50"></div>
						</div>
					</div>
				</div>
			</div> -->
		</div>
	</div>
</section>

<section class="w-full py-3 md:py-264 lg:py-9">
	<div class="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
		<div class="space-y-3">
			<h2 class="text-3xl font-bold tracking-tighter md:text-4xl/tight">
				Take Your Member Data Management to the Next Level
			</h2>
			<p class="mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
				Join our Discord community to stay up-to-date with frequent updates on our Jonze platform.
			</p>
		</div>
		<div class="mx-auto w-full max-w-sm space-y-2">
			<Button href="https://discord.gg/f9gecBpHJ5">Discord</Button>

			<p class="text-xs">
				By signing up, you agree to our{' '}
				<Button variant="link" href="#" class="underline underline-offset-2 px-0">
					Terms &amp; Conditions
				</Button>
			</p>
		</div>
	</div>
</section>
