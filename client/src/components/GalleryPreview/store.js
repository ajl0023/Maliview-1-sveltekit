import { derived, writable } from "svelte/store";

export const galleryImg = writable({
  currPhase: "phase-1",
  index: 0,
  imageToDisplay:
    "https://res.cloudinary.com/dt4xntymn/image/upload/v1630880378/galleryHighRes/phase1/kitchen_discussion_ipeyz4.jpg",
});
