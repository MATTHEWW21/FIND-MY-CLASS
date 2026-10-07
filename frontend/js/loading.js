document.addEventListener('DOMContentLoaded', () => {
    // Simular tiempo de carga de la interfaz / endpoints
    const LOADING_TIME = 2500; // 2.5 segundos

    setTimeout(() => {
        // Redirigir a la vista principal del mapa
        window.location.href = 'feed.html';
    }, LOADING_TIME);
});