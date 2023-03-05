import { writable } from 'svelte/store';
import LazyLoad from 'vanilla-lazyload';
function createLazy() {
	const state = {
		lazy: null
	};
	const { subscribe, set, update } = writable(state);

	const methods = {
		init: () => {
			state.lazy = new LazyLoad({});
		},
		update_lazy: () => {
			state.lazy.update();
		}
	};
	return { ...methods, subscribe };
}

export const createLazyStore = createLazy();
