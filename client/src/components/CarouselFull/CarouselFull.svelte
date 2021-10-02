<script>
  import Glide from "@glidejs/glide";
  import { onMount } from "svelte";
  import Arrow from "../Card/Arrow.svelte";

  let glider;
  export let name;
  export let page;
  export let orient;
  const images = {
    floorplans: [
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199065/FloorPlans/33340_Mullholland_Hwy_SITE_PLAN_gbvv7f.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199064/FloorPlans/33340_Mullholland_Hwy_1ST_FLOOR_BLACK_20211001_qrb856.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1633199063/FloorPlans/33340_Mullholland_Hwy_2ND_FLOOR_20211001_cmgvbq.jpg",
    ],
    discover: [
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656387/discoverCarousel/9_uzo4x8.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656387/discoverCarousel/8_hfpqwt.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/7_hsa2ug.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656388/discoverCarousel/6_irwxo2.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656384/discoverCarousel/5_uxqh1e.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/4_gbfofj.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/3_dhtxik.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/2_glhk3x.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656383/discoverCarousel/1_dcchec.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656385/discoverCarousel/12_ymbo5d.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656385/discoverCarousel/11_jrxcsr.jpg",
      "https://res.cloudinary.com/dt4xntymn/image/upload/v1631656386/discoverCarousel/10_cvnxds.jpg",
    ],
  };

  const halfCarousel = {};
  let glide;
  let glideIndex = 0;
  onMount(() => {
    glide = new Glide(glider);
    glide.mount();
    glide.on("run", function () {
      glideIndex = glide.index;
    });
  });
</script>

<div class="page">
  <div class="indicator {page}">
    {#if glide}
      <p>
        {glideIndex + 1}/{orient === "half"
          ? halfCarousel[name].length
          : images[name].length}
      </p>
    {/if}
  </div>
  <div bind:this={glider} class="glide">
    <div class="glide__track" data-glide-el="track">
      <ul class="glide__slides">
        {#each images[name] as img, i}
          <li class="glide__slide">
            <div class="image-container">
              <img loading="lazy" class="carousel-image" src={img} alt="" />
            </div>
          </li>
        {/each}
      </ul>
    </div>
    <div class="glide__arrows" data-glide-el="controls">
      <button
        class="glide__arrow page-arrow-container glide__arrow--left"
        data-glide-dir="<"
      >
        <div class="page-arrow-relative">
          <Arrow
            styleP="object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
          />
        </div></button
      >
      <button
        class="glide__arrow  page-arrow-container glide__arrow--right"
        data-glide-dir=">"
      >
        <div class="page-arrow-relative">
          <Arrow
            styleP="object-fit:cover;width:100%;fill:white; transform:rotate(-90deg); height:100%; "
          />
        </div>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .page {
    position: relative;
  }
  .left {
    right: 5px;
  }
  .right {
    left: 5px;
  }
  .indicator {
    top: 5px;

    z-index: 4;
    font-weight: 600;
    text-align: center;
    letter-spacing: 0.2em;

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
  .glide__arrow--right {
    right: 20px;
    transform: rotate(180deg);
  }
  .glide__arrow--left {
    left: 20px;
  }
  .page-arrow-container {
    width: 30px;
    height: 30px;
    position: absolute;

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
    display: flex;

    justify-content: center;
  }

  .glide__slide {
    display: flex;
    justify-content: center;
  }
  .glide__arrows {
    position: absolute;
    left: 0;
    margin: auto;
    top: 0;
    bottom: 0;
    right: 0;
    width: 100%;
  }
  .glide {
    height: 100%;
    .glide__track {
      height: 100%;
      .image-container {
        width: 100%;
        img {
          width: 100%;
          object-fit: cover;
          height: 100%;
          object-position: center center;
        }
      }
    }
  }
</style>
