<script>
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	import { navToLink, textPages } from '../../pageContent';
	import { modal } from '../../stores';
	import Arrow from '$lib/svgs/Arrow.svelte';
	import Logo from '$lib/svgs/Logo/Logo.svelte';

	export let index;
	export let image;
	export let type;
	export let page;
	let showMore = false;
	let mainText;
	let overFlowing;

	function checkOverFlow() {
		if (mainText.scrollHeight > mainText.clientHeight) {
			overFlowing = true;
		} else {
			overFlowing = false;
		}
	}
	onMount(() => {
		if (browser) {
			window.addEventListener('resize', checkOverFlow);
		}

		checkOverFlow();
	});
	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', checkOverFlow);
		}
	});
</script>

<div class="bu-card card-container">
	<div class="bu-card-image" class:video="{type === 'video'}">
		<figure
			on:click="{() => {
				if (type === 'video') {
					$modal.visibility = true;
					$modal.content = page.video_url;
					$modal.type = 'video';
				}
			}}"
			on:keydown="{(event) => {
				if (event.key === 'Enter') {
					if (type === 'video') {
						$modal.visibility = true;
						$modal.content = page.video_url;
						$modal.type = 'video';
					}
				}
			}}"
			class="bu-image bu-is-4by3 {type === 'video' ? 'blur' : ''}"
		>
			{#if type === 'video'}
				<div class="play-button-container">
					<figure class="bu-image bu-is-square ">
						<img src="/images/playButton.png" alt="" />
					</figure>
				</div>
			{/if}
			<img class="main-image lazy" data-src="/images/{image.url}" alt="" />
		</figure>
	</div>
	<div class="card-content bu-card-content">
		<div class="bu-media">
			<div class="bu-media-left">
				<figure class="bu-image bu-is-48x48">
					<div class="square-place-holder" style=" height: 100%; width:100%;">
						<img src="/images/mobile-logo.png" alt="" />
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
					{p}
				{/each}
			{/if}
		</div>
		<br />
		{#if overFlowing}
			<div
				on:click="{() => {
					showMore = !showMore;
				}}"
				on:keydown="{(event) => {
					if (event.key === 'Enter') {
						showMore = !showMore;
					}
				}}"
				class="bu-level bu-is-mobile"
			>
				<div class="bu-level-left">
					<p class="bu-level-left bu-level-item">Read More</p>
					<span class="show-more-button bu-level-left bu-level-item bu-icon bu-is-small">
						<Arrow styleP="height:16px; width:16px;" showMore="{showMore}" />
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.show-more-button {
		cursor: pointer;
	}

	.bu-card-image.video {
		cursor: pointer;
	}
	.main-image {
		object-fit: cover;
	}
	h5 {
		font-family: Orator;
	}
	.font-white {
		color: white;
	}
	.square-place-holder {
		width: 100%;

		img {
			width: 100%;

			object-fit: cover;
		}
	}
	.card-content {
		background-color: transparent;
	}
	.play-button-container {
		position: absolute;
		width: 25%;
		top: 50%; /* position the top  edge of the element at the middle of the parent */
		left: 50%; /* position the left edge of the element at the middle of the parent */

		transform: translate(-50%, -50%);
		height: auto;
		z-index: 5;
		object-fit: cover;
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
		&:nth-child(4) {
			.show-more {
				display: none !important;
			}
		}
	}

	.blur {
		left: 0;
		right: 0;
		z-index: 0;
		position: relative;

		&::before {
			pointer-events: none;
			position: absolute;
			content: '';
			height: 100%;
			display: block;
			left: 0;
			right: 0;
			top: 0;
			z-index: 2;

			@supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
				background: rgba(0, 0, 0, 0.5);
			}

			-webkit-backdrop-filter: blur(5px);
			backdrop-filter: blur(5px);
		}
	}
	.show-more {
		display: block;
		max-height: 100%;
	}
</style>
