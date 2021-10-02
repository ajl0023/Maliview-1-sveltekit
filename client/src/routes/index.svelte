<script>
  import { onDestroy, onMount } from "svelte";
  import Modal from "../components/Modal/Modal.svelte";
  import Navbar from "../components/Navbar/Navbar.svelte";
  import { browser } from "$app/env";
  import Socials from "../components/Socials/Socials.svelte";
  import "../global.scss";

  import "../bulma.prefixed.css";
  import ScrollContainer from "../components/ScrollContainer/ScrollContainer.svelte";
  import CardContainer from "../components/CardContainer/CardContainer.svelte";

  let windowThreshHold = false;

  function handleResponsiveResize() {
    if (window.innerWidth <= 650) {
      windowThreshHold = true;
    } else {
      windowThreshHold = false;
    }
  }
  onMount(() => {
    handleResponsiveResize();

    window.addEventListener("resize", handleResponsiveResize);
  });
  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", handleResponsiveResize);
    }
  });
</script>

<div>
  <Navbar />

  <ScrollContainer />

  <CardContainer />

  <Modal />
  <Socials />
</div>

<style lang="scss">
</style>
