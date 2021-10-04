<script>
  import { creditsContent } from "../../pageContent";


</script>

<div id="credits" class="mobile-container">
  <div class="mobile-header-container">
    <h5 class="credits-title">development credits</h5>
  </div>
  {#each creditsContent as credit}
    <div class="mobile-credits-container">
      <h5 class="bu-header">{credit.header}</h5>
      {#each credit.paragraphs as p}
        <p>{p}</p>
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  .credits-title {
    font-family: Orator;
    font-size: 1.5em;
  }

  .mobile-container {
    width: 100%;
    padding: 20px;
    text-align: center;

    .mobile-header-container {
      font-size: 1.6em;
      margin-bottom: 1rem;
    }
    .mobile-credits-container {
      margin-bottom: 2rem;
      opacity: 0;
      &:not(:last-child)::after {
        content: "";
        display: block;
        width: 50px;
        height: 1px;
        padding: 20px;
        margin: auto;
        border-bottom: 1px solid white;
      }
    }
  }
  h5 {
    font-size: 1em;
    margin-bottom: 20px;
    color: white;
    @media (max-width: 1040px) {
      margin-bottom: 10px;
      font-size: 0.7em;
    }
  }
  p {
    color: white;
    font-family: "Roboto", sans-serif;
    font-size: 0.8em;
  }
</style>
