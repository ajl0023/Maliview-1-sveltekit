<!-- <script>
	import { galleryImg } from './../GalleryPreview/store.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import { pageLayout } from '../../stores.js';

	export let img;
	export let index;

	const dispatch = createEventDispatcher();
	onMount(() => {
		$galleryImg.imageToDisplay = pageLayout['bts'] ? pageLayout['bts'][pageLayout['bts'].length-1].images[0].url : null;
	});
</script>

<div
	class:overlay-image="{$galleryImg.selected === index}"
	class="{$galleryImg.currPhase} image-container"
>
	<img
		on:click="{() => {
			galleryImg.update((s) => {
				$galleryImg.selected = index;
				$galleryImg.imageToDisplay = img.url;
				// s.imageToDisplay = img.raw;
				return s;
			});
			dispatch('select', img.index);
		}}"
		loading="lazy"
		src="{img.url}"
		alt=""
	/>
</div>

<style lang="scss">
	.image-container {
		flex: 30%;
		&:last-child {
			flex-grow: 0;
		}
		img {
			object-fit: cover;
			cursor: pointer;
			width: 100%;
			height: 100%;
		}
	}
	.overlay-image {
		position: relative;
		border: 1px solid white;
		&::before {
			z-index: 2;
			content: '';
			height: 100%;
			width: 100%;
			position: absolute;
			display: block;
			background-color: rgba(0, 0, 0, 0.5);
		}
	}
</style> -->
