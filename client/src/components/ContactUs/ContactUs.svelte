<script>
  let form;
  const handleSubmit = (e) => {
    e.preventDefault();

    let formData = new FormData(form);
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => console.log("Form successfully submitted"))
      .catch((error) => alert(error));
  };
</script>

<div class="container">
  <h5 class="bu-is-size-1">contact</h5>
  <form
    bind:this={form}
    name="emailForm"
    data-netlify="true"
    class="form-container"
  >
    <input type="hidden" name="form-name" value="emailForm" />

    <div class="bu-field">
      <div class="bu-control">
        <input
          id="name-input"
          class="bu-input"
          type="text"
          name="name"
          placeholder="Name"
        />
      </div>
    </div>
    <div class="bu-field">
      <div class="bu-control">
        <input
          id="email-input"
          class="bu-input"
          type="email"
          name="email"
          placeholder="Email"
        />
      </div>
    </div>
    <div class="bu-field">
      <div class="bu-control">
        <input
          id="country-input"
          class="bu-input"
          type="text"
          name="country"
          placeholder="Country"
        />
      </div>
    </div>
    <div class="bu-field">
      <div class="bu-control">
        <input
          id="phone-input"
          class="bu-input"
          type="phone"
          name="phone"
          placeholder="Phone"
        />
      </div>
    </div>
    <div class="bu-field">
      <div class="bu-control">
        <textarea
          id="message-input"
          class="bu-textarea"
          type="text"
          name="message"
          placeholder="Message"
        />
      </div>
    </div>
    <div class="bu-field">
      <div class="bu-control">
        <input
          on:click={handleSubmit}
          type="submit"
          class="bu-button bu-is-link bu-is-fullwidth"
        />
      </div>
    </div>
  </form>
</div>

<style lang="scss">
  .bu-button {
    background-color: rgb(164, 99, 46);
  }
  .form-container {
    width: 100%;
    max-width: 500px;
    .bu-field {
      margin: 15px;
      ::placeholder {
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: black;
        font-size: 0.8em;
        opacity: 0.5; /* Firefox */
      }
    }
  }
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    flex-direction: column;
  }
  h5 {
    text-transform: uppercase;
    color: white;
    font-family: Orator;
  }
</style>
