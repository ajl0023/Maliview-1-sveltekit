<script>
	import { modal, pageLayout } from '../../stores';
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import { lazy } from '../../lazy.js';

	export let imageInd;
	const images = [...pageLayout['image-pages']];
</script>

<div
	on:click="{() => {
		if (images[imageInd].type === 'video') {
			$modal.content = images[imageInd].video_url;
			$modal.type = 'video';
			$modal.visibility = true;
		}
	}}"
	class="page"
>
	<div class="image-container {images[imageInd].type === 'video' ? 'blur' : ''} ">
		{#if images[imageInd].type === 'video'}
			<img alt="" src="playButton.png" class="play-button" />
		{/if}

		<img data-src="{images[imageInd].image.url}" alt="" class="main-image lazy" />
	</div>
</div>

<style lang="scss">
	.blur {
		left: 0;
		right: 0;
		z-index: 0;
		position: relative;
		cursor: pointer;
		&::before {
			pointer-events: none;
			position: absolute;
			content: '';
			height: 100%;
			display: block;
			left: 0;
			right: 0;
			top: 0;

			@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
				background: rgba(0, 0, 0, 0.5);
			}

			-webkit-backdrop-filter: blur(5px);
			backdrop-filter: blur(5px);
		}
	}
	.image-container {
		height: 100%;
		.main-image {
			width: 100%;
			object-fit: cover;
			height: 100%;
		}
	}
	.play-button {
		position: absolute;
		width: 160px;
		position: absolute;
		top: 50%; /* position the top  edge of the element at the middle of the parent */
		left: 50%; /* position the left edge of the element at the middle of the parent */

		transform: translate(-50%, -50%);
		height: auto;
		z-index: 5;
		object-fit: cover;
	}
</style>
