// mapa-panel.js - el panel de la ruta se desliza como una hoja: sigue al dedo y se acomoda arriba (abierto) o abajo (minimizado).
// Tambien se puede tocar el asa, o usar Enter / espacio, y funciona con raton. Con el panel minimizado, lo de adentro queda inerte
// (ni el teclado ni el lector de pantalla llegan a botones que no se ven).
(function () {
    const panel = document.getElementById("route-panel");
    const asa = document.getElementById("panel-asa");
    if (!panel || !asa) return;
    const caja = panel.querySelector(".route-loc-box");
    const reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURACION = reducir ? 0 : 280;

    let minimizado = false;
    let animando = null;

    const hijosOcultables = () => Array.from(panel.children).filter((el) => el !== asa && el !== caja);
    function marcarInerte(valor) { hijosOcultables().forEach((el) => { if (valor) el.setAttribute("inert", ""); else el.removeAttribute("inert"); }); }

    function alturaMin() {
        const pie = parseFloat(getComputedStyle(panel).paddingBottom) || 0;
        const sinMargen = caja ? caja.offsetTop + caja.offsetHeight : asa.offsetTop + asa.offsetHeight;
        return Math.ceil(sinMargen + pie);
    }
    function alturaMax() {
        return Math.min(panel.scrollHeight, Math.round(window.innerHeight * 0.65));
    }

    function etiquetas() {
        panel.classList.toggle("minimizado", minimizado);
        asa.setAttribute("aria-expanded", String(!minimizado));
        asa.setAttribute("aria-label", minimizado ? "Mostrar el panel de la ruta" : "Minimizar el panel de la ruta");
    }

    function terminar(abierto) {
        panel.style.transition = "";
        if (abierto) { panel.style.height = ""; panel.style.overflowY = ""; }
        else marcarInerte(true);
        animando = null;
    }

    // Lleva el panel (con animacion) al estado pedido. desde = altura actual (por si venia siguiendo al dedo)
    function ir(nuevoMin, animar, desde) {
        minimizado = nuevoMin;
        etiquetas();
        if (animando) { clearTimeout(animando); animando = null; }
        if (!nuevoMin) marcarInerte(false);
        const h0 = desde != null ? desde : panel.getBoundingClientRect().height;
        const meta = nuevoMin ? alturaMin() : alturaMax();
        if (!animar || DURACION === 0 || panel.classList.contains("hidden")) {
            panel.style.transition = "none";
            if (nuevoMin) { panel.style.overflowY = "hidden"; panel.style.height = meta + "px"; marcarInerte(true); }
            else { panel.style.height = ""; panel.style.overflowY = ""; }
            animando = null; requestAnimationFrame(() => { panel.style.transition = ""; });
            return;
        }
        panel.style.overflowY = "hidden";
        panel.style.transition = "none";
        panel.style.height = h0 + "px";
        void panel.offsetHeight;                                   // para que el navegador tome la altura de partida
        panel.style.transition = `height ${DURACION}ms cubic-bezier(.2,.8,.2,1)`;
        panel.style.height = meta + "px";
        animando = setTimeout(() => terminar(!nuevoMin), DURACION + 40);
    }
    const poner = (min, animar = true) => ir(min, animar);

    // ---- Arrastre con el dedo (toda la tarjeta) ----
    let t = null;   // { y, x, h0, min, max, decidido, arrastra, scroll0 }
    panel.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) { t = null; return; }
        if (animando) { clearTimeout(animando); animando = null; panel.style.transition = ""; }
        const p = e.touches[0];
        t = { y: p.clientY, x: p.clientX, h0: panel.getBoundingClientRect().height, min: alturaMin(), max: alturaMax(), decidido: false, arrastra: false, ultimaY: p.clientY, ultimoT: Date.now(), vel: 0 };
    }, { passive: true });
    panel.addEventListener("touchmove", (e) => {
        if (!t) return;
        const p = e.touches[0];
        const dy = p.clientY - t.y, dx = p.clientX - t.x;
        if (!t.decidido) {
            if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;
            t.decidido = true;
            const vertical = Math.abs(dy) > Math.abs(dx);
            // Abierto: solo se arrastra hacia abajo si el contenido esta arriba del todo (si no, es para hacer scroll)
            const puede = vertical && (minimizado || (dy > 0 && panel.scrollTop <= 0) || (dy < 0 && panel.scrollHeight <= panel.clientHeight + 1 && false));
            t.arrastra = puede;
            if (puede) { panel.style.transition = "none"; panel.style.overflowY = "hidden"; marcarInerte(false); }
        }
        if (!t.arrastra) return;
        if (e.cancelable) e.preventDefault();
        const ahora = Date.now();
        if (ahora > t.ultimoT) t.vel = (p.clientY - t.ultimaY) / (ahora - t.ultimoT);   // px por ms, positivo = hacia abajo
        t.ultimaY = p.clientY; t.ultimoT = ahora;
        const h = Math.max(t.min, Math.min(t.max, t.h0 - dy));
        panel.style.height = h + "px";
    }, { passive: false });
    function soltar() {
        if (!t) return;
        const s = t; t = null;
        if (!s.arrastra) return;
        const h = parseFloat(panel.style.height) || s.h0;
        let cerrar;
        if (Math.abs(s.vel) > 0.25) cerrar = s.vel > 0;               // un empujon rapido decide
        else cerrar = h < (s.min + s.max) / 2;                          // si no, el lado mas cercano
        ir(cerrar, true, h);
    }
    panel.addEventListener("touchend", soltar);
    panel.addEventListener("touchcancel", soltar);

    // ---- Asa: toque, teclado y raton ----
    let y0 = null, hizoGesto = false;
    asa.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "touch") return;                          // el dedo lo maneja el arrastre de toda la tarjeta
        y0 = e.clientY; hizoGesto = false;
        if (asa.setPointerCapture) { try { asa.setPointerCapture(e.pointerId); } catch (err) { /* sin captura tambien sirve */ } }
    });
    asa.addEventListener("pointermove", (e) => {
        if (y0 === null) return;
        const dy = e.clientY - y0;
        if (dy > 24 && !minimizado) { poner(true); hizoGesto = true; y0 = null; }
        else if (dy < -24 && minimizado) { poner(false); hizoGesto = true; y0 = null; }
    });
    asa.addEventListener("pointerup", () => { y0 = null; });
    asa.addEventListener("pointercancel", () => { y0 = null; });
    asa.addEventListener("click", () => {
        if (hizoGesto) { hizoGesto = false; return; }
        poner(!minimizado);
    });

    // Al empezar la ruta se minimiza solo, para que se vea el mapa
    const empezar = document.getElementById("btn-start");
    if (empezar) empezar.addEventListener("click", () => setTimeout(() => poner(true), 150));

    // Cada vez que el panel se vuelve a abrir (ruta nueva) arranca desplegado
    new MutationObserver(() => { if (panel.classList.contains("hidden") && (minimizado || panel.style.height)) ir(false, false); })
        .observe(panel, { attributes: true, attributeFilter: ["class"] });
    // Si se gira el cel o cambia el tamano con el panel minimizado, se vuelve a medir
    window.addEventListener("resize", () => { if (minimizado && !animando) panel.style.height = alturaMin() + "px"; });
})();
