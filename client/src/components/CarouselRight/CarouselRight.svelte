<script>
  import Glide from "@glidejs/glide";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { currentPage } from "../../stores";
  import Arrow from "../Card/Arrow.svelte";
  import CarouselThumbs from "../CarouselThumbs/CarouselThumbs.svelte";
  import { images } from "../image";
  export let page;
  var glide;

  let carousel;

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
        <h1>ders</h1>
        <p>erior renders of Maliview Estates.</p>
      </div>
      <div class="carousel-container">
        <div class="indicator {page}">
          {#if glide}
            <p>
              {$currentPage.page + 1}/{images.length / 2}
            </p>
          {/if}
        </div>
        <div
          bind:this={carousel}
          data-glide-dir={`${$currentPage.page}`}
          class="glide right"
        >
          <div class="glide__track" data-glide-el="track">
            <ul class="glide__slides">
              {#each images.slice(14, 28) as img, i}
                <li class="glide__slide">
                  <div class="slide-image-container">
                    <img
                      loading="lazy"
                      class="carousel-image"
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
            currentPage.setPage(1);
          }}
          class="page-arrow-container"
        >
          <div class="page-arrow-relative">
            <Arrow
              styleP="object-fit:cover;width:100%;fill:white; transform:rotate(90deg); height:100%; "
            />
          </div>
        </button>
      </div>
      <CarouselThumbs page="right" />
    </div>
  </div>
</div>

<style lang="scss">
  .indicator {
    top: 5px;

    z-index: 4;
    font-weight: 600;
    text-align: center;
    letter-spacing: 0.2em;
    right: 5px;
    position: absolute;
    padding: 5px 15px;
    border-radius: 14px;
    background-color: black;
    color: white;
    display: flex;
    justify-content: center;
    p {
      margin-right: -0.2em;
    }
  }
  .title-container {
    padding: 20px 20px 20px 0px;
    color: white;
    h1 {
      font-size: 3em;
      text-transform: uppercase;
      font-family: Orator;
      color: white;
    }
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
  .carousel-content-container {
    max-width: 500px;
    width: 100%;
    height: 100%;
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .glide__slides {
    height: 100%;
  }
  .glide__track {
    height: 100%;
  }
  .page-arrow-container {
    width: 30px;
    height: 30px;
    position: absolute;
    right: 10px;
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
  .content-container {
    display: flex;
    height: 100%;

    overflow: hidden;
    padding: 10px 30px 10px 0px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }

  .carousel-container {
    width: 100%;
    height: 65%;
    display: flex;
    position: relative;
  }
  .carousel-image {
    width: 100%;
    height: 100%;
  }
</style>
