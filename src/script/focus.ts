setTimeout(() => {
    const mf = document.getElementById('mf') as any;
    if (mf) {
        mf.focus();
        mf.position = -1;
    }
}, 200);