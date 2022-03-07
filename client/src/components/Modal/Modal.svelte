<script>
import { onMount } from "svelte";

  import { modal } from "../../stores";
  onMount(()=>{
    console.log($modal.content)
  })
</script>

<div class="bu-modal {$modal.visibility ? 'bu-is-active' : ''}">
  <div
    on:click={() => {
      $modal.content = null;

      $modal.visibility = false;
    }}
    class="bu-modal-background"
  />
  <div class="bu-modal-content">
    <div class="bu-image bu-is-4by3">
      {#if $modal.type === "video"}
        <div class="video-container">
          <iframe
            height="100%"
            class="video-modal"
            width="100%"
            src={$modal.content}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      {:else}
       {#if $modal.content}
       <img src={$modal.content.url} alt="" />
       {/if}
      {/if}
    </div>
  </div>
  <button
    on:click={() => {
      $modal.content = null;

      $modal.visibility = false;
    }}
    class="bu-modal-close bu-is-large"
    aria-label="close"
  />
</div>

<style lang="scss">
  .video-container {
    .video-modal {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      height: 100%;
      width: 100%;
    }
  }
  img {
    width: 100%;
    object-fit: cover;
    height: 100%;
  }
</style>
