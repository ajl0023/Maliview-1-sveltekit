<script>
  import { highResBts } from "../../pageContent";
  import { galleryImg } from "./store";
</script>

<div class="page">
  <div class="image-container">
    <img
      loading="lazy"
      src={highResBts[$galleryImg.currPhase][$galleryImg.index]}
      alt=""
    />
  </div>
</div>

<style lang="scss">
  .image-container {
    height: 100%;
    padding-right: 5px;
    img {
      height: 100%;
      object-fit: cover;
      width: 100%;
    }
  }
</style>
