<script>
  import { highResBts } from "../../pageContent";
  import { modal } from "../../stores";
  import { images } from "../Gallery/galleryImages";
  let currPhase = "phase-1";
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

</script>

<div>
  <div id="behind-the-scenes" class="container">
    <div><h5 class="bu-title bu-has-text-centered">behind the scenes</h5></div>
    <div class="curr-phase-container">
      {#each phases as phase}
        <h5
          class:phase-label={phase.select === currPhase}
          on:click={() => {
            currPhase = phase.select;
          }}
        >
          {phase.label}
        </h5>
      {/each}
    </div>
    <div class="gallery-container">
      {#each images[currPhase].card as image, i}
        <div class="image-container">
          <img
            src={image.url}
            on:click={() => {
              $modal.visibility = true;
              $modal.content = image.raw;
              $modal.type = "image";
            }}
            loading="lazy"
            alt=""
          />
        </div>{/each}
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    max-height: 500px;
    overflow: hidden;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    gap: 20px;
    margin-bottom: 20px;
  }
  .curr-phase-container {
    display: flex;
    color: white;
    gap: 10px;
    text-transform: uppercase;
    h5 {
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
    overflow-y: auto;
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
</style>
