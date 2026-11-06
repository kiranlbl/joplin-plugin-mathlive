import { MathfieldElement } from 'mathlive';
if (!customElements.get('math-field')) {
	customElements.define('math-field', MathfieldElement);
}

const mf = document.getElementById('mf') as MathfieldElement;
mf.fontsDirectory = null;
mf.soundsDirectory = null;
mf.addEventListener('beforeinput', (ev: InputEvent) => {
	if (ev.inputType === 'insertLineBreak') {
		document.querySelector('form')?.requestSubmit();
	}
});
const MFE = (window.MathLive && window.MathLive.MathfieldElement)
    || window.MathfieldElement;

if (MFE) {
    MFE.fontsDirectory = null;
    MFE.soundsDirectory = null;
    MFE.virtualKeyboardMode = 'off'; // see #2
} else {
    console.error('MathLive config: MathfieldElement not found');
}
const latex = document.getElementById('latex') as HTMLInputElement;

const sync = () => {
	latex.value = mf.value;
};

sync();
mf.addEventListener('input', sync);
