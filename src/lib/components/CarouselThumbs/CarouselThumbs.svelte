<script>
	import { getContext, onMount } from 'svelte';

	import { currentPage } from '$lib/stores';
	import { createEventDispatcher } from 'svelte';
	export let images;
	export let glideEle;
	let page_side = getContext('page_side');

	const dispatch = createEventDispatcher();

	let imagesToDisplay = images;
</script>

<div
	style="padding:{page_side === 'left' ? '25px 7.5px 0px 0px' : '25px 0px 0px 7.5px'};
    float:{page_side === 'left' ? 'right' : 'left'};
    "
	class="container"
>
	{#each imagesToDisplay as img, i}
		{#if img}
			<div
				on:click="{() => {
					dispatch('carousel-page', img.order);
				}}"
				class:selected="{glideEle && glideEle.index === img.order}"
				class="image-container"
			>
				<img class="lazy" width="200px" height="200px" src="images/{img.url}" alt="" />;
			</div>
		{:else}
			<div style="background-color:black" class="image-container"></div>
		{/if}
	{/each}
</div>

<style lang="scss">
	.selected {
		border: 2px solid white;
	}
	.image-container {
		width: 25px;
		height: 25px;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center center;
		}
	}
	.container {
		display: flex;
	
		margin: -7.5px;
		.image-container {
			margin: 7.5px;
		}
	}
</style>
