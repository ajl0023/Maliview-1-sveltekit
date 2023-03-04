<script>
	import '$lib/styles/global.scss';

	import '$lib/styles/bulma.prefixed.css';

	export async function load({ fetch }) {
		// if (browser) {
		// 	const has_collection = await fetch('/api/collection', {
		// 		method: 'get'
		// 	});
		// 	if (has_collection.status === 403) {
		// 		await fetch('/api/collection', {
		// 			method: 'POST'
		// 		});
		// 	}
		// }

		return {};
	}
</script>

<slot />
