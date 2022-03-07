<script>
	import { onMount } from 'svelte';
	import Logo from '../../images/svgs/Logo/Logo.svelte';
	import { textPages } from '../../pageContent';
	import { scrollContainers } from '../../stores';
	export let index;
	export let bgColor;
	let scrollContainer;
</script>

<div style="background-color: {bgColor};" class="page container">
	<div class="text-content">
		<div class="bu-content bu-is-large">
			<h3 class="header bu-content-header ">
				{textPages[index].header}
			</h3>
		</div>
		<div
			on:mousewheel="{(e) => {
				if (e.currentTarget.scrollHeight > e.currentTarget.clientHeight) {
					e.stopPropagation();
				}
			}}"
			class="bu-content text-container"
		>
			<div bind:this="{scrollContainer}" class="scroll-container-text">
				<div class="text-p-container">
					{#each textPages[index].paragraphs as text, i}
						<p key="{i}" class="$1">
							{text}
						</p>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.container {
		margin: auto;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		height: 100%;
		@media (max-width: 1400px) {
			padding: 30px;
			max-width: 100%;
			.text-content {
				width: 100%;
				max-width: 100%;
			}
		}
		.header {
			text-transform: uppercase;
			color: white;
		}
		@media (max-width: 650px) {
			width: 100%;
			height: 100%;
			display: none;
		}
		@media (max-width: 950px) {
			.text-content {
				padding-top: 67px;
			}
		}
	}
	.text-content {
		max-width: 50%;
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
		.text-container {
			height: 100%;
			overflow: auto;
			&::-webkit-scrollbar {
				width: 20px;
			}
			&::-webkit-scrollbar-track {
				background-color: transparent;
			}
			&::-webkit-scrollbar-thumb {
				background-color: #d6dee1;
				border-radius: 20px;
				border: 6px solid transparent;
				background-clip: content-box;
			}
		}
	}
</style>
