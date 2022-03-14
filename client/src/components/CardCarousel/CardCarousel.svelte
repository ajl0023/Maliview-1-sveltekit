<script>
	import { browser } from '$app/env';
	import Glide from '@glidejs/glide';
	import { onDestroy, onMount } from 'svelte';
	import { navToLink, textPages } from '../../pageContent';
	import { DragGesture } from '@use-gesture/vanilla';
	import { spring } from 'svelte/motion';

	import Arrow from '../Card/Arrow.svelte';
	import PinchZoom from '../PinchZoom.svelte';
	export let index;
	export let page;
	export let images;

	let carousel;
	let glide;
	let showMore = false;
	let slider;
	let overFlowing;
	let mainText;
	let shouldDrag = true;
	let glideContainer;
	let currInd = 0;

	let carouselWidth;
	let sliderThresh = 80;

	const xVal = spring(0, { stiffness: 0.1, damping: 0.89 });

	onMount(() => {
		carouselWidth = carousel.offsetWidth * images.length;
		new DragGesture(
			slider,
			({ direction, movement, down }) => {
				if (shouldDrag) {
					xVal.set((carousel.offsetWidth + 10) * currInd * -1 + movement[0]);

					if (!down) {
						if (
							Math.abs(movement[0]) > sliderThresh &&
							currInd === images.length - 1 &&
							movement[0] < 0
						) {
							xVal.set(-currInd * (carousel.offsetWidth + 10));

							return;
						}
						if (Math.abs(movement[0]) > sliderThresh && currInd === 0 && movement[0] > 0) {
							xVal.set(-currInd * (carousel.offsetWidth + 10));

							return;
						}
						if (Math.abs(movement[0]) > sliderThresh) {
							if (movement[0] < -1) {
								currInd += 1;
							} else {
								currInd -= 1;
							}

							xVal.set(-currInd * (carousel.offsetWidth + 10));
						} else {
							xVal.set(-currInd * (carousel.offsetWidth + 10));
						}
					}
				}
			},
			{
				pointer: {
					touch: true
				}
			}
		);
		glide = new Glide(carousel, {
			swipeThreshold: false,
			dragThreshold: false
		});
		glide.mount({
			Resize: function (Glide, Components, Events) {
				return {};
			}
		});
		if (browser) {
			window.addEventListener('resize', resize);
		}

		resize();
		xVal.subscribe((v) => {
			slider.style.transform = `translate(${v}px,0px)`;
		});
	});
	function resize() {
		carouselWidth = carousel.offsetWidth;
		slider.style.width = carousel.offsetWidth * (images.length + 1) * 5 + 'px';
		carousel.style.width = xVal.set(-currInd * (carousel.offsetWidth + 10));
		if (mainText.scrollHeight > mainText.clientHeight) {
			overFlowing = true;
		} else {
			overFlowing = false;
		}
	}

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', resize);
		}
	});

	$: {
		if (glide) {
			if (!shouldDrag) {
				glide.disable();
			} else {
				glide.enable();
			}
		}
	}
	const handleCarousel = (val) => {
		if (currInd === 0 && val === -1) {
			return;
		} else if (currInd === images.length - 1 && val === 1) {
			return;
		} else {
			currInd += val;
			xVal.set(-currInd * (carousel.offsetWidth + 10));
		}
	};
</script>

<div id="{navToLink[index + 2]}" class="bu-card card-container">
	<div class="carousel-container">
		<div bind:this="{carousel}" class="glide">
			<div class="indicator">
				{#if glide}
					<p>
						{currInd + 1}/{images.length}
					</p>
				{/if}
			</div>
			<div class="glide__track" data-glide-el="track">
				<ul bind:this="{slider}" class="glide__slides">
					{#each images as img, i}
						<li
							style="width:{glideContainer ? carouselWidth : ''}px"
							bind:this="{glideContainer}"
							class="glide__slide"
						>
							<div class="glide-image-container">
								<PinchZoom
									on:pinch="{(e) => {
										shouldDrag = !e.detail;
									}}"
									img="{img.url}"
								/>
							</div>
						</li>
					{/each}
				</ul>
			</div>
			<div class="glide__arrows" data-glide-el="controls">
				<button
					class="glide__arrow page-arrow-container glide__arrow--left arrow-left"
					on:click="{() => {
						handleCarousel(-1);
					}}"
				>
					<div class="page-arrow-relative">
						<Arrow
							styleP="object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
						/>
					</div></button
				>
				<button
					on:click="{() => {
						handleCarousel(1);
					}}"
					class="glide__arrow  page-arrow-container glide__arrow--right arrow-right"
				>
					<div class="page-arrow-relative">
						<Arrow
							styleP="object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
						/>
					</div>
				</button>
			</div>
		</div>
	</div>
	<div class="card-content bu-card-content">
		<div class="bu-media">
			<div class="bu-media-left">
				<figure class="bu-image bu-is-48x48">
					<div class="square-place-holder" style=" height: 100%; width:100%;">
						<img src="mobile-logo.png" alt="" />
					</div>
				</figure>
			</div>
			{#if textPages[index]}
				<h5 class="title is-4 font-white">
					{textPages[index].header}
				</h5>
			{/if}
		</div>
		<div
			bind:this="{mainText}"
			class="content bu-is-clipped content font-white {showMore ? 'show-more' : ''}"
		>
			{#if textPages[index]}
				{#each textPages[index].paragraphs as p}
					<p>{p}</p>
				{/each}
			{/if}
		</div>
		<br />
		{#if overFlowing}
			<div
				on:click="{() => {
					showMore = !showMore;
				}}"
				class="bu-level bu-is-mobile"
			>
				<div class="bu-level-left">
					<p class="bu-level-left bu-level-item">Read More</p>
					<span class="bu-level-left bu-level-item bu-icon bu-is-small">
						<Arrow styleP="height:16px; width:16px;" showMore="{showMore}" />
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.page-arrow-container {
		width: 30px;
		height: 30px;
		position: absolute;
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
	.indicator {
		z-index: 3;
		font-weight: 600;
		text-align: center;
		letter-spacing: 0.2em;
		bottom: 5px;
		left: 5px;
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
	.square-place-holder {
		width: 100%;
		height: 100%;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
	h5 {
		font-family: Orator;
	}
	.font-white {
		color: white;
	}
	.card-content {
		background-color: transparent;
	}
	.content {
		max-height: 20rem;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
	}
	.card-container {
		display: flex;
		flex-direction: column;
		background-color: transparent;
	}
	.carousel-container {
		.glide-image-container {
			display: flex;
			padding-bottom: 100%;
			height: 0;
			position: relative;
			justify-content: center;
		}
	}
	.page-arrow-container {
		width: 30px;
		border-radius: 50%;
		position: absolute;
		border: none;
		overflow: hidden;
		height: 30px;
		bottom: 0;
	}
	.arrow-left {
		right: 40px;
		bottom: 5px;
	}

	.show-more {
		display: block;
		max-height: 100%;
	}
	.arrow-right {
		transform: rotate(180deg);
		right: 5px;
		bottom: 5px;
	}
</style>
