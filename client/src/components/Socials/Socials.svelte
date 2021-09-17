<script>
  import Facebook from "./Facebook/Facebook.svelte";
  import Instagram from "./Instagram/Instagram.svelte";
  import Linkedin from "./Linkedin/Linkedin.svelte";
  import Twitter from "./Twitter/Twitter.svelte";
</script>

<div class="container">
  <Facebook />
  <Instagram />
  <Linkedin />
  <Twitter />
</div>

<style lang="scss">
  .container {
    position: fixed;
    z-index: 3;
    right: 40px;
    bottom: 25px;

    width: 15px;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
    opacity: 60%;
    object-fit: cover;
  }
</style>
