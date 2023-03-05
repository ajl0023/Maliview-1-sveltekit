<script>
	export let header;
</script>

<div class="container bu-media">
	<div class="bu-media-left">
		<figure class="bu-image">
			<img src="/images/mobile-logo.png" alt="" />
		</figure>
	</div>

	<h5 class="title is-4 font-white">
		{header}
	</h5>
</div>

<style lang="scss">
	img {
		max-width: 50px;

		object-fit: contain;
	}
	.container {
		align-items: center;
	}
	h5 {
		font-family: Orator;
	}
	.font-white {
		color: white;
	}
</style>
