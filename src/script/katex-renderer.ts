declare const webviewApi: {
	postMessage: (
		contentScriptId: string,
		message: any
	) => Promise<any>;
};
let currentEditable: HTMLElement | null = null;
let currentSource: HTMLElement | null = null;
function install() {
	const editor = (window.parent as any).tinymce?.activeEditor;
	const katexblockid: string = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
	if (!editor) {
		return false;
	}

	if (editor.__myKatexInterceptorInstalled) {
		return true;
	}

	editor.__myKatexInterceptorInstalled = true;

	const originalOpen = editor.windowManager.open;

	editor.windowManager.open = function(...args: any[]) {
		const config = args[0];

		if (
			config?.title === 'Edit' &&
			config?.initialData?.languageInput === 'katex'
		) {
			const latex = config.initialData.codeTextArea || '';
			const selectedNode = editor.selection.getNode();

			currentEditable = (selectedNode as Element)?.closest('.joplin-editable') as HTMLElement | null;
			currentSource = currentEditable?.querySelector('.joplin-source') as HTMLElement | null;
			editor.selection.select(currentEditable);
			editor.insertContent(`<span class="joplin-editable" contenteditable="false"><span
			class="joplin-source"
			hidden
			data-joplin-language="katex"
			data-joplin-source-open="$"
			data-joplin-source-close="$"
			>\\clap{\\color{transparent}{TemporaryMarkerForMathLivePlugin${katexblockid}}}${latex}\\clap{\\color{transparent}{TemporaryMarkerForMathLivePlugin${katexblockid}}}</span>
			</span>
			`);	
			editor.nodeChanged();


			webviewApi.postMessage('katexInterceptor', {
				type: 'latex',
				text: latex,
				katexblockid: katexblockid,
			});

			return;
		}

		return originalOpen.apply(this, args);
	};
	return true;
};

const timer = setInterval(() => {
	if (install()) {
		clearInterval(timer);
	}
}, 500);
