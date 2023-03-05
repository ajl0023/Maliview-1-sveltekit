<script>
	import { galleryImg } from './../GalleryPreview/store.js';
	import { createEventDispatcher, onMount } from 'svelte';

	export let img;
	export let index;

	const dispatch = createEventDispatcher();
</script>

<div
	class:overlay-image="{$galleryImg.selected === index}"
	class="{$galleryImg.currPhase} image-container"
>
	<img
		on:click="{() => {
			galleryImg.update((s) => {
				const copy = { ...s };
				copy.selected = index;
				copy.imageToDisplay = img.url;

				return copy;
			});
			dispatch('select', img.index);
		}}"
		on:keydown="{(event) => {
			if (event.key === 'Enter') {
				galleryImg.update((s) => {
					const copy = { ...s };
					copy.selected = index;
					copy.imageToDisplay = img.url;

					return copy;
				});
				dispatch('select', img.index);
			}
		}}"
		class="lazy"
		data-src="images/{img.url}"
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
</style>
