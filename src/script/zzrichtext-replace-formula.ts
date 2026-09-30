async function replaceNearestMath(replacement: string) {
    console.log("Replacing math...");
    console.log(document.activeElement);
    console.log(window.getSelection());
    const selection = window.getSelection();

    if (!selection) {
        console.log("no selection error");
        return false;
    }
    if (selection.rangeCount === 0) {
        console.log("no range count error");
        return false;
    }

    const caret = selection.getRangeAt(0);

    if (!caret.collapsed) {
        return false;
    }

    const editor = (
        caret.startContainer instanceof Element
            ? caret.startContainer
            : caret.startContainer.parentElement
    )?.closest('[contenteditable="true"]');

    if (!editor) return false;

    const mathElements = [
        ...editor.querySelectorAll('.katex')
    ];

    let nearest: Element | null = null;

    for (const math of mathElements) {
        const mathRange = document.createRange();
        mathRange.selectNode(math);

        // Math is entirely before the caret.
        if (mathRange.compareBoundaryPoints(
            Range.END_TO_START,
            caret
        ) <= 0) {
            nearest = math;
        }
    }

    if (!nearest) return false;

    // Recover the original LaTeX.
    const latex = nearest.querySelector(
        'annotation[encoding="application/x-tex"]'
    )?.textContent ?? '';

    console.log('Nearest LaTeX:', latex);

    // Select the rendered equation.
    const range = document.createRange();
    range.selectNode(nearest);

    selection.removeAllRanges();
    selection.addRange(range);

    // Replace it.
    document.execCommand(
        'insertText',
        false,
        replacement
    );

    return true;
}