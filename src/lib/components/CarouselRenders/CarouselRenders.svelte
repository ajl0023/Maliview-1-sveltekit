<script>
	import Glide from '@glidejs/glide';
	import { getContext, onMount } from 'svelte';
	import { currentPage } from '../../stores';
	import Arrow from '$lib/svgs/Arrow.svelte';
	import CarouselThumbs from '$lib/components/CarouselThumbs/CarouselThumbs.svelte';

	export let page;
	export let itemIndex;
	export let renders;

	let page_side = getContext('page_side');

	let carousel;
	let glide;

	onMount(() => {
		glide = new Glide(carousel, {
			dragThreshold: false
		});
		glide.mount();
	});

	$: {
		if (glide) {
			glide.go(`=${$currentPage.page}`);
			glide = glide;
		}
	}
</script>

<div class="page">
	<div class="content-container content-container-{page_side}">
		<div class="carousel-content-container carousel-content-container-{page_side}">
			<div class="title-container title-{page_side}">
				<h1>{page_side === 'left' ? 'ren' : 'ders'}</h1>
				<p>
					{page_side === 'left'
						? 'Browse below for interior and ext'
						: 'erior renders of Maliview Estates.'}
				</p>
			</div>
			<div class="carousel-container">
				{#if glide && page_side === 'right'}
					<div class="indicator {page}">
						<p>
							{glide.index + 1}/{renders.images.length}
						</p>
					</div>
				{/if}
				<div bind:this="{carousel}" class="glide ">
					<div class="glide__track" data-glide-el="track">
						<ul class="glide__slides">
							{#each renders.images as img}
								<li class="glide__slide">
									<div class="slide-image-container">
										<img
							
											class="carousel-image lazy"
											data-src="/images/{img.url}"
											alt=""
										/>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<button
					on:click="{() => {
						currentPage.setPage(page_side === 'left' ? -1 : 1);
					}}"
					class="page-arrow-container page-arrow-container-{page_side}"
				>
					<div class="page-arrow-relative page-arrow-relative">
						<Arrow
							styleP="object-fit:cover;width:100%;fill:white; transform:rotate({page_side === 'left'
								? '-90deg'
								: '90deg'}); height:100%; "
						/>
					</div>
				</button>
			</div>

			<CarouselThumbs
				glideEle="{glide}"
				on:carousel-page="{(e) => {
					const page = e.detail;
					currentPage.update((s) => {
						s.page = page;
						return s;
					});
				}}"
				images="{renders.thumbs}"
			/>
		</div>
	</div>
</div>

<style lang="scss">
	.indicator {
		top: 5px;
		z-index: 4;
		font-weight: 600;
		text-align: center;
		letter-spacing: 0.2em;
		right: 5px;
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
	.title-container {
		text-align: right;
		color: white;

		h1 {
			font-size: 3em;
			text-transform: uppercase;
			font-family: Orator;
			color: white;
		}
	}
	.title-left {
		padding: 20px 0 20px 20px;
	}
	.title-right {
		text-align: left;
		padding: 20px 20px 20px 0px;
	}
	.content-container {
		display: flex;
		height: 100vh;

		overflow: hidden;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
	}
	.content-container-left {
		padding: 10px 0 10px 30px;
	}
	.content-container-right {
		padding: 10px 30px 10px 0px;
		align-items: flex-start;
	}
	.carousel-content-container {
		max-width: 38vw;
		width: 100%;
		height: 100%;
		align-items: flex-end;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.carousel-content-container-right {
		align-items: flex-start;
	}
	.slide-image-container {
		position: relative;
		width: 100%;
		height: 100%;

		img {
			position: absolute;
			height: 100%;

			width: 100%;
		}
	}
	.glide__track {
		height: 100%;
	}

	.page-arrow-container {
		width: 30px;
		height: 30px;
		position: absolute;
		left: 10px;
		bottom: 0;
		top: 50%;
		cursor: pointer;
		border-radius: 50%;
		background-color: rgba(0 0 0 / 0.5);
		border: none;
		overflow: hidden;

		.page-arrow-relative {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;

			padding: 5px;
			margin: auto;
		}
	}
	.page-arrow-container-right {
		right: 10px;
		left: auto;
	}

	.glide__slides {
		height: 100%;
	}
	.carousel-container {
		width: 100%;
		height: 70vh;
		display: flex;
		position: relative;
	}
</style>
