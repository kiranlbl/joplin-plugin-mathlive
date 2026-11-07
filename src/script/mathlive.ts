import { MathfieldElement } from 'mathlive';

const mf_container = document.getElementById('mf-container');
const platform = mf_container?.dataset.platform as 'desktop' | 'mobile';
const initiallatex = mf_container?.dataset.latex;

// To avoid errors on mobile, disable fonts and sounds directory. Fonts are loaded in base64 anyways from mathlive-fonts.css, and sounds are unneeded.
MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;
if (!customElements.get('math-field')) {
	customElements.define('math-field', MathfieldElement);
}

// Create, style and autofocus Mathfield element
const mf = new MathfieldElement();
mf.setAttribute('math-virtual-keyboard-policy', 'sandboxed');
mf.style.fontSize = '1.5rem';
mf.style.width = '100%';
mf.style.boxSizing = 'border-box';
mf.value = initiallatex;
mf_container?.appendChild(mf);
mf.focus();



mf.addEventListener('beforeinput', (ev: InputEvent) => {   // If enter is pressed, submit the dialog.
	if (ev.inputType === 'insertLineBreak') {
		document.querySelector('form')?.requestSubmit();
	}
});

// Capture latex from editor in "latex" form entry.
const latex = document.getElementById('latex') as HTMLInputElement; 
const sync = () => {
	latex.value = mf.value;
};
sync();
mf.addEventListener('input', sync);
