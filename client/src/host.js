import { dev } from '$app/env';
let host;
let is_host = false;
if (is_host) {
	host = 'http://localhost:8080';
} else {
	host = 'https://test12312312356415616.store';
}
export const hostName = host;
export const mock_dev = false;
