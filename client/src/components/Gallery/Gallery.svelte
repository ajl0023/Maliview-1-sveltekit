<script>
  import GallerySelected from "./GallerySelected.svelte";
  import { galleryImg } from "../GalleryPreview/store";
  import GalleryImage from "../GalleryImage/GalleryImage.svelte";
  import { images } from "./galleryImages";
  let selected;

  const phases = [
    {
      label: "phase 1",
      select: "phase-1",
    },
    {
      label: "phase 2",
      select: "phase-2",
    },
  ];

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
            s.currPhase = phase.select;
            s.index = 0;
            return s;
          });
        }}
        class:phase-label={phase.select === $galleryImg.currPhase}
      >
        {phase.label}
      </h5>
    {/each}
  </div>
  <div class="flex-container {$galleryImg.currPhase}">
    {#each images[$galleryImg.currPhase].main as col}
      <div class="flex-column">
        {#each col as img, i}
          <GallerySelected
            {img}
            {selected}
            on:select={(e) => {
              selected = e.detail;
            }}
          />
        {/each}
      </div>
    {/each}
    {#if $galleryImg.currPhase === "phase-1"}
      <!-- <iframe
        class="video-modal"
        width="100%"
        src="https://www.youtube.com/embed/nTS10ZQM5Ms"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      /> -->
    {/if}
  </div>
</div>

<style lang="scss">
  .flex-column {
    display: flex;
    width: 100%;
    gap: 5px;
    flex-direction: column;
    &:nth-child(3) {
      .image-container {
        max-height: calc(100% / 5);
      }
    }
  }

  .flex-container {
    width: 100%;
    height: 100%;
    gap: 5px;
    display: flex;
  }

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
</style>
