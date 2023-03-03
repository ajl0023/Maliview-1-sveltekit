<script context="module">
	import { modal } from './../stores';
	import { galleryImg } from '../components/GalleryPreview/store';
	import path from 'path';
	import _ from 'lodash';
	import fs from 'fs';
	import pageData from '$lib/page-data.json';
	export const prerender = true;
	export async function load({ fetch }) {
		const arr2 = [];
		let shouldExit = false;
		function isObjectOrArray(item) {
			return _.isPlainObject(item) || Array.isArray(item);
		}
		function findImageUrls(obj) {
			if (Array.isArray(obj)) {
				for (const item of obj) {
					findImageUrls(item);
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
								findImageUrls(obj[key]);
								shouldExit = false;
							}
						}
					}
				}
			}
			return arr2;
		}
		findImageUrls(pageData);
		if (!browser) {
			fs.writeFileSync('./page-data.json', JSON.stringify(pageData));
		}

		return {
			props: {
				pagesData: pageData,
				data_loaded: true
			}
		};
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
	import axios from 'axios';

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
		<!-- <Navbar /> -->

		<!-- <ScrollContainer pageLayout="{pagesData}" /> -->

		<!-- <CardContainer />

		{#if $modal.visibility && $modal.content}
			<Modal />
		{/if}
		<Socials /> -->
	</div>
{/if}

<style lang="scss">
</style>
