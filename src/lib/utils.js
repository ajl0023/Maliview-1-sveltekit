export const getImage = (url) => {
	return new URL('images/' + url, import.meta.url).href;
};
