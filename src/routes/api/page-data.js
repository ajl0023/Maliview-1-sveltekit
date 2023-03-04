import { externalFetch } from 'src/hooks';
import fs from 'fs';
export async function post({ request }) {
	const urls = await request.json();
	fs.writeFileSync('/test.txt', 'hi');
	return {
		status: 200
	};
}
