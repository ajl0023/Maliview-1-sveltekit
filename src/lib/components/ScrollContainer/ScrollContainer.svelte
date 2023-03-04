<script>
	import { onMount, setContext } from 'svelte';
	import { pagePositions } from '../../stores';
	import LeftContainer from '$lib/components/LeftContainer/LeftContainer.svelte';
	import RightContainer from '$lib/components/RightContainer/RightContainer.svelte';
	import { dev } from '$app/environment';
	export let pageLayout;
	export let pageContent;
	let leftPage;
	let rightPage;

	let leftElement;
	let rightElement;

	setContext('pageLayout', pageLayout);
	setContext('pageContent', pageContent);
	onMount(() => {
		leftElement = leftPage.$$.ctx[0];
		rightElement = rightPage.$$.ctx[0];
	});

	const handleScrollAnimation = (e) => {
		if (window.innerWidth <= 650) {
			return;
		}
		if ($pagePositions.inital === false) {
			$pagePositions.inital = true;
		}

		pagePositions.scrollEve(e);
	};

	$: {
		if (dev && leftElement && rightElement) {
			leftElement.style.transform = `translateY( ${-1000}vh)`;
			rightElement.style.transform = `translateY( ${0}vh)`;
		} else if (leftElement && rightElement && $pagePositions.inital) {
			leftElement.style.transform = `translateY( ${$pagePositions.left}vh)`;
			rightElement.style.transform = `translateY( ${$pagePositions.right}vh)`;
		}
	}
</script>

<div class="scroll-container" on:wheel="{handleScrollAnimation}">
	<LeftContainer bind:this="{leftPage}" />

	<RightContainer bind:this="{rightPage}" />
</div>

<style lang="scss">
	:global(.page) {
		width: 50vw;
		height: 100vh;

		overflow: hidden;
	}
</style>
