// This just loads markdownIt.ts, whichs acts right in the tinyMCE iframe.

export default function(context: any) {
	return {
		plugin: function(markdownIt: any) {
			
		},

		assets: () => {
			return [
				{ name: './markdownIt.js'},
			];
		},
	};
}
