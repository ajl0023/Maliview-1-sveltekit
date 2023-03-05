<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { PinchGesture } from '@use-gesture/vanilla';
	export let img;
	let imageElementScale = 1;

	let rangeMaxX = 0;
	let rangeMinX = 0;
	let testEle;
	let testEle2;
	let dx = 0;
	let dy = 0;
	let rangeMaxY = 0;
	let rangeMinY = 0;
	let imageElement;
	let zoomLocation;
	let imageElementWidth;
	let imageElementHeight;

	const minScale = 1;
	const maxScale = 4;
	const dispatch = createEventDispatcher();

	const updateRange = () => {
		const rangeX = Math.max(
			0,
			Math.round(imageElementWidth * imageElementScale) - imageElementWidth
		); // calculates the max value between the scaled image width and the actual image with
		const rangeY = Math.max(
			0,
			Math.round(imageElementHeight * imageElementScale) - imageElementHeight
		);

		rangeMaxX = Math.round(rangeX);
		rangeMinX = Math.round(-rangeMaxX);

		rangeMaxY = Math.round(rangeY);
		rangeMinY = Math.round(-rangeMaxY);
	};
	let pos;
	const updateImage = (deltaX, deltaY, origin) => {
		const imageElementCurrentX = Math.min(Math.max(rangeMinX, deltaX), rangeMaxX) * 2;
		const imageElementCurrentY = Math.min(Math.max(rangeMinY, deltaY), rangeMaxY) * 2;

		const transform = `translate3d(${imageElementCurrentX}px, ${imageElementCurrentY}px, 0) scale(${imageElementScale})`;

		imageElement.style.transform = transform;
		imageElement.style.transformOrigin = `${origin[0]}px ${origin[1] - pos}px`;
		imageElement.style.WebkitTransform = transform;
		imageElement.style.zIndex = '9999';
	};

	const resetImage = () => {
		imageElement.style.transform = '';
		imageElement.style.WebkitTransform = '';
		imageElement.style.zIndex = '';
		imageElement.style.transformOrigin = '';

		rangeMaxX = 0;
		rangeMinX = 0;
		dy = 0;
		dx = 0;
		rangeMaxY = 0;
		rangeMinY = 0;
	};
	let timeout;
	onMount(() => {
		imageElementWidth = imageElement.offsetWidth;
		imageElementHeight = imageElement.offsetHeight;

		new PinchGesture(
			imageElement,
			({
				// [d,a] absolute distance and angle of the two pointers
				origin, // coordinates of the center between the two touch event

				pinching,

				cancel,
				first,
				last,
				movement
			}) => {
				if (timeout) {
					clearTimeout(timeout);
				}
				if (first) {
					pos = imageElement.getBoundingClientRect().top;
					dispatch('pinch', true);

					zoomLocation = origin;
				} else if (last) {
					timeout = setTimeout(() => {
						dispatch('pinch', false);
					}, 200);
				}

				dx = movement[0];
				dy = movement[1];

				imageElementScale = Math.min(Math.max(minScale, movement[0]), maxScale);

				updateRange();
				updateImage(dx, dy, zoomLocation);

				if (!pinching) {
					resetImage();
					cancel();
				}
			},
			{
				pointer: {
					touch: true
				}
			}
		);
	});
</script>

<img
	bind:this="{imageElement}"
	class="carousel-img lazy"
	data-src="{img}"
	draggable="false"
	alt=""
/>

<style lang="scss">
	.b-dot {
		position: absolute;
		width: 20px;
		height: 20px;
		z-index: 123123123123;
		border-radius: 50%;
		top: 0;
		background-color: blue;
	}
	.red-dot {
		position: absolute;
		width: 20px;
		height: 20px;
		z-index: 123123123123;
		border-radius: 50%;
		top: 0;
		background-color: red;
	}
	.carousel-img {
		width: 100%;

		height: 100%;
		position: absolute;

		object-fit: cover;
	}
</style>
