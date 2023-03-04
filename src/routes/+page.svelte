<script>
	import { onDestroy, onMount } from 'svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';
	import Navbar from '$lib/components/Navbar/Navbar.svelte';
	import { browser, dev } from '$app/environment';
	import Socials from '$lib/components/Socials/Socials.svelte';

	import ScrollContainer from '$lib/components/ScrollContainer/ScrollContainer.svelte';
	import CardContainer from '$lib/components/CardContainer/CardContainer.svelte';

	import axios from 'axios';

	export let data;

	const { data_loaded, pagesData, pageContent } = data;
	let windowThreshHold = false;

	function handleResponsiveResize() {
		if (
			window.innerWidth <= 650 ||
			window.matchMedia('(orientation: portrait)').matches ||
			window.matchMedia('(orientation: landscape)').matches
		) {
			windowThreshHold = true;
		} else {
			windowThreshHold = false;
		}
	}
	onMount(() => {
		handleResponsiveResize();

		window.addEventListener('resize', handleResponsiveResize);
	});
	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', handleResponsiveResize);
		}
	});
</script>

{#if data_loaded}
	<div>
		<!-- <Navbar /> -->

		<!-- <ScrollContainer pageLayout="{pagesData}" pageContent="{pageContent}" /> -->

		<!-- <CardContainer />

		{#if $modal.visibility && $modal.content}
			<Modal />
		{/if}
		<Socials /> -->
	</div>
{/if}

<style lang="scss">
</style>
