<script context="module">
	import { modal, pageLayout } from './../stores';
	import { galleryImg } from '../components/GalleryPreview/store';
	import _ from 'lodash';
	export const prerender = true;
	export async function load({ fetch }) {
		if (browser) {
			const categories = (await (await fetch('/api2/api/categories')).json()).reduce(
				(acc, item) => {
					acc[item._id] = item;
					return acc;
				},
				{}
			);
			console.log(234234);
			const imagePages = await fetch('/api2/api/bg-pages');
			const carouselRenders = await fetch('/api2/api/carousel-renders');
			const pageCarousels = await fetch('/api2/api/page-carousels');
			const bts = await fetch('/api2/api/behind-the-scenes');
			const mobile = await fetch('/api2/api/mobile');
			pageLayout['image-pages'] = await imagePages.json();
			pageLayout['carousel-renders'] = await carouselRenders.json();
			pageLayout['page-carousels'] = await pageCarousels.json();
			pageLayout['bts'] = await bts.json();
			pageLayout['mobile'] = await mobile.json();
			pageLayout['mobile'] = pageLayout['mobile'].map((item) => {
				item['type'] = categories[item.category].category;
				return item;
			});

			galleryImg.update((s) => {
				s.imageToDisplay = pageLayout['bts'][0].images[0].url;
				return s;
			});

			function isObjectOrArray(item) {
				return _.isPlainObject(item) || Array.isArray(item);
			}
			const arr2 = [];
			let shouldExit = false;
			function changeUrls(obj) {
				if (Array.isArray(obj)) {
					for (const item of obj) {
						changeUrls(item);
					}
					return;
				}
				if (!isObjectOrArray(obj)) {
					return;
				} else {
					if (obj.url) {
						shouldExit = true;
						arr2.push(obj);
						return;
					} else {
						for (const key in obj) {
							if (isObjectOrArray(obj[key])) {
								if (Array.isArray(obj[key])) {
									obj[key] = obj[key].sort((a, b) => {
										return a.order - b.order;
									});
								}
								if (shouldExit) {
									continue;
								} else {
									changeUrls(obj[key]);
									shouldExit = false;
								}
							}
						}
					}
				}
				return arr2;
			}
			function changeAllUrls(urls) {
				urls.map((item) => {
					if (dev) {
						item.url = item.url.replace('https://test12312312356415616.store', hostName);
					} else {
						return item;
					}
				});
			}

			changeAllUrls(changeUrls(pageLayout, false));
			return {
				props: {
					data_loaded: true
				}
			};
		}
		return {};
	}
</script>

<script>
	import { onDestroy, onMount } from 'svelte';
	import Modal from '../components/Modal/Modal.svelte';
	import Navbar from '../components/Navbar/Navbar.svelte';
	import { browser, dev } from '$app/env';
	import Socials from '../components/Socials/Socials.svelte';
	import '../global.scss';

	import '../bulma.prefixed.css';
	import ScrollContainer from '../components/ScrollContainer/ScrollContainer.svelte';
	import CardContainer from '../components/CardContainer/CardContainer.svelte';
	import { hostName } from 'src/host';

	export let pagesData;
	export let data_loaded;
	let windowThreshHold = false;

	function handleResponsiveResize() {
		if (
			window.innerWidth <= 650 ||
			window.matchMedia('(orientation: portrait)').matches ||
			window.matchMedia('(orientation: landscape)').matches
		) {
			windowThreshHold = true;
		} else {
			windowThreshHold = false;
		}
	}
	onMount(() => {
		handleResponsiveResize();

		window.addEventListener('resize', handleResponsiveResize);
	});
	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', handleResponsiveResize);
		}
	});
</script>

{#if data_loaded}
	<div>
		<Navbar />

		<ScrollContainer pageLayout="{pagesData}" />

		<CardContainer />

		{#if $modal.visibility && $modal.content}
			<Modal />
		{/if}
		<Socials />
	</div>
{/if}

<style lang="scss">
</style>
