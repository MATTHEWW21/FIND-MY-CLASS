(function () {
    const rol = localStorage.getItem('userRole') || '';
    const vista = localStorage.getItem('userVista') || 'completa';
    const simplificada = rol === 'colaborador' && vista === 'simplificada';

    document.documentElement.dataset.role = rol;
    document.documentElement.dataset.vista = simplificada ? 'simplificada' : 'completa';

    const pagina = location.pathname.split('/').pop();
    const sinFeed = ['feed.html', 'publicacion.html', 'nueva-publicacion.html', 'mensajes.html'];
    if ((simplificada || rol === 'visitante') && sinFeed.includes(pagina)) {
        location.replace('mapa.html');
    }

    if (simplificada || rol === 'visitante') {
        document.addEventListener('DOMContentLoaded', () => {
            const inicio = document.getElementById('nav-inicio');
            if (inicio) inicio.setAttribute('href', 'mapa.html');
        });
    }
})();