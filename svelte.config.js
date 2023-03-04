// import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-netlify';
import importAssets from 'svelte-preprocess-import-assets';
/** @type {import('@sveltejs/kit').Config} */
import preprocess from 'svelte-preprocess';

const config = {
	preprocess: [
		vitePreprocess({
			optimizeDeps: {
				include: []
			}
		}),
		importAssets()
	],
	kit: {
		adapter: adapter()
	}
};

export default config;
