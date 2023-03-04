import { hostName, mock_dev } from './host';
import path from 'path';
import cookie from 'cookie';
import axios from 'axios';

export const handle = async ({ event, resolve }) => {
	//request.clone
	const base = event.url.origin;

	if (event.request.url.startsWith(`${base}/api2`)) {
		if (!mock_dev || !dev) {
			event.request.headers.set('host', 'test12312312356415616.store');
		}
		const headers = new Headers(event.request.headers);
		const has_cookie = event.request.headers.get('cookie');
		const new_cookie = cookie.serialize('collection', 'maliview');

		const auth_cookie = cookie.serialize('client_token', import.meta.env.VITE_CLIENT_TOKEN);
		const res_cookies = auth_cookie + '; ' + new_cookie;

		headers.set('cookie', res_cookies);
		const serialized_headers = Object.fromEntries(headers.entries());

		const new_request = new Request(event.request.url.replace(`${base}/api2`, hostName), {
			headers: serialized_headers
		});

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
