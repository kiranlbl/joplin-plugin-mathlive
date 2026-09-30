import { MathfieldElement } from 'mathlive';

if (!customElements.get('math-field')) {
	customElements.define('math-field', MathfieldElement);
}

const mf = document.getElementById('mf') as MathfieldElement;
mf.addEventListener('beforeinput', (ev: InputEvent) => {
	console.log(ev.inputType);
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
