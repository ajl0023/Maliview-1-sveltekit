<script>
	import { getContext } from 'svelte';
	import CarouselRenders from '../CarouselRenders/CarouselRenders.svelte';
	import ContactUs from '../ContactUs/ContactUs.svelte';
	import Credits from '../Credits/Credits.svelte';
	import GalleryPreview from '../GalleryPreview/GalleryPreview.svelte';

	import TextPage from '../TextPage/TextPage.svelte';

	import ImagePage from '../ImagePage/ImagePage.svelte';
	import { setContext } from 'svelte';

	export let leftPage;
	export let carouselPage;

	const pageLayout = getContext('pageLayout'); //these are the pages that are being passed in from the parent component, and contain the data for the page
	const pageContent = getContext('pageContent');

	const page_side = setContext('page_side', 'left'); //this is the page side that is being passed in from the parent component, and is used to determine which page to display
</script>

<div bind:this="{leftPage}" class="container">
	<div id="home" class="logo-wrapper">
		<div class="bg-image-container">
			<img class="bg-image" src="/images/horse-left.jpg" alt="" />
		</div>
		<div class="logo-container">
			<img class="image-logo" src="/images/Maliview Left.png" alt="" />
		</div>
	</div>

	<ImagePage image="{pageLayout['image-pages'][0]}" name="malibu" />
	<TextPage name="discover" bgColor="{true}" text_content="{pageContent.textPages[1]}" />
	<CarouselRenders
		name="renders"
		renders="{{
			images: pageLayout['carousel-renders'][0].left,
			thumbs: pageLayout['carousel-renders'][0].thumbs.slice(
				0,
				pageLayout['carousel-renders'][0].thumbs.length / 2
			)
		}}"
	/>

	<TextPage name="floorplans" bgColor="{true}" text_content="{pageContent.textPages[2]}" />

	<ImagePage image="{pageLayout['image-pages'][1]}" name="equestrian" index="{2}" />

	<TextPage name="video render" bgColor="{true}" text_content="{pageContent.textPages[5]}" />

	<GalleryPreview name="behind the scenes" />

	<TextPage bgColor="{false}" text_content="{pageContent.textPages[7]}" name="drone footage" />
	<Credits />
	<div class="page">
		<ContactUs />
	</div>
</div>

<style lang="scss">
	.bg-image-container {
		width: 100%;
		height: 100%;
		position: absolute;
		z-index: 1;
		.bg-image {
			width: 100%;
			height: 100%;
		}
	}
	.container {
		position: relative;
		align-items: center;

		transition: all 1s ease-out;
		height: 100vh;
		max-width: 50vw;
		width: 100%;
		.logo-wrapper {
			width: 50vw;
			height: 100vh;

			display: flex;
			align-items: center;
			justify-content: flex-end;
			z-index: 2;
			position: relative;
			.logo-container {
				max-width: 33%;
				z-index: 3;
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
