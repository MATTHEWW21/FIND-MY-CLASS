document.addEventListener('DOMContentLoaded', () => {
    const volver = document.getElementById('volver');
    volver.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.history.length > 1) window.history.back();
        else window.close();
    });
});
