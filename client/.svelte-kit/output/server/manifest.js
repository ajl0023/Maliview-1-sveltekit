export const manifest = {
	appDir: "_app",
	assets: new Set(["By Apel Design Black.png","By Apel Design White.png","homeLogo.png","horse-left.jpg","horse-right.jpg","horses.jpg","logo.inline.svg","Maliview Left.png","Maliview Right.png","mobile-logo.png","playButton.png","z-caroArrow.png"]),
	mimeTypes: {".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml"},
	_: {
		entry: {"file":"start-72cff8ad.js","js":["start-72cff8ad.js","chunks/vendor-98df78f5.js"],"css":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js')
		],
		routes: [
			{
				type: 'page',
				key: "",
				pattern: /^\/$/,
				params: null,
				path: "/",
				shadow: null,
				a: [0,2],
				b: [1]
			},
			{
				type: 'endpoint',
				pattern: /^\/api\/collection\/?$/,
				params: null,
				load: () => import('./entries/endpoints/api/collection.js')
			},
			{
				type: 'endpoint',
				pattern: /^\/api\/page-data\/?$/,
				params: null,
				load: () => import('./entries/endpoints/api/page-data.js')
			}
		]
	}
};
