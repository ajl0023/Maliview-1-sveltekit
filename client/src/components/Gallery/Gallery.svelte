<script>
  import { galleryImg } from "../../stores";
  import GalleryImage from "../GalleryImage/GalleryImage.svelte";

  let selected;
  const images = [
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/2021.05.29_roof_2_ontfwx.jpg",

    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Amit_and_Russel_m0lcjt.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Bike_frqokt.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Framing_d7ovrn.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/Humming_Bird_vgziao.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/circle_window_with_pendant_light_fbnnsd.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/dining_room_discussion_wyhfjh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/electrical_2_hzrwdq.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/electrical_discussion_fzgod7.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879412/gallery/framing_discussion_skcuns.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_2_mqzixc.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_3_wwredc.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630879411/gallery/kitchen_discussion_ynx88u.jpg",
  ];
  const selectImage = (i) => {
    galleryImg.set(i);
    selected = $galleryImg;
  };
</script>

<div class="page">
  <div class="grid-container">
    {#each images as img, i}
      <svelte:component this={GalleryImage}>
        <div
          class="grid-image-container {selected === i ? 'overlay-image' : ''}"
          index={i}
        >
          <img
            on:click={() => {
              selectImage(i);
            }}
            loading="lazy"
            src={img}
            alt=""
          />
        </div>
      </svelte:component>
    {/each}
    <iframe
      class="video-modal"
      width="100%"
      src="https://www.youtube.com/embed/nTS10ZQM5Ms"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  </div>
</div>

<style lang="scss">
  .overlay-image {
    position: relative;
    border: 1px solid white;
    &::before {
      z-index: 2;
      content: "";
      height: 100%;
      width: 100%;
      position: absolute;
      display: block;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  .grid-container {
    display: grid;
    height: 100%;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(20, minmax(calc(100% / 4), 1fr));
    gap: 5px;

    .grid-image-container:nth-child(n + 2):nth-child(-n + 5) {
      grid-column: span 1;
      grid-row: span 1;
    }
    .grid-image-container:nth-child(8) {
      grid-column: span 4;
      grid-row: span 1;
    }
    .grid-image-container:nth-child(12) {
      grid-column: span 4;
      grid-row: span 1;
    }
    .grid-image-container {
      grid-column: span 3;
      grid-row: span 1;
      overflow: hidden;
      width: 100%;
      img {
        object-fit: cover;
      }
    }
    iframe {
      grid-column-end: span 7;
      height: 100%;
    }
  }
  .overlay-image {
    position: relative;
    &::before {
      z-index: 2;
      content: "";
      height: 100%;
      width: 100%;
      position: absolute;
      display: block;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
  img {
    width: 100%;
    height: 100%;
  }
</style>
