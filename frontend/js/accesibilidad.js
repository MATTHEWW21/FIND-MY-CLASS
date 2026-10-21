// Ayudas para lectores de pantalla (TalkBack) y teclado. Se carga al final de mapa.html y mi_perfil.html.
// No cambia lo que se ve: agrega roles, estados y manejo del foco a lo que ya existe.
document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // Observa un cambio de clase y llama a fn
    function alCambiarClase(el, fn) {
        if (!el) return;
        new MutationObserver(fn).observe(el, { attributes: true, attributeFilter: ['class'] });
    }

    // ---------- Estrellas: botón con estado y Enter/espacio ----------
    document.querySelectorAll('.star-btn').forEach((s) => {
        s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.click(); } });
        alCambiarClase(s, () => s.setAttribute('aria-pressed', s.classList.contains('selected') ? 'true' : 'false'));
    });

    // ---------- Categorías del reporte: cuál está elegida ----------
    document.querySelectorAll('.category-chip').forEach((c) => {
        alCambiarClase(c, () => c.setAttribute('aria-pressed', c.classList.contains('active') ? 'true' : 'false'));
    });

    // ---------- Paneles del mapa: diálogos que reciben el foco al aparecer ----------
    const PANELES = [
        { id: 'arrival-panel', nombre: 'Llegaste a tu destino', foco: '.arrival-title' },
        { id: 'feedback-panel', nombre: 'Califica tu caminata', foco: '.badge-title' },
        { id: 'report-panel', nombre: 'Reportar incidencia', foco: 'h2' },
    ];
    PANELES.forEach((p) => {
        const panel = $(p.id);
        if (!panel) return;
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', p.nombre);
        let estabaOculto = panel.classList.contains('hidden');
        alCambiarClase(panel, () => {
            const oculto = panel.classList.contains('hidden');
            if (estabaOculto && !oculto) {
                const titulo = panel.querySelector(p.foco);
                if (titulo) { titulo.tabIndex = -1; setTimeout(() => titulo.focus({ preventScroll: true }), 350); }
            }
            estabaOculto = oculto;
        });
    });
    const rutaPanel = $('route-panel');
    if (rutaPanel) { rutaPanel.setAttribute('role', 'region'); rutaPanel.setAttribute('aria-label', 'Ruta al destino'); }

    // ---------- Buscador: Escape lo cierra ----------
    const buscador = $('search-panel');
    if (buscador) {
        buscador.setAttribute('role', 'dialog');
        buscador.setAttribute('aria-label', 'Buscador de lugares');
        buscador.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const x = $('btn-close-search'); if (x) x.click(); } });
    }

    // ---------- Reporte: poner el pin con tu ubicación (el mini mapa no se puede usar sin ver) ----------
    const cajaMapa = $('report-map-box');
    if (cajaMapa && !$('btn-pin-ubicacion')) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.id = 'btn-pin-ubicacion'; btn.className = 'btn-pin-ubicacion';
        btn.textContent = '📍 Usar mi ubicación actual para el pin';
        const estado = document.createElement('p');
        estado.className = 'pin-ubicacion-estado'; estado.setAttribute('role', 'status');
        cajaMapa.insertAdjacentElement('afterend', estado);
        cajaMapa.insertAdjacentElement('afterend', btn);
        btn.addEventListener('click', () => {
            const decir = (t) => { estado.textContent = t; };
            if (!navigator.geolocation) return decir('Tu navegador no permite usar la ubicación.');
            decir('Buscando tu ubicación…');
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                const M = window.FMCMapa;
                if (M && M.dentroDelCampus && !M.dentroDelCampus(lat, lng)) return decir('Parece que no estás dentro del campus, así que el pin se queda donde estaba.');
                if (M && M.ponerPinReporte && M.ponerPinReporte(lat, lng)) decir('Listo, el pin quedó en tu ubicación actual.');
                else decir('No se pudo colocar el pin. Intenta de nuevo.');
            }, () => decir('No se pudo obtener tu ubicación. Revisa que el permiso de ubicación esté activo.'),
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 });
        });
    }

    // ---------- Ajustes del perfil: diálogo con foco atrapado, Escape y regreso del foco ----------
    const fondo = $('ajustes-fondo');
    if (fondo) {
        let previo = null;
        const principal = document.querySelector('main');
        const focoDentro = () => Array.from(fondo.querySelectorAll('button, input, a[href], textarea, select'))
            .filter((x) => !x.disabled && x.getClientRects().length > 0);
        let abierto = !fondo.classList.contains('hidden');
        alCambiarClase(fondo, () => {
            const ahora = !fondo.classList.contains('hidden');
            if (ahora === abierto) return;
            abierto = ahora;
            if (ahora) {
                previo = document.activeElement;
                if (principal) principal.setAttribute('inert', '');
                const cerrar = $('ajustes-cerrar');
                if (cerrar) cerrar.focus();
            } else {
                if (principal) principal.removeAttribute('inert');
                if (previo && previo.focus) previo.focus();
            }
        });
        fondo.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { fondo.classList.add('hidden'); return; }
            if (e.key !== 'Tab') return;
            const lista = focoDentro();
            if (!lista.length) return;
            const primero = lista[0], ultimo = lista[lista.length - 1];
            if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
        });
    }
});
