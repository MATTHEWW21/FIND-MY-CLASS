// Accesibilidad común para feed, mensajes, nueva publicación, registro y preferencias.
// No cambia lo que se ve: agrega roles, nombres, estados y manejo del foco a lo que ya existe, para teclado y lector de pantalla (TalkBack).
(function () {
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const $ = (id) => document.getElementById(id);
    const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    const texto = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

    // ---------- 1) Controles que solo respondían al toque: ahora son botones de verdad ----------
    function comoBoton(el, nombre) {
        if (!el.getAttribute('role')) el.setAttribute('role', 'button');
        if (el.tabIndex < 0) el.tabIndex = 0;
        if (nombre) el.setAttribute('aria-label', nombre);
        if (!el._a11yTecla) {
            el._a11yTecla = true;
            el.addEventListener('keydown', (e) => {
                if (e.target === el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); el.click(); }
            });
        }
    }

    // Opciones de una lista (tipo de actividad): grupo de opciones con una elegida
    function comoOpciones(lista, nombreGrupo) {
        lista.setAttribute('role', 'radiogroup');
        lista.setAttribute('aria-label', nombreGrupo);
        const items = Array.from(lista.querySelectorAll('.option-item'));
        items.forEach((li, i) => {
            li.setAttribute('role', 'radio');
            li.tabIndex = li.classList.contains('selected') ? 0 : -1;
            li.setAttribute('aria-checked', li.classList.contains('selected') ? 'true' : 'false');
            li.setAttribute('aria-label', texto(li));
            if (!li._a11yTecla) {
                li._a11yTecla = true;
                li.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
                    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const s = items[(i + 1) % items.length]; s.focus(); }
                    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const s = items[(i - 1 + items.length) % items.length]; s.focus(); }
                });
                new MutationObserver(() => {
                    const sel = li.classList.contains('selected');
                    li.setAttribute('aria-checked', sel ? 'true' : 'false');
                    li.tabIndex = sel ? 0 : -1;
                }).observe(li, { attributes: true, attributeFilter: ['class'] });
            }
        });
    }

    // Botones que se "prenden": cuál está elegido se dice con aria-pressed, no solo con el color
    function conEstado(btn, claseActiva) {
        const poner = () => btn.setAttribute('aria-pressed', btn.classList.contains(claseActiva) ? 'true' : 'false');
        poner();
        if (!btn._a11yObs) {
            btn._a11yObs = true;
            new MutationObserver(poner).observe(btn, { attributes: true, attributeFilter: ['class'] });
        }
    }

    function mejorar() {
        // Carrusel de amigos y "Nuevo chat" (mensajes)
        const nuevo = $('nuevo-chat');
        if (nuevo) comoBoton(nuevo, 'Nuevo chat: buscar personas y ver solicitudes de amistad');
        document.querySelectorAll('.story-item[data-id]').forEach((it) => {
            // El nombre sale del texto visible ("Ana Pérez"); las iniciales y el globito de la cuenta no se leen como nombre.
            // Los mensajes sin leer se dicen aparte, como descripción.
            const ini = it.querySelector('.avatar-iniciales'); if (ini) ini.setAttribute('aria-hidden', 'true');
            const globo = it.querySelector('.story-badge'); if (globo) globo.setAttribute('aria-hidden', 'true');
            const sin = texto(globo);
            if (sin) it.setAttribute('aria-description', sin === '1' ? '1 mensaje sin leer' : sin + ' mensajes sin leer'); else it.removeAttribute('aria-description');
            comoBoton(it, null);
            if (it.classList.contains('active')) it.setAttribute('aria-current', 'true'); else it.removeAttribute('aria-current');
        });
        // Filas de ubicación y privacidad (nueva publicación)
        document.querySelectorAll('.details-item.tocable').forEach((f) => comoBoton(f));
        // Lista de actividades (nueva publicación)
        document.querySelectorAll('.activity-options-list').forEach((l) => comoOpciones(l, 'Tipo de actividad'));
        // Sí / No de rutas accesibles (preferencias), SOS y selector de actividad (registro)
        document.querySelectorAll('.btn-option').forEach((b) => conEstado(b, 'active'));
        document.querySelectorAll('.sos-chip').forEach((b) => conEstado(b, 'active'));
        document.querySelectorAll('.selector-btn').forEach((b) => {
            if (b.title && !b.getAttribute('aria-label')) b.setAttribute('aria-label', b.title);
            conEstado(b, 'active');
        });
    }

    // ---------- 2) Ventanas emergentes: nombre, foco adentro, Tab que no se escapa, Escape y regreso del foco ----------
    const CIERRAN_CON_ESC = ['amigos-fondo', 'activity-modal'];   // el resto (SOS, resumen) se cierra solo con sus botones, a propósito
    const NOMBRES = { 'activity-modal': 'Seleccionar actividad', 'sos-overlay': 'SOS activado', 'medical-overlay': 'Ruta al consultorio médico', 'resumen-overlay': 'Resumen de tu recorrido' };
    const abiertas = new Map();   // fondo -> { opener, quitar }
    let contador = 0;

    function bloquearFondo(fondo, activo) {
        Array.from(document.body.children).forEach((n) => {
            if (n === fondo || n.contains(fondo) || /^(SCRIPT|LINK|STYLE)$/.test(n.tagName)) return;
            if (activo) { if (!n.hasAttribute('inert')) { n.setAttribute('inert', ''); n.dataset.a11yInert = '1'; } }
            else if (n.dataset.a11yInert) { n.removeAttribute('inert'); delete n.dataset.a11yInert; }
        });
    }

    function abrirDialogo(fondo, caja) {
        if (abiertas.has(fondo)) return;
        const opener = document.activeElement;
        const tieneRol = caja.getAttribute('role') === 'dialog' || caja.closest('[role="dialog"]') || caja.querySelector('[role="dialog"]');
        if (!tieneRol) {
            caja.setAttribute('role', 'dialog');
            caja.setAttribute('aria-modal', 'true');
        }
        const titulo = caja.querySelector('h1, h2, h3');
        if (!tieneRol) {
            if (!titulo && !NOMBRES[fondo.id]) caja.setAttribute('aria-label', 'Opciones');
            if (titulo) { if (!titulo.id) titulo.id = 'a11y-titulo-' + (++contador); caja.setAttribute('aria-labelledby', titulo.id); }
            else if (NOMBRES[fondo.id]) caja.setAttribute('aria-label', NOMBRES[fondo.id]);
        }
        bloquearFondo(fondo, true);
        const alTeclado = (e) => {
            if (e.key === 'Escape' && (CIERRAN_CON_ESC.includes(fondo.id) || fondo.classList.contains('pub-fondo'))) { e.preventDefault(); fondo.click(); return; }
            if (e.key !== 'Tab') return;
            const f = Array.from(fondo.querySelectorAll(FOCUSABLE)).filter(visible);
            if (!f.length) { e.preventDefault(); return; }
            const primero = f[0], ultimo = f[f.length - 1];
            if (e.shiftKey && (document.activeElement === primero || document.activeElement === titulo)) { e.preventDefault(); ultimo.focus(); }
            else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
        };
        document.addEventListener('keydown', alTeclado, true);
        abiertas.set(fondo, { opener, quitar: () => document.removeEventListener('keydown', alTeclado, true) });
        setTimeout(() => {
            const destino = titulo || Array.from(fondo.querySelectorAll(FOCUSABLE)).filter(visible)[0];
            if (destino) { if (destino === titulo) titulo.tabIndex = -1; destino.focus({ preventScroll: true }); }
        }, 60);
    }

    function cerrarDialogo(fondo) {
        const est = abiertas.get(fondo);
        if (!est) return;
        est.quitar();
        abiertas.delete(fondo);
        bloquearFondo(fondo, false);
        // Si queda otra ventana abierta debajo (p. ej. el editor tras cerrar el selector de amigos), esa pasa a ser la activa
        if (abiertas.size) { const ultima = Array.from(abiertas.keys()).pop(); bloquearFondo(ultima, true); }
        if (est.opener && document.contains(est.opener) && typeof est.opener.focus === 'function') est.opener.focus({ preventScroll: true });
    }

    // Ventanas que ya están en la página y se muestran quitando la clase "hidden"
    ['amigos-fondo', 'activity-modal', 'sos-overlay', 'medical-overlay', 'resumen-overlay'].forEach((id) => {
        const fondo = $(id);
        if (!fondo) return;
        const caja = fondo.querySelector('.amigos-hoja, .activity-popover, .sos-modal, .medical-modal, .resumen-modal') || fondo.firstElementChild || fondo;
        const revisar = () => { if (fondo.classList.contains('hidden')) cerrarDialogo(fondo); else abrirDialogo(fondo, caja); };
        new MutationObserver(revisar).observe(fondo, { attributes: true, attributeFilter: ['class'] });
        if (!fondo.classList.contains('hidden')) revisar();
    });

    // Hojas inferiores que se crean y se quitan con JavaScript (comentarios, menú, reportar, ubicación)
    function alCambiarBody(muts) {
        muts.forEach((m) => {
            m.addedNodes.forEach((n) => {
                if (n.nodeType === 1 && n.classList && n.classList.contains('pub-fondo')) abrirDialogo(n, n.querySelector('.pub-hoja') || n);
            });
            m.removedNodes.forEach((n) => { if (n.nodeType === 1 && abiertas.has(n)) cerrarDialogo(n); });
        });
    }
    new MutationObserver(alCambiarBody).observe(document.body, { childList: true });

    // ---------- 3) Mensajes nuevos en el chat abierto: se avisan sin leer todo el historial ----------
    const chat = $('chat-messages');
    if (chat) {
        const aviso = document.createElement('div');
        aviso.className = 'a11y-solo-lectores';
        aviso.setAttribute('role', 'status');
        aviso.setAttribute('aria-live', 'polite');
        document.body.appendChild(aviso);
        let calladoHasta = 0;
        document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.story-item')) calladoHasta = Date.now() + 2500; }, true);   // al abrir un chat se carga el historial
        new MutationObserver((muts) => {
            if (Date.now() < calladoHasta) return;
            muts.forEach((m) => m.addedNodes.forEach((n) => {
                if (n.nodeType === 1 && n.classList.contains('message-bubble') && n.dataset.mio === '0') {
                    const quien = texto($('chat-nombre')) || 'tu amigo';
                    aviso.textContent = '';
                    setTimeout(() => { aviso.textContent = `Mensaje de ${quien}: ${(n.querySelector('p') ? texto(n.querySelector('p')) : '') || 'te envió una foto'}`; }, 50);
                }
            }));
        }).observe(chat, { childList: true });
    }

    // Lo dinámico (carrusel, listas) se vuelve a revisar cuando cambia; se agrupa para no repetir trabajo
    mejorar();
    let pendiente = null;
    new MutationObserver(() => { if (pendiente) return; pendiente = setTimeout(() => { pendiente = null; mejorar(); }, 120); })
        .observe(document.body, { childList: true, subtree: true });
})();
