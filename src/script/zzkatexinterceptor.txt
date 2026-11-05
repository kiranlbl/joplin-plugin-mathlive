export default function(context: any) {
	return {
		plugin: function(markdownIt: any) {
			
		},

		assets: () => {
			return [
				{ name: './katex-renderer.js'},
			];
		},
	};
}
