<script>
	import { navButtons, navToLink } from '../../pageContent';
	import { pagePositions } from '$lib/stores';

	let mainInput;
	function triggerScroll(i) {
		$pagePositions.inital = true;
		$pagePositions.left = i * -100;
		$pagePositions.right = 100 * (i - 10);
		$pagePositions.page = i;
		mainInput.checked = false;
	}
</script>

<div>
	<input bind:this="{mainInput}" type="checkbox" id="burger-trigger" class="burger-input" />
	<label for="burger-trigger" class="burger-label">
		<span class="main-trigger-icon-container">
			<i class="main-trigger-icon"></i>
		</span>
	</label>
	<div class="side-menu-container">
		<ul name="list-container" class="side-menu-item-container">
			{#each navButtons as label, i}
				<li
					on:keydown="{(e) => {
						if (e.key === 'Enter') {
							triggerScroll(i);
							window.location.href = '#' + navToLink[i];
						}
					}}"
					on:click="{() => {
						triggerScroll(i);
						window.location.href = '#' + navToLink[i];
					}}"
				>
					{label}
				</li>
			{/each}
		</ul>
		<div class="meet-text-container">
			<a
				class="meet-text"
				target="_blank" rel="noreferrer"
				href="https://www.apeldesign.com/"
			>
				Meet the architect
			</a>
			<div class="arrow-svg-container">
				<!-- <img class="arrow-svg" src="right-arrow.svg" alt="" /> -->
			</div>
		</div>
		<div class="sidebar-logo-container">
			<a
			target="_blank" rel="noreferrer"
				href="https://www.apeldesign.com/"
			>
				<img src="/images/By Apel Design Black.png" alt="" />
			</a>
		</div>
	</div>

	<div
		on:click="{() => {
			mainInput.checked = false;
		}}"
		on:keydown="{(e) => {
			if (e.key === 'Enter') {
				mainInput.checked = false;
			}
		}}"
		data-id="header-mask"
		class="header-mask"
	></div>
</div>

<style lang="scss">
	.arrow-svg-container {
		width: 15px;
		margin-left: 2px;
		margin-top: 2px;
		.arrow-svg {
			width: 100%;
			height: 100%;
			display: block;
		}
	}
	.meet-text-container {
		z-index: 5;
		display: flex;
		align-items: center;

		.meet-text {
			color: black;
			margin-left: 20px;
			text-decoration: underline;
			cursor: pointer;
		}
	}

	@mixin side-menu-container($leftValue) {
		background-color: white;
		height: 100vh;

		bottom: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		transition: all 400ms ease-in-out;
		z-index: 3;
		left: $leftValue;

		position: absolute;
		.side-menu-item-container {
			padding: 40px 8px;
			overflow-y: scroll;
			height: 100%;
			margin-top: 1.5rem;
			&::before {
				content: '';
				height: 100%;
				width: 100%;
				display: block;
				opacity: 30%;
				background-size: 200px;
				z-index: 1;

				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				margin: auto;

				background-repeat: no-repeat;

				background-position: center center;
			}
			&::-webkit-scrollbar {
				display: none;
			}
			li:nth-child(-n + 12) {
				font-size: 23px;
				font-weight: 600;
				display: flex;
				text-transform: uppercase;
				align-items: center;
				z-index: 2;
				position: relative;
				color: black;
				cursor: pointer;
				padding: 20px 110px 20px 20px;

				border-bottom: 1px solid #d0d1d2;
			}
		}
	}

	.burger-label {
		block-size: 18px;
		display: flex;
		justify-content: center;
		cursor: pointer;
		inline-size: 18px;
		font-size: 14px;

		line-height: 21px;

		align-items: center;
		.main-trigger-icon-container {
			position: relative;
			display: block;
			block-size: 18px;
			inline-size: 100%;
			.main-trigger-icon {
				background-color: white;
				inline-size: 100%;
				position: absolute;
				display: block;
				transition: all 300ms ease-in-out;
				block-size: calc(20px / 10);
				top: calc(36% + 2px);

				&:before {
					transition: all 300ms ease-in-out;
					block-size: calc(20px / 10);
					background-color: white;
					content: '';
					top: -5px;
					display: block;
					position: absolute;
					inline-size: 100%;
				}
				&:after {
					transition: all 300ms ease-in-out;
					block-size: calc(20px / 10);
					background-color: white;
					content: '';
					top: 5px;
					display: block;
					position: absolute;
					inline-size: 100%;
				}
			}
		}
	}
	.burger-input {
		opacity: 1;
		display: none;
		&:checked ~ .burger-label {
			z-index: 4;

			.main-trigger-icon {
				transition: all 300ms ease-in-out;
				background-color: transparent;

				&:before {
					top: 0;
					z-index: 4;
					background-color: black;
					transform: rotate(45deg);
					transition: all 300ms ease-in-out;
				}
				&:after {
					top: 0;

					z-index: 4;
					background-color: black;
					transform: rotate(-45deg);
					transition: all 300ms ease-in-out;
				}
			}
		}

		&:checked ~ .side-menu-container {
			@include side-menu-container(0);
		}
		&:checked ~ .header-mask {
			position: fixed;
			block-size: 100vh;
			top: 0;
			left: 0;
			z-index: 2;
			bottom: 0;
			inline-size: 100%;

			// pointer-events: none;
			// cursor: not-allowed;
			background-color: rgba(0, 0, 0, 0.5);
		}
	}

	.side-menu-container {
		position: relative;
		@include side-menu-container(-600px);
	}
	.sidebar-logo-container {
		max-width: 266px;
		margin: auto;
		padding: 30px;
		z-index: 2;
		position: relative;
		img {
			width: 100%;

			object-fit: cover;
		}
	}
</style>
