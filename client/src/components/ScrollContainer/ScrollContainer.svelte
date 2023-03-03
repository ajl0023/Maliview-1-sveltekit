<script>
	import { onMount } from 'svelte';
	import { pagePositions } from '../../stores';
	import LeftContainer from '../LeftContainer/LeftContainer.svelte';
	import RightContainer from '../RightContainer/RightContainer.svelte';
	export let pageLayout;
	let leftPage;
	let rightPage;

	let leftElement;
	let rightElement;

	onMount(() => {
		// console.log(213123);
		console.log(leftPage);
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
		if (leftElement && rightElement && $pagePositions.inital) {
			leftElement.style.transform = `translateY( ${$pagePositions.left}vh)`;
			rightElement.style.transform = `translateY( ${$pagePositions.right}vh)`;
		}
	}
</script>

<div class="scroll-container" on:wheel="{handleScrollAnimation}">
	<LeftContainer pageLayout="{pageLayout}" bind:this="{leftPage}" />

	<RightContainer bind:this="{rightPage}" />
</div>

<style lang="scss">
	:global {
		.page {
			width: 50vw;
			height: 100vh;

			overflow: hidden;
		}
	}
</style>
