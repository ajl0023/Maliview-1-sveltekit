<script>
  import { onMount } from "svelte";

  import { lazyLoadInstance } from "../../lazy";

  import { currentPage } from "../../stores";

  export let page;

  const images = [
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/1_wohazp.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/2_ntogjy.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/3_wv7c2m.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/4_kdlq6e.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/5_dbtnm5.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/6_h0qu9t.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/7_khodvl.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/8_gai2yo.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815471/carouselThumbs/9_webihd.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/10_ircdxh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/11_pe8ndb.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/12_cnbadh.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/13_vn65ka.jpg",
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630815470/carouselThumbs/14_ndznnt.jpg",
  ];
  let imagesToDisplay = images
    .map((img, i) => {
      const obj = {
        url: img,
        page: i < 7 ? "left" : "right",
        index: i,
      };
      return obj;
    })
    .filter((img) => {
      return img.page === page;
    });

  onMount(() => {
    lazyLoadInstance();
  });
</script>

<div
  style="padding:{page === 'left'
    ? '25px 7.5px 0px 0px'
    : '25px 0px 0px 7.5px'};
    float:{page === 'left' ? 'right' : 'left'};
    "
  class="container"
>
  {#each imagesToDisplay as img, i}
    {#if img}
      <div
        class:selected={$currentPage.page === img.index}
        class="image-container"
      >
        <img
          class="lazy"
          width="200px"
          height="200px"
          data-src={img.url}
          alt=""
        />;
      </div>
    {:else}
      <div style="background-color:black" class="image-container" />
    {/if}
  {/each}
</div>

<style lang="scss">
  .selected {
    border: 1px solid white;
  }
  .image-container {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
    }
  }
  .container {
    display: flex;

    margin: -7.5px;
    .image-container {
      margin: 7.5px;
    }
  }
</style>
