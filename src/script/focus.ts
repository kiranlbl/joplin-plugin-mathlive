/* this script is to ensure Mathfield is focused, and that it starts at the first character, not the last. 
It waits 0.2 seconds first to ensure the Mathfield has loaded.*/
setTimeout(() => {
    const mf = document.getElementById('mf') as any;
    if (mf) {
        mf.focus();
        mf.position = -1;
    }
}, 200);