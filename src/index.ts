import joplin from 'api';
import { ToolbarButtonLocation, ContentScriptType, MenuItemLocation } from 'api/types';

joplin.plugins.register({
	onStart: async function() {
		const { platform } = await joplin.versionInfo();
		console.log(platform);
		// Function to open dialog.
		async function mathlivedialogue(initiallatex: string, editortype?: string) {
			const startTime = Date.now();
			const escapeHtml = (s: string) => // latex to be put in dialog
				s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
				.replace(/>/g, '&gt;').replace(/"/g, '&quot;');
			await joplin.views.dialogs.setHtml(dialog, `
				<form name="equationForm">
				<div id="mf-container"
				data-platform="${platform}"
				data-latex="${escapeHtml(initiallatex)}"
				></div>
				<input type="hidden" id="latex" name="latex" />
				</form>
			`);	
			const result = await joplin.views.dialogs.open(dialog);
			if (!result) return;
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 2400 - elapsed);
			if (remaining > 0) {
				await new Promise(resolve => setTimeout(resolve, remaining));
			}
			if ((result.id == 'ok' || result.id == 'submit') && result.formData?.equationForm?.latex) {
				const latex = result.formData.equationForm.latex;
				if (editortype == 'richtext') {
					return `$${latex}$` // This return is used in      await joplin.contentScripts.onMessage('katexInterceptor',
				} else {
					await joplin.commands.execute(
						'insertText',
						`$${latex}$`
					);
				}
			}

		}

		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			'katexInterceptor',
			'./script/contentScripts/markdownItScriptLoader.js'
		);
		await joplin.contentScripts.onMessage(
			'katexInterceptor',
			async (message: any) => {
				if (message.type === 'latexDialog') {
					return await mathlivedialogue(message.text, "richtext"); // The return is used in mathlive.ts, which will then send a 'insertLatex' message.
				}
				if (message.type === 'insertLatex') {
					await joplin.commands.execute(
						'insertText',
						message.latex
					);
				}
			}
		);
		await joplin.commands.register({
			name: 'mathLive',
			label: 'MathLive Equation',
			iconName: 'fas fa-square-root-alt',
			execute: async () => {
				const selectedText = await joplin.commands.execute('selectedText') as string;
				
				//Open the math editor on the selected text dialog with the $ stripped from the ends.
				mathlivedialogue(selectedText.replace(/^\$+|\$+$/g, ''));
			},
		});
		await joplin.views.menuItems.create(
			'mathLiveMenuItem',
			'mathLive',
			MenuItemLocation.Tools,
			{
				accelerator: 'CmdOrCtrl+Alt+M',
			},
		);
		async function updateNoteView() {
			// Get the current note from the workspace.
			const note = await joplin.workspace.selectedNote();
		}
		await joplin.workspace.onNoteSelectionChange(() => {
			updateNoteView();
		});
		await joplin.workspace.onNoteChange(() => {
			updateNoteView();
		});
		updateNoteView();
		// Create dialog and initially attach scripts.
		const dialog = await joplin.views.dialogs.create('mathLiveDialog');
		await joplin.views.dialogs.setHtml(dialog, `
			<form name="equationForm">
			<div id="mf-container"
			data-platform="${platform}"
			data-latex=""
			></div>
			<input type="hidden" id="latex" name="latex" />
			</form>
		`);	
		await joplin.views.dialogs.addScript(dialog, './script/mathlive-fonts.css');
		await joplin.views.dialogs.addScript(dialog, './script/mathlive.js');
		await joplin.views.dialogs.addScript(dialog, './script/focus.js');
		if (platform == "desktop") {
			await joplin.views.dialogs.addScript(dialog, './script/dialog.css');
		} else {
			await joplin.views.dialogs.addScript(dialog, './script/dialog-mobile.css');
		}
		await joplin.views.dialogs.setButtons(dialog, [
			{ id: 'ok', title: 'OK' },
			{ id: 'cancel', title: 'Cancel' },
		]);

		await joplin.views.toolbarButtons.create(
			'mathLiveButton',
			'mathLive',
			ToolbarButtonLocation.EditorToolbar,
		);
	},
});
