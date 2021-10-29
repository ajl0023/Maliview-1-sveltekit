<script>
  import { galleryImg } from "./../GalleryPreview/store.js";
  import { createEventDispatcher } from "svelte";

  export let img;
  export let selected;
  const dispatch = createEventDispatcher();
</script>

<div
  class="{$galleryImg.currPhase} image-container {selected === img.index
    ? 'overlay-image'
    : ''}"
>
  <img
    on:click={() => {
      galleryImg.update((s) => {
        s.index = img.index;
        s.imageToDisplay = img.raw;
        return s;
      });
      dispatch("select", img.index);
    }}
    loading="lazy"
    src={img.url}
    alt=""
  />
</div>

<style lang="scss">
  .phase-1 {
    max-height: 25%;
  }
  .phase-2 {
    max-height: calc(100% / 6);
  }
  .image-container {
    width: 100%;

    height: 100%;

    img {
      object-fit: cover;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }
  }
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
</style>
