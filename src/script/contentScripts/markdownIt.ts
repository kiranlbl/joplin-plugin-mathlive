declare const webviewApi: {
	postMessage: (contentScriptId: string, message: any) => Promise<any>;
};

const CONTENT_SCRIPT_ID = 'katexInterceptor';
const INSTALL_FLAG = Symbol('myKatexInterceptor');

// TinyMCE expects a dialog object back from windowManager.open
const NOOP_DIALOG = { close() {}, setData() {}, disable() {}, enable() {}, redial() {} } as any;

let currentEditable: HTMLElement | null = null;
let currentSource: HTMLElement | null = null;

function isLatexSource(source: Element | null): boolean {
	if (!source) return false;
	// '$' or '$$' — this also excludes ```katex code fences
	return (source.getAttribute('data-joplin-source-open') ?? '').trimStart().startsWith('$');
}

async function handleKatexEdit(editor: any) {
	const latex = currentSource?.textContent ?? '';

	const result = await webviewApi.postMessage(CONTENT_SCRIPT_ID, {type: 'latexDialog', text: latex,});
	if (!result) return;

	if (!currentEditable || !currentEditable.isConnected) {
		await webviewApi.postMessage(CONTENT_SCRIPT_ID, { type: 'insertLatex', latex: result });
		return;
	}

	editor.focus();
	editor.selection.select(currentEditable);
	await webviewApi.postMessage(CONTENT_SCRIPT_ID, { type: 'insertLatex', latex: result });
}

function install(editor: any): boolean {
	if (!editor || typeof webviewApi === 'undefined') return false; // wait for BOTH
	if (editor[INSTALL_FLAG]) return true;
	editor[INSTALL_FLAG] = true;

	const originalOpen = editor.windowManager.open;

	editor.windowManager.open = function (this: any, ...args: any[]) {
		const config = args[0] ?? {};

		if (config?.initialData?.languageInput === 'katex') {
			const node = editor.selection.getNode() as HTMLElement | null;
			currentEditable = node?.closest?.('.joplin-editable') ?? null;
			currentSource = currentEditable?.querySelector('.joplin-source') ?? null;

			if (isLatexSource(currentSource)) {
				void handleKatexEdit(editor);
				return NOOP_DIALOG; // suppress the default katex dialog
			}
		}

		return originalOpen.apply(this, args);
	};

	return true;
}

const parentWindow = window.parent as any;

function tryInstall(): boolean {
	const editor = parentWindow.tinymce?.activeEditor ?? parentWindow.tinymce?.editors?.[0];
	return install(editor);
}

if (!tryInstall()) {
	parentWindow.tinymce?.on?.('AddEditor', (e: any) => install(e.editor));
	let tries = 0;
	const timer = setInterval(() => {
		if (tryInstall() || ++tries > 60) clearInterval(timer);
	}, 500);
}