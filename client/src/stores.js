import { derived, writable } from 'svelte/store';
import { pageLength } from './pageContent';
import { images } from './components/image';

export const pageLayout = {};
const currentPageStore = () => {
	const state = {
		page: 0,
		action: null
	};
	const { subscribe, set, update } = writable(state);
	const methods = {
		setPage(val) {
			update((state) => {
				if (val === 1 && state.page === images.length / 2 + 2) {
					state.page = 0;
					return state;
				}
				if ((val === -1 && state.page >= 1) || (val === 1 && state.page < images.length / 2 + 2)) {
					state.page = state.page + val;
				}
				return state;
			});
		}
	};
	return {
		subscribe,
		set,
		update,
		...methods
	};
};
export const currentPage = currentPageStore();

export let scrollContainers = [];
export const modal = writable({
	visibility: false,
	content: null,
	type: null
});
const pagePositionsStore = () => {
	const state = {
		page: null,
		left: 0,
		shouldScroll: true,
		inital: false,
		right: -1000
	};
	const { subscribe, set, update } = writable(state);

	const methods = {
		toggleScroll(e) {
			update((state) => {
				state.shouldScroll = false;
				setTimeout(() => {
					state.shouldScroll = true;
				}, 1100);

				return state;
			});
		},
		disableScroll() {
			update((state) => {
				state.shouldScroll = false;
			});
		},
		enable() {
			update((state) => {
				state.shouldScroll = true;
			});
		},
		scrollCheck(e) {
			let bool = true;

			if (scrollContainers.includes(e.target.parentElement.parentElement.parentElement)) {
				return new Promise((res, rej) => {
					scrollContainers.forEach((ele) => {
						ele.onscroll = () => {
							res(false);
						};
					});

					setTimeout(() => {
						res(bool && state.shouldScroll);
					}, 100);

					//will probably have to edit this, but this seems to be simplest solution
				});
			} else {
				return Promise.resolve(bool && state.shouldScroll);
			}
		},
		scrollEve(e) {
			this.scrollCheck(e).then((val) => {
				if (val) {
					if (e.deltaY > 0 && state.page < pageLength - 1) {
						state.left = state.left - 100;
						state.right = state.right + 100;

						state.page += 1;
					} else if (e.deltaY < 0 && state.page > 0) {
						state.left = state.left + 100;
						state.right = state.right - 100;

						state.page -= 1;
					}
					this.toggleScroll(e);
				}
			});
		},
		handleResize(left, right) {
			update((state) => {
				state.left = left;
				state.right = right;

				return state;
			});
		}
	};
	return {
		subscribe,
		set,
		update,
		...methods
	};
};

export const pagePositions = pagePositionsStore();
