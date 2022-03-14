import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import path from 'path';
export default {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		vite: {
			resolve: {
				alias: {
					src: path.resolve('./src')
				}
			}
		},
		adapter: adapter({
			// default options are shown
			pages: './build',
			assets: './build',
			fallback: null
		})
	},
	preprocess: sveltePreprocess({})
};
