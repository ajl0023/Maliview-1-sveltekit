import { derived, writable } from "svelte/store";

export const galleryImg = writable({
  currPhase: "phase 1",
  index: 0,
});
