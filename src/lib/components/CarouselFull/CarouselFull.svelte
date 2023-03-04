<script>
	import Glide from '@glidejs/glide';

	import { onMount } from 'svelte';
	import Arrow from '$lib/svgs/Arrow.svelte';

	let glider;
	export let name;
	export let page;
	export let orient;
	export let itemInd;
	export let data;
	const images = data['images'];
	const halfCarousel = {};
	let glide;
	let glideIndex = 0;
	onMount(() => {
		glide = new Glide(glider);
		glide.mount();
		glide.on('run', function () {
			glideIndex = glide.index;
		});
	});
</script>

<div class="page">
	<div class="indicator {page}">
		{#if glide}
			<p>
				{glideIndex + 1}/{orient === 'half' ? halfCarousel[name].length : images.length}
			</p>
		{/if}
	</div>
	<div bind:this="{glider}" class="glide">
		<div class="glide__track" data-glide-el="track">
			<ul class="glide__slides">
				{#each images as img, i}
					<li class="glide__slide">
						<div class="image-container">
							{#if img.url}
								<img class="carousel-image lazy" src="{img.url}" alt="" />
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<div class="glide__arrows" data-glide-el="controls">
			<button class="glide__arrow page-arrow-container glide__arrow--left" data-glide-dir="<">
				<div class="page-arrow-relative">
					<Arrow
						styleP="object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
					/>
				</div></button
			>
			<button class="glide__arrow  page-arrow-container glide__arrow--right" data-glide-dir=">">
				<div class="page-arrow-relative">
					<Arrow
						styleP="object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
					/>
				</div>
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.page {
		position: relative;
	}
	.left {
		right: 5px;
	}
	.right {
		left: 5px;
	}
	.indicator {
		top: 5px;

		z-index: 4;
		font-weight: 600;
		text-align: center;
		letter-spacing: 0.2em;

		position: absolute;
		padding: 5px 15px;
		border-radius: 14px;
		background-color: black;
		color: white;
		display: flex;
		justify-content: center;
		p {
			margin-right: -0.2em;
		}
	}
	.glide__arrow--right {
		right: 20px;
		transform: rotate(180deg);
	}
	.glide__arrow--left {
		left: 20px;
	}
	.page-arrow-container {
		width: 30px;
		height: 30px;
		position: absolute;

		bottom: 0;
		top: 50%;
		border-radius: 50%;
		background-color: rgba(0 0 0 / 0.5);
		border: none;
		overflow: hidden;

		.page-arrow-relative {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;

			right: 0;
			padding: 5px;
			margin: auto;
		}
	}

	.glide__slides {
		height: 100%;
		display: flex;

		justify-content: center;
	}

	.glide__slide {
		display: flex;
		justify-content: center;
	}
	.glide__arrows {
		position: absolute;
		left: 0;
		margin: auto;
		top: 0;
		bottom: 0;
		right: 0;
		width: 100%;
	}
	.glide {
		height: 100%;
		.glide__track {
			height: 100%;
			.image-container {
				width: 100%;
				img {
					width: 100%;
					object-fit: cover;
					height: 100%;
					object-position: center center;
				}
			}
		}
	}
</style>
