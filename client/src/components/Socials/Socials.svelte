<script>
  import Facebook from "./Facebook/Facebook.svelte";
  import Instagram from "./Instagram/Instagram.svelte";
  import Linkedin from "./Linkedin/Linkedin.svelte";
  import Twitter from "./Twitter/Twitter.svelte";
</script>

<div class="container">
  <a
    on:click={(e) => {
      e.preventDefault();
      window.open("https://www.facebook.com/apeldesign/");
    }}
    href="https://www.facebook.com/apeldesign/"
  >
    <Facebook />
  </a>
  <a
    on:click={(e) => {
      e.preventDefault();
      window.open("https://www.instagram.com/apeldesigninc/");
    }}
    href="https://www.instagram.com/apeldesigninc/"><Instagram /></a
  >
  <a
    on:click={(e) => {
      e.preventDefault();
      window.open("https://www.linkedin.com/in/amit-apel-05373727");
    }}
    href="https://www.linkedin.com/in/amit-apel-05373727"
  >
    <Linkedin /></a
  >
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
