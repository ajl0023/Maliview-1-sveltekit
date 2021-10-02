<script>
	import { highResBts } from '../../pageContent';
	import { modal } from '../../stores';

	const images = [
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/2021.05.29_roof_2_ontfwx.jpg',

		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Amit_and_Russel_m0lcjt.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Bike_frqokt.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Framing_d7ovrn.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Humming_Bird_vgziao.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/circle_window_with_pendant_light_fbnnsd.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/dining_room_discussion_wyhfjh.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/electrical_2_hzrwdq.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/electrical_discussion_fzgod7.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/framing_discussion_skcuns.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_2_mqzixc.jpg',
		'https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_3_wwredc.jpg'
	];
</script>

<div>
	<div id="behind-the-scenes" class="container">
		<div class="bu-title bu-has-text-centered">behind the scenes</div>
		<div class="gallery-container">
			{#each images as image, i}
				<div class="image-container">
					<img
						src={image}
						on:click={() => {
							$modal.visibility = true;
							$modal.content = highResBts[i];
							$modal.type = 'image';
						}}
						loading="lazy"
						alt=""
					/>
				</div>{/each}
		</div>
	</div>
</div>

<style lang="scss">
	@keyframes example {
		0% {
			opacity: 0;
		}

		100% {
			width: 100%;
		}
	}
	.bu-title {
		font-family: Orator;
		color: white;
		font-weight: 200;
	}
	.gallery-container {
		display: grid;
		width: 100%;
		gap: 6px;
		overflow: hidden;
		grid-template-columns: repeat(4, minmax(50px, 1fr));
	}
	.image-container {
		position: relative;
		padding-bottom: 100%;
		img {
			height: 100%;
			object-fit: cover;
			width: 100%;
			border-radius: 4px;
			animation-fill-mode: forwards;
			position: absolute;
		}
	}
	.container {
		overflow: hidden;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		margin-bottom: 20px;
	}
</style>
