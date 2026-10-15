document.addEventListener('DOMContentLoaded', () => {
    if (!requerirSesion()) return;

    // Simular tiempo de carga de la interfaz / endpoints
    const LOADING_TIME = 2500; // 2.5 segundos

    setTimeout(() => {
        // Estudiante y colaborador (vista completa) -> feed.
        // Colaborador con vista simplificada -> directo al mapa.
        window.location.href = rutaHome();
    }, LOADING_TIME);
});
