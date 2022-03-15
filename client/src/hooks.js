import { hostName } from './host';
import path from 'path';
import cookie from 'cookie';
import axios from 'axios';

export const handle = async ({ event, resolve }) => {
	//request.clone
	const base = event.url.origin;

	if (event.request.url.startsWith(`${base}/api2`)) {
		const has_cookie = event.request.headers.get('cookie');
		const new_cookie = cookie.serialize('collection', 'maliview', {
			path: '/'
		});
		if (!has_cookie || !cookie.parse(has_cookie).collection) {
			event.request.headers.append('cookie', new_cookie);
		}

		const new_request = new Request(
			event.request.url.replace(`${base}/api2`, hostName),
			event.request
		);

		const response = await fetch(new_request);

		return response;
	}

	const response = await resolve(event, {});

	return response;
};

export async function externalFetch(request) {
	const new_url = hostName + request;

	return fetch(new_url);
}
