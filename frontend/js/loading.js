document.addEventListener('DOMContentLoaded', () => {
    if (!requerirSesion()) return;

    const LOADING_TIME = 2500; // 2.5 segundos

    setTimeout(() => {
        window.location.href = rutaHome();
    }, LOADING_TIME);
});
