import { pageLayout } from '../../stores';
import { derived, writable } from 'svelte/store';

export const galleryImg = writable({
	currPhase: 0,
	index: 0,
	selected: 0,
	imageToDisplay: pageLayout['bts'] ? pageLayout['bts'][0].images[0].url : null
});
