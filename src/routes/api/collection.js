import cookie from 'cookie';
export async function get({ request }) {
	// `params.id` comes from [id].js
	const has_cookies = request.headers.get('cookie');
	if (has_cookies) {
		const cookies = has_cookies;
		const collection = cookie.parse(cookies);
		if (collection.collection) {
			return {
				status: 200
			};
		} else {
			return {
				status: 403
			};
		}
	} else {
		return {
			status: 403
		};
	}
}
export async function post({ request }) {
	// `params.id` comes from [id].js

	const new_cookie = cookie.serialize('collection', 'maliview', {
		path: '/'
	});

	return {
		headers: {
			'set-cookie': [new_cookie]
		}
	};
}
