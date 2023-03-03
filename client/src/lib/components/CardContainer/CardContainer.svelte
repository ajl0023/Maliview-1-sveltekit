<!-- <script>
	import { onMount } from 'svelte';

	import Card from '../Card/Card.svelte';
	import CardCarousel from '../CardCarousel/CardCarousel.svelte';
	import CardCredits from '../CardCredits/CardCredits.svelte';
	import CardGallery from '../CardGallery/CardGallery.svelte';
	import ContactUs from '../ContactUs/ContactUs.svelte';
	import _ from 'lodash';
	import { pageLayout } from '../../stores';
	let cardLayout = [];
	onMount(async () => {
		cardLayout = pageLayout['mobile'].sort((a, b) => {
			return a.order - b.order;
		});
	});
</script>

<div class="card-wrapper">
	<div class="bg-image-container">
		<img class="bg-image" src="horses.jpg" alt="" />
	</div>
	<div id="home" class="logo-wrapper">
		<div class="logo-container">
			<img class="image-logo" src="homeLogo.png" alt="" />
		</div>
	</div>
	<div class="card-container">
		{#each cardLayout as card, i}
			{#if cardLayout[i].type === 'bg-pages' || cardLayout[i].type === 'video'}
				<Card
					type="{card.type}"
					image="{card.images.filter((item) => {
						return item.url;
					})[0]}"
					page="{card}"
					index="{i}"
				/>
			{:else if cardLayout[i].type === 'behind-the-scenes'}
				<CardGallery data="{card}" />
			{:else}
				<CardCarousel
					images="{card.images.filter((item) => {
						return item.url;
					})}"
					page="{card}"
					index="{i}"
				/>
			{/if}
		{/each}
		<CardCredits />
		<div id="contact" class="contact-us-container">
			<ContactUs />
		</div>
	</div>
</div>

<style lang="scss">
	.bg-image-container {
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
		.bg-image {
			width: 100%;
			object-fit: cover;
			height: 100%;
		}
	}
	.contact-us-container {
		width: 100%;
		padding: 30px;
		height: 100vh;
	}
	.card-container {
		position: relative;
		background-color: #2c2a2b;
	}
	.logo-wrapper {
		z-index: 2;
		position: relative;
		width: 100vw;
		height: 100vh;

		display: flex;

		justify-content: center;
		align-items: center;
		.logo-container {
			max-width: 55%;
			.image-logo {
				object-fit: contain;

				width: 100%;
			}
		}
	}
</style> -->
