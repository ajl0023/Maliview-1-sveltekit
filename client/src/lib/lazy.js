import LazyLoad from 'vanilla-lazyload';
export let lazy;
// export const lazyLoadInstance = () => {
// 	if (!lazy) {
// 		lazy = new LazyLoad();
// 	}
// 	return lazy;
// };
export const lazyLoadInstance = function () {
	return new LazyLoad();
};
