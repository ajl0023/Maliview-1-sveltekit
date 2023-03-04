<script>
	import { onMount } from 'svelte';

	import { lazyLoadInstance } from '$lib/lazy';

	import { currentPage, pageLayout } from '$lib/stores';
	import { createEventDispatcher } from 'svelte';
	export let page;
	const dispatch = createEventDispatcher();
	const images = pageLayout['carousel-renders'][0].thumbs;
	let imagesToDisplay = images
		.map((img, i) => {
			const obj = {
				url: img.url,
				page: i < 7 ? 'left' : 'right',
				index: i
			};
			return obj;
		})
		.filter((img) => {
			return img.page === page;
		});

	onMount(() => {
		lazyLoadInstance();
	});
</script>

<div
	style="padding:{page === 'left' ? '25px 7.5px 0px 0px' : '25px 0px 0px 7.5px'};
    float:{page === 'left' ? 'right' : 'left'};
    "
	class="container"
>
	{#each imagesToDisplay as img, i}
		{#if img}
			<div
				on:click="{() => {
					dispatch('carousel-page', page === 'left' ? i : i + 7);
				}}"
				class:selected="{$currentPage.page === img.index}"
				class="image-container"
			>
				<img class="lazy" width="200px" height="200px" data-src="{img.url}" alt="" />;
			</div>
		{:else}
			<div style="background-color:black" class="image-container"></div>
		{/if}
	{/each}
</div>

<style lang="scss">
	.selected {
		border: 1px solid white;
	}
	.image-container {
		width: 25px;
		height: 25px;
		border-radius: 50%;
		overflow: hidden;

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
