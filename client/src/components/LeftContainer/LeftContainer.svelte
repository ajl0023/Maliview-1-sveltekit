<script>
  import CarouselLeft from "../CarouselLeft/CarouselLeft.svelte";
  import ContactUs from "../ContactUs/ContactUs.svelte";
  import Credits from "../Credits/Credits.svelte";
  import GalleryPreview from "../GalleryPreview/GalleryPreview.svelte";
  import ImagePage from "../ImagePage/ImagePage.svelte";
  import TextPage from "../TextPage/TextPage.svelte";
  let name = "world";
  export let leftPage;
  export let carouselPage;
</script>

<div bind:this={leftPage} class="container">
  <div class="bg-image-container">
    <img
      class="bg-image"
      src="https://res.cloudinary.com/dt4xntymn/image/upload/v1631649512/homebg/HorseLeft_eilqmu.jpg"
      alt=""
    />
  </div>
  <div id="home" class="logo-wrapper">
    <div class="logo-container">
      <img
        class="image-logo"
        src="https://res.cloudinary.com/dt4xntymn/image/upload/v1630788553/misc/Maliview_Left_Logo_amrxlk.png"
        alt=""
      />
    </div>
  </div>

  <ImagePage name="malibu" index={0} />
  <TextPage name="discover" bgColor="#a4632e" index={1} />
  <CarouselLeft name="renders" {carouselPage} page="left" />
  <TextPage name="floorplans" bgColor="#a4632e" index={3} />
  <ImagePage name="equestrian" index={2} />
  <TextPage name="video render" bgColor="#a4632e" index={5} />
  <GalleryPreview name="behind the scenes" />

  <TextPage index={7} name="drone footage" />
  <Credits page="left" />
  <div class="page">
    <ContactUs />
  </div>
</div>

<style lang="scss">
  .bg-image-container {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    .bg-image {
      width: 100%;
      height: 100%;
    }
  }
  .container {
    position: relative;
    align-items: center;

    transition: all 1s ease-out;
    height: 100vh;
    max-width: 50vw;
    width: 100%;
    .logo-wrapper {
      width: 50vw;
      height: 100vh;

      display: flex;
      align-items: center;
      justify-content: flex-end;
      z-index: 2;
      position: relative;
      .logo-container {
        max-width: 33%;
        .image-logo {
          object-fit: contain;

          width: 100%;
        }
      }
      @media (max-width: 650px) {
        width: 100%;
        max-width: 100%;

        .logo-container {
          max-width: 40%;
          .image-logo {
            width: 100%;
          }
        }
        justify-content: center;
      }
    }
    @media (max-width: 650px) {
      max-width: 100%;
    }
  }
  @media (max-width: 650px) {
    .image-logo {
      display: none;
    }
    .container {
      width: 100vw;
    }
    .container {
      transform: translateY(0) !important;
      justify-content: center;
    }
  }
</style>
