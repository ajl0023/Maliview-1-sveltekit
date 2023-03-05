<script>
	import { onMount } from 'svelte';
	import Arrow from '../../svgs/Arrow.svelte';

	export let text;

	let mainText;
	let overFlowing;
	let showMore = false;
	onMount(() => {
		window.addEventListener('resize', checkOverFlow);

		checkOverFlow();
	});
	function checkOverFlow() {
		if (mainText.scrollHeight > mainText.clientHeight) {
			overFlowing = true;
		} else {
			overFlowing = false;
		}
	}
</script>

<svelte:window on:resize="{checkOverFlow}" />
<div class="wrapper">
	<div
		bind:this="{mainText}"
		class="content bu-is-clipped content font-white {showMore ? 'show-more' : ''}"
	>
		{#each text as p}
			{p}
		{/each}
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

<style lang="scss">
	.content {
		max-height: 20rem;
		overflow: hidden;

		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
	}
	.font-white {
		color: white;
	}
	.show-more {
		display: block;
		max-height: 100%;
	}
	.show-more-button {
		cursor: pointer;
	}
</style>
