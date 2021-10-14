<script>
  import { galleryImg } from "../GalleryPreview/store";
  import GalleryImage from "../GalleryImage/GalleryImage.svelte";
  import { images } from "./galleryImages";
  let selected;

  const phases = ["phase 1", "phase 2"];

  const selectImage = (i) => {
    galleryImg.update((s) => {
      s.index = i;
      return s;
    });
  };
</script>

<div class="page">
  <div class="phase-label-container">
    {#each phases as phase}
      <h5
        on:click={() => {
          galleryImg.update((s) => {
            s.currPhase = phase;
            return s;
          });
        }}
        class:phase-label={phase === $galleryImg.currPhase}
      >
        {phase}
      </h5>
    {/each}
  </div>
  <div class="grid-container {$galleryImg.currPhase.replace(' ', '-')}">
    {#each images[$galleryImg.currPhase] as img, i}
      <svelte:component this={GalleryImage}>
        <div
          class="grid-image-container {$galleryImg.index === i
            ? 'overlay-image'
            : ''}"
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
    {#if $galleryImg.currPhase === "phase 1"}
      <iframe
        class="video-modal"
        width="100%"
        src="https://www.youtube.com/embed/nTS10ZQM5Ms"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    {/if}
  </div>
</div>

<style lang="scss">
  .phase-label-container {
    color: white;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 0.5rem;
    font-family: Orator;

    h5 {
      width: fit-content;
      position: relative;
      cursor: pointer;
    }

    .phase-label::after {
      content: "";
      display: block;
      width: 100%;
      height: 1px;

      background-color: white;
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
  .phase-2 {
    display: grid;
    height: 100%;
    grid-template-columns: repeat(25, 4%);
    grid-template-rows: repeat(25, 4%);
    width: 100%;
    gap: 2.8px;
    .grid-image-container:nth-child(n + 2):nth-child(-n + 5) {
      grid-column: span 10;
      grid-row: span 3;
    }

    .grid-image-container {
      grid-column: span 5;
      grid-row: span 4;
      overflow: hidden;
      width: 100%;
    }
    .grid-image-container:nth-child(20) {
      grid-column: span 5;
      grid-row: span 8;
    }
    .grid-image-container:nth-child(21) {
      grid-column: span 5;
      grid-row: span 10;
    }
    .grid-image-container:nth-child(22) {
      grid-row: span 12;
    }
    .grid-image-container:nth-child(8) {
      grid-column: span 4;
      grid-row: span 4;
    }

    .grid-image-container:nth-child(18) {
      grid-column: span 10;

      grid-row: span 6;
    }
    .grid-image-container:nth-child(10) {
      grid-column: span 6;
    }
  }
  .phase-1 {
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
    }
  }
  .grid-container {
    img {
      object-fit: cover;
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
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
</style>
