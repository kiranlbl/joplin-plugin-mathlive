import joplin from 'api';
import { ToolbarButtonLocation, ContentScriptType, MenuItemLocation } from 'api/types';
import { MathfieldElement } from 'mathlive';
if (!customElements.get('math-field')) {
	customElements.define('math-field', MathfieldElement);
}

joplin.plugins.register({
	onStart: async function() {
		async function clearTemporaryMarkers() {
			const note = await joplin.workspace.selectedNote();

			if (!note) {
				return;
			}

			const markerRegex =
				/\\clap\{\\color\{transparent\}\{TemporaryMarkerForMathLivePlugin\d{5}\}\}/g;

			const newBody = note.body.replace(markerRegex, '');

			if (newBody !== note.body) {
				await joplin.data.put(
					['notes', note.id],
					null,
					{ body: newBody }
				);
			}
		}
		async function mathlivedialogue(initiallatex: string, editortype?: string, katexblockid?:string) {
			const startTime = Date.now();
			await joplin.views.dialogs.setHtml(dialog, `
				<form name="equationForm">
				<math-field id="mf" autofocus math-virtual-keyboard-policy="sandboxed" 
				style="
					font-size: 1.5rem;
					width: 100%;
					box-sizing: border-box;
				">${initiallatex}</math-field>
				<input type="hidden" id="latex" name="latex" />
				</form>
			`);	
			const result = await joplin.views.dialogs.open(dialog);
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 1500 - elapsed);
			if (remaining > 0) {
				await new Promise(resolve => setTimeout(resolve, remaining));
			}
			if (result.id == 'ok' || result.id == 'submit') {
				const latex = result.formData.equationForm.latex;
				if (editortype == 'richtext') {
					const marker = String.raw`\clap{\color{transparent}{TemporaryMarkerForMathLivePlugin${katexblockid}}}`;

					function escapeRegex(s: string): string {
						return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					}

					const regex = new RegExp(
						`\\$${escapeRegex(marker)}[\\s\\S]*?${escapeRegex(marker)}\\$`,
						'g'
					);
					// Get the currently selected note
					const note = await joplin.workspace.selectedNote();

					if (!note) {
						return;
					}

					// Replace the marked LaTeX with the new LaTeX from MathLive
					const newBody = note.body.replace(
						regex,
						() => `$${latex}$`
					);

					// Save only if something changed
					if (newBody !== note.body) {
						await joplin.data.put(
							['notes', note.id],
							null,
							{ body: newBody }
						);
					}
					clearTemporaryMarkers();

				} else {
					await joplin.commands.execute(
						'insertText',
						`$${latex}$`
					);
					clearTemporaryMarkers();
				}
			} else {
				clearTemporaryMarkers();
			}

		}

		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			'katexInterceptor',
			'./script/katexinterceptor.js'
		);
		await joplin.contentScripts.onMessage(
			'katexInterceptor',
			async (message: any) => {

				if (message.type === 'latex') {
					mathlivedialogue(message.text, "richtext", message.katexblockid);
				}
			}
		);
		await joplin.commands.register({
			name: 'mathLive',
			label: 'MathLive Equation',
			iconName: 'fas fa-square-root-alt',
			execute: async () => {
				const selectedText = await joplin.commands.execute('selectedText') as string;
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
		const dialog = await joplin.views.dialogs.create('mathLiveDialog');
		await joplin.views.dialogs.setHtml(dialog, `
			<form name="equationForm">
			<math-field id="mf" autofocus math-virtual-keyboard-policy="sandboxed" 
			style="
				font-size: 1.5rem;
				width: 100%;
				box-sizing: border-box;
			"></math-field>
			<input type="hidden" id="latex" name="latex" />
			</form>
	`);	
		await joplin.views.dialogs.addScript(dialog, './script/mathlive.js');
		await joplin.views.dialogs.addScript(dialog, './script/focus.js');
		await joplin.views.dialogs.addScript(dialog, './script/dialog.css');
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
