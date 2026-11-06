import { MathfieldElement } from 'mathlive';

const mf_container = document.getElementById('mf-container');
const platform = mf_container?.dataset.platform as 'desktop' | 'mobile';
const initiallatex = mf_container?.dataset.latex;


MathfieldElement.fontsDirectory = null;
MathfieldElement.soundsDirectory = null;
if (!customElements.get('math-field')) {
	customElements.define('math-field', MathfieldElement);
}

const mf = new MathfieldElement();
mf.setAttribute('math-virtual-keyboard-policy', 'sandboxed');
mf.style.fontSize = '1.5rem';
mf.style.width = '100%';
mf.style.boxSizing = 'border-box';
mf.value = initiallatex;
mf_container?.appendChild(mf);



mf.addEventListener('beforeinput', (ev: InputEvent) => {
	if (ev.inputType === 'insertLineBreak') {
		document.querySelector('form')?.requestSubmit();
	}
});

const latex = document.getElementById('latex') as HTMLInputElement;

const sync = () => {
	latex.value = mf.value;
};

sync();
mf.addEventListener('input', sync);
