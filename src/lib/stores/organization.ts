import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const currentOrg = writable(browser && localStorage.getItem('org'));
currentOrg.subscribe((val) => {
	if (browser) return (localStorage.userId = val);
});
