import pageData from '$lib/page-data.json';
import { textPages } from '$lib/pageContent.js';
import _ from 'lodash';

export async function load({ fetch }) {
	// const arr2 = [];
	// let shouldExit = false;
	// function isObjectOrArray(item) {
	// 	return _.isPlainObject(item) || Array.isArray(item);
	// }
	// function findImageUrls(obj) {
	// 	if (Array.isArray(obj)) {
	// 		for (const item of obj) {
	// 			findImageUrls(item);
	// 		}
	// 		return;
	// 	}
	// 	if (!isObjectOrArray(obj)) {
	// 		return;
	// 	} else {
	// 		if (obj.url) {
	// 			shouldExit = true;
	// 			arr2.push(obj);
	// 			return;
	// 		} else {
	// 			for (const key in obj) {
	// 				if (isObjectOrArray(obj[key])) {
	// 					if (Array.isArray(obj[key])) {
	// 						obj[key] = obj[key].sort((a, b) => {
	// 							return a.order - b.order;
	// 						});
	// 					}
	// 					if (shouldExit) {
	// 						continue;
	// 					} else {
	// 						findImageUrls(obj[key]);
	// 						shouldExit = false;
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return arr2;
	// }
	// findImageUrls(pageData);
	// if (!browser) {
	// 	fs.writeFileSync('./page-data.json', JSON.stringify(pageData));
	// }

	return {
		pagesData: pageData,
		data_loaded: true,
		pageContent: {
			textPages
		}
	};
}
