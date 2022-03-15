import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';
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
		prerender: {
			crawl: true,
			enabled: true
		},
		adapter: adapter()
	},
	preprocess: sveltePreprocess({})
};
