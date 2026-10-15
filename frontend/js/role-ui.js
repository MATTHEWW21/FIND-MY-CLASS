// role-ui.js - marca el <body> con el rol y la vista del usuario y protege pantallas.
// Cárgalo en feed.html, mapa.html, mi_perfil.html, etc. (después de api.js, en el <head> con defer
// o al final del body). El CSS (css/role-ui.css) hace el resto: oculta botones según data-role/data-vista.
(function () {
    const rol = localStorage.getItem('userRole') || '';
    const vista = localStorage.getItem('userVista') || 'completa';
    const simplificada = rol === 'colaborador' && vista === 'simplificada';

    document.documentElement.dataset.role = rol;
    document.documentElement.dataset.vista = simplificada ? 'simplificada' : 'completa';

    // Páginas que la vista simplificada y el visitante NO tienen: se redirige al mapa
    const pagina = location.pathname.split('/').pop();
    const sinFeed = ['feed.html', 'publicacion.html', 'mensajes.html'];
    if ((simplificada || rol === 'visitante') && sinFeed.includes(pagina)) {
        location.replace('mapa.html');
    }

    // El botón INICIO de la barra inferior lleva al mapa (no hay feed en estas vistas)
    if (simplificada || rol === 'visitante') {
        document.addEventListener('DOMContentLoaded', () => {
            const inicio = document.getElementById('nav-inicio');
            if (inicio) inicio.setAttribute('href', 'mapa.html');
        });
    }
})();