<script>
  import Glide from "@glidejs/glide";
  import { afterUpdate, onMount } from "svelte";
  import { currentPage } from "../../stores";
  import CarouselThumbs from "../CarouselThumbs/CarouselThumbs.svelte";
  import { images } from "../image";
  import Arrow from "../Card/Arrow.svelte";
  let carousel;
  let glide;
  

  onMount(() => {
    glide = new Glide(carousel, {
      dragThreshold: false,
    });
    glide.mount();
  });
  afterUpdate(() => {
    glide.go(`=${$currentPage.page}`);
  });
</script>

<div class="page">
  <div class="content-container">
    <div class="carousel-content-container">
      <div class="title-container">
        <h1>ren</h1>
        <p>Browse below for interior and ext</p>
      </div>
      <div class="carousel-container">
        <div
          bind:this={carousel}
          data-glide-dir={`${$currentPage.page}`}
          class="glide "
        >
          <div class="glide__track" data-glide-el="track">
            <ul class="glide__slides">
              {#each images.slice(0, 14) as img, i}
                <li class="glide__slide">
                  <div class="slide-image-container">
                    <img
                      loading="lazy"
                      class="carousel-image lazy"
                      src={img}
                      alt=""
                    />
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <button
          on:click={() => {
            currentPage.setPage(-1);
          }}
          class="page-arrow-container"
        >
          <div class="page-arrow-relative">
            <Arrow
              styleP="object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
            />
          </div>
        </button>
      </div>
      <CarouselThumbs page="left" />
    </div>
  </div>
</div>

<style lang="scss">
  .title-container {
    text-align: right;
    color: white;
    padding: 20px 0 20px 20px;
    h1 {
      font-size: 3em;
      text-transform: uppercase;
      font-family: Orator;
      color: white;
    }
  }
  .content-container {
    display: flex;
    height: 100%;
    padding: 10px 0 10px 30px;
    overflow: hidden;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
  }
  .carousel-content-container {
    max-width: 500px;
    width: 100%;
    height: 100%;
    align-items: flex-end;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .slide-image-container {
    position: relative;
    width: 100%;
    height: 100%;

    img {
      position: absolute;
      height: 100%;

      width: 100%;
    }
  }
  .glide__track {
    height: 100%;
  }
 
  .page-arrow-container {
    width: 30px;
    height: 30px;
    position: absolute;
    left: 10px;
    bottom: 0;
    top: 50%;
    border-radius: 50%;
    background-color: rgba(0 0 0 / 0.5);
    border: none;
    overflow: hidden;

    .page-arrow-relative {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;

      right: 0;
      padding: 5px;
      margin: auto;
    }
  }

  .glide__slides {
    height: 100%;
  }
  .carousel-container {
    width: 100%;
    height: 65%;
    display: flex;
    position: relative;
  }
</style>
