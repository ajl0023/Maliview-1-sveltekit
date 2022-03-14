import { hostName } from './host';

export const handle = async ({ event, resolve }) => {
	//request.clone

	if (event.request.url.startsWith('http://localhost:3001/api2')) {
		const new_request = new Request(
			event.request.url.replace('http://localhost:3001/api2', hostName),
			event.request
		);

		const response = await fetch(new_request);

		return response;
	}

	const response = await resolve(event, {
		ssr: false
	});

	return response;
};

export async function externalFetch(request) {
	const new_url = hostName + request;

	return fetch(new_url);
}
