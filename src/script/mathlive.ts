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
mf.style.display = 'inline-block';
if (platform === 'desktop') {
  mf.style.width = 'max-content';
  mf.style.minWidth = '30rem';
} else {
  mf.style.width = '100%';       // mobile: fill, scroll internally
}
mf.style.boxSizing = 'border-box';
mf.style.verticalAlign = 'middle';   // if it sits inline with other text
mf.value = initiallatex;
mf_container?.appendChild(mf);
mf.focus();

mf.addEventListener('keydown', (ev) => {
	if (ev.key === 'Enter' && !ev.ctrlKey && !ev.metaKey) {
    	ev.preventDefault();   // MathLive bails out on defaultPrevented events [cite:048ef113-1]
    	ev.stopPropagation();  // never reaches MathLive's internal handler → no new line
    	document.querySelector('form')?.requestSubmit();
	}
}, true); // ← capture: must run before MathLive's shadow-DOM handlers

// Capture latex from editor in "latex" form entry.
const latex = document.getElementById('latex') as HTMLInputElement; 
const sync = () => {
	latex.value = mf.value;
};
sync();
mf.addEventListener('input', sync);
