document.addEventListener('DOMContentLoaded', () => {
    if (!requerirSesion()) return;

    const LOADING_TIME = 2500;

    setTimeout(() => {
        window.location.href = rutaHome();
    }, LOADING_TIME);
});
