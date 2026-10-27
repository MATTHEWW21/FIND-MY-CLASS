// Avisos dentro de la app, en lugar de alert() / confirm() del navegador.
//   FMCAviso.aviso('Texto', 'ok' | 'error' | 'info')   -> aviso que aparece arriba y se quita solo (no bloquea)
//   await FMCAviso.alerta('Texto', 'ok' | 'error')     -> ventana con botón "Entendido"; espera a que se cierre (para avisar antes de cambiar de página)
//   await FMCAviso.confirmar('¿Seguro?', { si: 'Eliminar', no: 'Cancelar', peligro: true })  -> true / false
// Accesibilidad: los errores se anuncian al momento (role="alert") y el resto con calma (role="status"); cada aviso lleva ícono Y texto;
// no desaparecen mientras los tocas o los tienes enfocados; las ventanas llevan el foco, atrapan Tab, se cierran con Escape y devuelven el foco.
(function () {
    if (window.FMCAviso) return;

    const ICONOS = { ok: '✓', error: '!', info: 'i' };
    const ROTULOS = { ok: 'Listo', error: 'Error', info: 'Aviso' };   // lo que dice el lector de pantalla antes del mensaje
    const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const css = `
.aviso-pila { position: fixed; top: 10px; left: 0; right: 0; z-index: 100000; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 12px; pointer-events: none; }
.aviso-grupo { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
.aviso-toast { pointer-events: auto; display: flex; align-items: flex-start; gap: 10px; max-width: 400px; width: 100%; box-sizing: border-box; padding: 12px 8px 12px 12px; border-radius: 14px; background: #2b2b2b; color: #fff; font: 600 .95rem/1.35 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; box-shadow: 0 6px 20px rgba(0,0,0,.3); border-left: 6px solid #56B4E9; white-space: pre-line; animation: aviso-entra .18s ease-out; }
.aviso-toast.ok { border-left-color: #009E73; }
.aviso-toast.error { border-left-color: #E69F00; background: #3a1f1f; }
.aviso-icono { flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; background: #fff; color: #2b2b2b; }
.aviso-toast.error .aviso-icono { border-radius: 4px; }
.aviso-texto { flex: 1 1 auto; padding-top: 2px; overflow-wrap: anywhere; }
.aviso-cerrar { flex: 0 0 auto; min-width: 44px; min-height: 44px; margin: -8px 0; border: 0; background: transparent; color: #fff; font-size: 1.2rem; cursor: pointer; border-radius: 10px; }
.aviso-cerrar:focus-visible, .aviso-btn:focus-visible { outline: 3px solid #56B4E9; outline-offset: 2px; }
.aviso-fondo { position: fixed; inset: 0; z-index: 100001; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 16px; }
.aviso-dialogo { background: #fff; color: #222; width: 100%; max-width: 380px; border-radius: 18px; padding: 20px 18px 16px; box-sizing: border-box; font: 500 1rem/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.aviso-dialogo .aviso-cabeza { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-weight: 800; }
.aviso-dialogo .aviso-icono { background: #2b2b2b; color: #fff; }
.aviso-dialogo.error .aviso-icono { border-radius: 4px; background: #8a4b00; }
.aviso-dialogo p { margin: 0 0 16px; white-space: pre-line; overflow-wrap: anywhere; }
.aviso-botones { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }
.aviso-btn { min-height: 48px; min-width: 110px; padding: 0 18px; border-radius: 12px; border: 2px solid #B04E0E; background: #B04E0E; color: #fff; font: 700 1rem system-ui, sans-serif; cursor: pointer; }
.aviso-btn.sec { background: #fff; color: #B04E0E; }
.aviso-btn.peligro { background: #B3261E; border-color: #B3261E; color: #fff; }
.aviso-btn.sec.peligro-sec { color: #222; border-color: #222; }
@keyframes aviso-entra { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .aviso-toast { animation: none; } }
`;

    let pila = null, grupoEstado = null, grupoAlerta = null;
    function preparar() {
        if (pila && document.body.contains(pila)) return;
        const st = document.createElement('style');
        st.textContent = css;
        document.head.appendChild(st);
        pila = document.createElement('div');
        pila.className = 'aviso-pila';
        // Las zonas "vivas" existen desde el principio: así los lectores de pantalla sí anuncian lo que se agrega después
        grupoEstado = document.createElement('div');
        grupoEstado.className = 'aviso-grupo';
        grupoEstado.setAttribute('role', 'status');
        grupoEstado.setAttribute('aria-live', 'polite');
        grupoAlerta = document.createElement('div');
        grupoAlerta.className = 'aviso-grupo';
        grupoAlerta.setAttribute('role', 'alert');
        grupoAlerta.setAttribute('aria-live', 'assertive');
        pila.appendChild(grupoAlerta);
        pila.appendChild(grupoEstado);
        document.body.appendChild(pila);
    }

    function aviso(mensaje, tipo) {
        tipo = ICONOS[tipo] ? tipo : 'info';
        const dentro = () => {
            preparar();
            const t = document.createElement('div');
            t.className = 'aviso-toast ' + tipo;
            const ic = document.createElement('span'); ic.className = 'aviso-icono'; ic.setAttribute('aria-hidden', 'true'); ic.textContent = ICONOS[tipo];
            const tx = document.createElement('span'); tx.className = 'aviso-texto';
            const rot = document.createElement('span'); rot.className = 'a11y-solo-lectores'; rot.textContent = ROTULOS[tipo] + ': ';
            rot.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
            tx.appendChild(rot); tx.appendChild(document.createTextNode(String(mensaje)));
            const x = document.createElement('button'); x.type = 'button'; x.className = 'aviso-cerrar'; x.setAttribute('aria-label', 'Cerrar aviso'); x.textContent = '✕';
            t.appendChild(ic); t.appendChild(tx); t.appendChild(x);
            const cuando = Math.min(14000, (tipo === 'error' ? 7000 : 4000) + String(mensaje).length * 55);
            let timer = null;
            const quitar = () => { clearTimeout(timer); if (t.parentNode) t.remove(); };
            const armar = () => { clearTimeout(timer); timer = setTimeout(quitar, cuando); };
            x.addEventListener('click', quitar);
            ['mouseenter', 'focusin', 'touchstart'].forEach((ev) => t.addEventListener(ev, () => clearTimeout(timer), { passive: true }));
            ['mouseleave', 'focusout'].forEach((ev) => t.addEventListener(ev, armar));
            t.addEventListener('keydown', (e) => { if (e.key === 'Escape') quitar(); });
            (tipo === 'error' ? grupoAlerta : grupoEstado).appendChild(t);
            armar();
        };
        if (document.body) dentro(); else document.addEventListener('DOMContentLoaded', dentro);
    }

    // ---------- ventanas (alerta y confirmación), de una en una ----------
    let cola = Promise.resolve();
    function ventana(mensaje, opciones) {
        const o = opciones || {};
        const una = () => new Promise((resolve) => {
            preparar();
            const opener = document.activeElement;
            const fondo = document.createElement('div');
            fondo.className = 'aviso-fondo';
            const d = document.createElement('div');
            d.className = 'aviso-dialogo ' + (o.tipo || '');
            d.setAttribute('role', 'alertdialog');
            d.setAttribute('aria-modal', 'true');
            const id = 'aviso-msg-' + Math.random().toString(36).slice(2, 8);
            d.setAttribute('aria-describedby', id);
            const cab = document.createElement('div'); cab.className = 'aviso-cabeza';
            const ic = document.createElement('span'); ic.className = 'aviso-icono'; ic.setAttribute('aria-hidden', 'true'); ic.textContent = o.confirmar ? '?' : (ICONOS[o.tipo] || 'i');
            const ti = document.createElement('span'); ti.id = id + '-t'; ti.textContent = o.titulo || (o.confirmar ? 'Confirma' : ROTULOS[o.tipo] || 'Aviso');
            d.setAttribute('aria-labelledby', id + '-t');
            cab.appendChild(ic); cab.appendChild(ti);
            const p = document.createElement('p'); p.id = id; p.textContent = String(mensaje);
            const fila = document.createElement('div'); fila.className = 'aviso-botones';
            const cerrar = (valor) => {
                document.removeEventListener('keydown', teclas, true);
                fondo.remove();
                Array.from(document.body.children).forEach((n) => { if (n.dataset && n.dataset.avisoInert) { n.removeAttribute('inert'); delete n.dataset.avisoInert; } });
                if (opener && document.contains(opener) && opener.focus) opener.focus({ preventScroll: true });
                resolve(valor);
            };
            let btnNo = null;
            if (o.confirmar) {
                btnNo = document.createElement('button'); btnNo.type = 'button'; btnNo.className = 'aviso-btn sec' + (o.peligro ? ' peligro-sec' : ''); btnNo.textContent = o.no || 'Cancelar';
                btnNo.addEventListener('click', () => cerrar(false));
                fila.appendChild(btnNo);
            }
            const btnSi = document.createElement('button'); btnSi.type = 'button'; btnSi.className = 'aviso-btn' + (o.peligro ? ' peligro' : '');
            btnSi.textContent = o.si || (o.confirmar ? 'Aceptar' : 'Entendido');
            btnSi.addEventListener('click', () => cerrar(true));
            fila.appendChild(btnSi);
            d.appendChild(cab); d.appendChild(p); d.appendChild(fila);
            fondo.appendChild(d);
            function teclas(e) {
                if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(o.confirmar ? false : true); return; }
                if (e.key !== 'Tab') return;
                const f = Array.from(d.querySelectorAll(FOCUSABLE));
                const primero = f[0], ultimo = f[f.length - 1];
                if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
                else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
                else if (!d.contains(document.activeElement)) { e.preventDefault(); primero.focus(); }
            }
            document.addEventListener('keydown', teclas, true);
            Array.from(document.body.children).forEach((n) => { if (n !== fondo && n !== pila && !/^(SCRIPT|LINK|STYLE)$/.test(n.tagName) && !n.hasAttribute('inert')) { n.setAttribute('inert', ''); n.dataset.avisoInert = '1'; } });
            document.body.appendChild(fondo);
            // En una pregunta peligrosa el foco empieza en "Cancelar" para no borrar algo por pulsar Enter sin querer
            (o.confirmar && o.peligro ? btnNo : btnSi).focus();
        });
        cola = cola.then(una, una);
        return cola.then((v) => v);
    }

    window.FMCAviso = {
        aviso,
        alerta: (mensaje, tipo) => ventana(mensaje, { tipo: tipo || 'info' }).then(() => undefined),
        confirmar: (mensaje, o) => ventana(mensaje, Object.assign({ confirmar: true }, o || {})),
    };
})();