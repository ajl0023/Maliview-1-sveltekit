<script>
	import { onMount } from 'svelte';

	import { creditsContent } from '../../pageContent';
	import { pagePositions, scrollContainers } from '../../stores';

	export let page;
	let scrollContainer;
	const disableWheel = (e) => {
		e.stopImmediatePropagation();
	};
	onMount(() => {
		scrollContainers.push(scrollContainer);
	});
</script>

<div class="page">
	<div
		class="container"
		style="
        justify-content: {page === 'left' ? 'flex-end' : 'flex-start'}
      "
	>
		<div style="align-items:{page === 'left' ? 'flex-end' : 'flex-start'}" class="sub-container">
			<div
				class="title-container"
				style="
        justify-content: {page === 'left' ? 'flex-end' : 'flex-start'}
      "
			>
				{#if page === 'left'}<div class="title-text-container">
						<h5>Developmen</h5>
					</div>
				{:else}<div class="title-text-container">
						<h5>t Credits</h5>
					</div>{/if}
			</div>
			<div
				bind:this={scrollContainer}
				on:scroll={(e) => {
					window.addEventListener('wheel', disableWheel);
					window.removeEventListener('wheel', disableWheel);
				}}
				class="content-container"
			>
				{#if page === 'left'}
					<div class="credits-container-sub">
						{#each creditsContent.slice(0, 2) as credit}
							<div class="credits-container">
								<h5 class="header">{credit.header}</h5>
								{#each credit.paragraphs as p}
									<p>{p}</p>
								{/each}
							</div>
						{/each}
					</div>
				{:else}<div class="credits-container-sub">
						{#each creditsContent.slice(2, 6) as credit}
							<div class="credits-container">
								<h5 class="header">{credit.header}</h5>
								{#each credit.paragraphs as p}
									<p>{p}</p>
								{/each}
							</div>
						{/each}
					</div>{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.container {
		width: 50vw;
		height: 100vh;
		display: flex;
		align-items: center;

		gap: 2rem;
		color: white;
		font-family: Orator;
		overflow: hidden;
	}

	.sub-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.title-container {
		width: 100%;
		height: 15%;
		margin-bottom: 20px;
		display: flex;
		position: relative;

		font-size: 3em;

		img {
			object-fit: contain;
			width: 100%;
		}
	}
	::-webkit-scrollbar {
		width: 20px;
	}

	::-webkit-scrollbar-track {
		background-color: transparent;
	}

	::-webkit-scrollbar-thumb {
		background-color: #d6dee1;
		border-radius: 20px;
		border: 6px solid transparent;
		background-clip: content-box;
	}

	.content-container {
		display: flex;
		overflow-y: auto;
		justify-content: center;
		align-items: center;
		width: fit-content;
		padding: 10px;
		height: 60%;

		.credits-container-sub {
			height: 100%;
		}
		.credits-container {
			font-size: 1.3em;
			opacity: 0;
			text-align: center;
			margin-bottom: 1rem;

			h5 {
				font-size: 1em;
				margin-bottom: 20px;

				@media (max-width: 1040px) {
					margin-bottom: 10px;
					font-size: 0.7em;
				}
			}
			p {
				font-family: 'Roboto', sans-serif;
				font-size: 0.8em;
			}
			@media (max-width: 1270px) {
				p {
					font-size: 0.6em;
				}
			}
		}
	}
</style>
