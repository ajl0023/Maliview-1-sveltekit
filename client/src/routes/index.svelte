<script>
  import { onDestroy, onMount } from "svelte";
  import Modal from "../components/Modal/Modal.svelte";
  import Navbar from "../components/Navbar/Navbar.svelte";
  import { browser } from "$app/env";
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
  <button
    on:click={() => {
      fetch("/.netlify/functions/hello");
      console.log(2342342342342342);
    }}>sadfik;ijosfaiosdd</button
  >
  <Navbar />

  <ScrollContainer />

  <CardContainer />

  <Modal />
</div>

<style lang="scss">
</style>
