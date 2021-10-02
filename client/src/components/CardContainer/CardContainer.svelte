<script>
  import Card from "../Card/Card.svelte";
  import CardCarousel from "../CardCarousel/CardCarousel.svelte";
  import CardCredits from "../CardCredits/CardCredits.svelte";
  import CardGallery from "../CardGallery/CardGallery.svelte";
  import ContactUs from "../ContactUs/ContactUs.svelte";

  const cardLayout = [
    {
      title: "malibu life",
      type: "image",
    },
    {
      title: "discover",
      type: "image",
    },
    {
      title: "renders",
      type: "carousel",
    },
    {
      title: "floorplans",
      type: "carousel",
    },
    {
      title: "equestrian",
      type: "image",
    },

    {
      title: "video render",
      type: "video",
    },
    {
      title: "behind the scenes",
      type: "gallery",
    },
    {
      title: "drone footage",
      type: "video",
    },
  ];
</script>

<div class="card-wrapper">
  <div class="bg-image-container">
    <img
      class="bg-image"
      src="https://res.cloudinary.com/dt4xntymn/image/upload/v1631654002/homebg/Horses_Running_t0wcvh.jpg"
      alt=""
    />
  </div>
  <div id="home" class="logo-wrapper">
    <div class="logo-container">
      <img
        class="image-logo"
        src="https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/homeLogo_yufrin.png"
        alt=""
      />
    </div>
  </div>
  <div class="card-container">
    {#each cardLayout as card, i}
      {#if cardLayout[i].type === "image" || cardLayout[i].type === "video"}
        <Card page={card} index={i} />
      {:else if cardLayout[i].type === "gallery"}
        <CardGallery />
      {:else}
        <CardCarousel page={card} index={i} />
      {/if}
    {/each}
    <CardCredits />
    <div id="contact" class="contact-us-container">
      <ContactUs />
    </div>
  </div>
</div>

<style lang="scss">
  .bg-image-container {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    .bg-image {
      width: 100%;
      object-fit: cover;
      height: 100%;
    }
  }
  .contact-us-container {
    width: 100%;
    padding: 30px;
    height: 100vh;
  }
  .card-container {
    position: relative;
    background-color: #2c2a2b;
  }
  .logo-wrapper {
    z-index: 2;
    position: relative;
    width: 100vw;
    height: 100vh;

    display: flex;

    justify-content: center;
    align-items: center;
    .logo-container {
      max-width: 55%;
      .image-logo {
        object-fit: contain;

        width: 100%;
      }
    }
  }
</style>
