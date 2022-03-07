<script>
	import CarouselFull from '../CarouselFull/CarouselFull.svelte';
	import Credits from '../Credits/Credits.svelte';
	import Gallery from '../Gallery/Gallery.svelte';
	import ImagePage from '../ImagePage/ImagePage.svelte';
	import TextPage from '../TextPage/TextPage.svelte';
	import CarouselRenders from './../CarouselRenders/CarouselRenders.svelte';

	export let rightPage;
	export let carouselPage;
</script>

<div bind:this="{rightPage}" class="container">
	<ImagePage imageInd="{2}" index="{5}" />
	<Credits page="right" />
	<ImagePage imageInd="{3}" index="{4}" />
	<Gallery />
	<ImagePage imageInd="{2}" index="{3}" />

	<TextPage index="{4}" />
	<CarouselFull itemInd="{1}" orient="full" page="right" name="floorplans" />
	<CarouselRenders itemIndex="{0}" carouselPage="{carouselPage}" page="right" />

	<CarouselFull itemInd="{0}" orient="full" page="right" name="discover" index="{1}" />
	<TextPage index="{0}" />
	<div class="bg-image-container">
		<img class="bg-image" src="horse-right.jpg" alt="" />
	</div>
	<div class="logo-wrapper">
		<div class="logo-container">
			<img class="image-logo" src="Maliview Right.png" alt="" />
		</div>
	</div>
</div>

<style lang="scss">
	.bg-image-container {
		width: 100%;
		height: 100%;
		position: absolute;
		z-index: 1;
		margin: auto;
		.bg-image {
			width: 100%;
			height: 100%;
		}
	}

	.container {
		position: relative;
		align-items: center;
		transform: translateY(-1000vh);
		transition: all 1s ease-out;
		height: 100vh;
		max-width: 50vw;
		width: 100%;

		.logo-wrapper {
			width: 50vw;
			height: 100vh;

			display: flex;
			align-items: center;
			justify-content: flex-start;
			z-index: 2;
			position: relative;
			.logo-container {
				max-width: 33%;
				.image-logo {
					object-fit: contain;

					width: 100%;
				}
			}
			@media (max-width: 650px) {
				width: 100%;
				max-width: 100%;

				.logo-container {
					max-width: 40%;
					.image-logo {
						width: 100%;
					}
				}
				justify-content: center;
			}
		}
		@media (max-width: 650px) {
			max-width: 100%;
		}
	}
	@media (max-width: 650px) {
		.image-logo {
			display: none;
		}
		.container {
			width: 100vw;
		}
		.container {
			transform: translateY(0) !important;
			justify-content: center;
		}
	}
</style>
