<script>
  import { modal } from "../../stores";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { lazy } from "../../lazy.js";
  export let index;
  const images = [
    {
      type: "image",
      url:
        "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg1_lcs2gw.jpg",
    },
    {
      type: "image",
      url:
        "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg2_oyi2w7.jpg",
    },

    {
      type: "image",
      url:
        "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg3_mi7jx9.jpg",
    },
    {
      videoUrl: "https://www.youtube.com/embed/nTS10ZQM5Ms",
      type: "video",
      url:
        "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790318/misc/bgPhotos/bg4_ma0d9j.jpg",
    },
    {
      videoUrl: "https://www.youtube.com/embed/l7h2P07cSbc",
      type: "video",
      url:
        "https://res.cloudinary.com/dt4xntymn/image/upload/v1630790322/misc/bgPhotos/drone_s8lkqw.png",
    },
    {
 
      type: "image",
      url:
        "https://res.cloudinary.com/dt4xntymn/image/upload/v1631751013/ContactUs/54d3f4_28add3e68eb94ebc8675416c21360ddf_mv2_n5evlp.jpg",
    },
  ];
</script>

<div
  on:click={() => {
    if (images[index].type === "video") {
      $modal.visibility = true;
      $modal.content = images[index].videoUrl;
      $modal.type = "video";
    }
  }}
  class="page"
>
  <div class="image-container {images[index].type === 'video' ? 'blur' : ''} ">
    {#if images[index].type === "video"}
      <img
        alt=""
        src="https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/playButton_rbgj1t.png"
        class="play-button"
      />
    {/if}

    <img data-src={images[index].url} alt="" class="main-image lazy" />
  </div>
</div>

<style lang="scss">
  .blur {
    left: 0;
    right: 0;
    z-index: 0;
    position: relative;

    &::before {
      pointer-events: none;
      position: absolute;
      content: "";
      height: 100%;
      display: block;
      left: 0;
      right: 0;
      top: 0;

      @supports not (
        (-webkit-backdrop-filter: none) or (backdrop-filter: none)
      ) {
        background: rgba(0, 0, 0, 0.5);
      }

      -webkit-backdrop-filter: blur(5px);
      backdrop-filter: blur(5px);
    }
  }
  .image-container {
    height: 100%;
    .main-image {
      width: 100%;
      object-fit: cover;
      height: 100%;
    }
  }
  .play-button {
    position: absolute;
    width: 160px;
    position: absolute;
    top: 50%; /* position the top  edge of the element at the middle of the parent */
    left: 50%; /* position the left edge of the element at the middle of the parent */

    transform: translate(-50%, -50%);
    height: auto;
    z-index: 5;
    object-fit: cover;
  }
</style>
