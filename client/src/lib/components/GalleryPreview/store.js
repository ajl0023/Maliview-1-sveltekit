import { derived, writable } from 'svelte/store';

export const galleryImg = writable({
	currPhase: 3,
	index: 0,
	selected: 0,
	imageToDisplay: null
});
