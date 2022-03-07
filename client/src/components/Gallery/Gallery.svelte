<script>
	import GallerySelected from './GallerySelected.svelte';
	import { galleryImg } from '../GalleryPreview/store';
	import GalleryImage from '../GalleryImage/GalleryImage.svelte';

	import { pageLayout } from '../../stores';

	let selected;
	const images = pageLayout.bts;
	const selectImage = (i) => {
		galleryImg.update((s) => {
			s.index = i;
			return s;
		});
	};
</script>

<div
	on:mousewheel="{(e) => {
		e.stopPropagation();
	}}"
	class="page"
>
	<div class="phase-label-container">
		{#each images as phase, i}
			<h5
				on:click="{() => {
					galleryImg.update((s) => {
						s.currPhase = i;
						s.index = 0;
						return s;
					});
				}}"
				class:phase-label="{i === $galleryImg.currPhase}"
			>
				phase {i + 1}
			</h5>
		{/each}
	</div>
	<div class="flex-container {$galleryImg.currPhase}">
		{#each images[$galleryImg.currPhase].images as img, i}
			<GallerySelected img="{img}" selected="{selected}" index="{i}" />
		{/each}
		{#if $galleryImg.currPhase === 'phase-1'}
			<!-- <iframe
        class="video-modal"
        width="100%"
        src="https://www.youtube.com/embed/nTS10ZQM5Ms"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      /> -->
		{/if}
	</div>
</div>

<style lang="scss">
	.flex-column {
		display: flex;
		width: 100%;
		gap: 5px;
		flex-direction: column;
		&:nth-child(3) {
			.image-container {
				max-height: calc(100% / 5);
			}
		}
	}

	.flex-container {
		width: 100%;
		height: 100%;
		gap: 5px;
		display: flex;
		flex-wrap: wrap;
		overflow: auto;
	}

	.phase-label-container {
		color: white;
		display: flex;
		gap: 10px;
		align-items: center;
		padding: 0.5rem;
		font-family: Orator;

		h5 {
			width: fit-content;
			position: relative;
			cursor: pointer;
		}

		.phase-label::after {
			content: '';
			display: block;
			width: 100%;
			height: 1px;

			background-color: white;
		}
	}
</style>
