export default function(context: any) {
	return {
		plugin: function(markdownIt: any) {
			// You can leave this empty if you don't need to modify
			// the Markdown itself.
		},

		assets: () => {
			return [
				{ name: './katex-renderer.js'},
			];
		},
	};
}
