<script>
	import Glide from '@glidejs/glide';
	import { onMount } from 'svelte';
	import { currentPage, pageLayout } from '../../stores';
	import Arrow from '$lib/svgs/Arrow.svelte';
	import CarouselThumbs from '$lib/components/CarouselThumbs/CarouselThumbs.svelte';

	export let page;
	export let itemIndex;
	const left = pageLayout['carousel-renders'][itemIndex].left.sort((a, b) => {
		return a.order - b.order;
	});

	const right = pageLayout['carousel-renders'][itemIndex].right.sort((a, b) => {
		return a.order - b.order;
	});
	const images = [...left, ...right];

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
		}
	}
</script>

<div class="page">
	<div class="content-container content-container-{page}">
		<div class="carousel-content-container carousel-content-container-{page}">
			<div class="title-container title-{page}">
				<h1>{page === 'left' ? 'ren' : 'ders'}</h1>
				<p>
					{page === 'left'
						? 'Browse below for interior and ext'
						: 'erior renders of Maliview Estates.'}
				</p>
			</div>
			<div class="carousel-container">
				{#if glide && page === 'right'}
					<div class="indicator {page}">
						{#if glide}
							<p>
								{$currentPage.page + 1}/{images.length / 2}
							</p>
						{/if}
					</div>
				{/if}
				<div bind:this="{carousel}" data-glide-dir="{`${$currentPage.page}`}" class="glide ">
					<div class="glide__track" data-glide-el="track">
						<ul class="glide__slides">
							{#each page === 'left' ? left : right as img}
								<li class="glide__slide">
									<div class="slide-image-container">
										<img loading="lazy" class="carousel-image lazy" src="{img.url}" alt="" />
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<button
					on:click="{() => {
						currentPage.setPage(page === 'left' ? -1 : 1);
					}}"
					class="page-arrow-container page-arrow-container-{page}"
				>
					<div class="page-arrow-relative page-arrow-relative">
						<Arrow
							styleP="object-fit:cover;width:100%;fill:white; transform:rotate({page === 'left'
								? '-90deg'
								: '90deg'}); height:100%; "
						/>
					</div>
				</button>
			</div>

			<CarouselThumbs
				on:carousel-page="{(e) => {
					const page = e.detail;
					currentPage.update((s) => {
						s.page = page;
						return s;
					});
				}}"
				page="{page}"
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
