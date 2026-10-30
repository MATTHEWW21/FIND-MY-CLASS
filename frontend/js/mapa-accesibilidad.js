// Pines de accesibilidad (escaleras, rampas, estacionamientos y pasos peatonales).
// Reglas: NO se ven al abrir el mapa. Aparecen cuando la persona inicia la ruta (EMPEZAR) y solo los que quedan
// cerca de su camino. Se quitan al finalizar o al limpiar la ruta. No depende del color: cada tipo tiene forma, letra y texto.
(function () {
    const CERCA_RAMPA_M = 7;      // una rampa solo cuenta si la ruta pasa casi encima (si no, solo estorba)
    const CERCA_RUTA_M = 15;      // un elemento cuenta como "de la ruta" si queda a menos de esto del camino
    const CERCA_TRAMO_M = 12;     // una escalera/rampa cuenta como "la que usa la ruta" si queda a menos de esto del tramo de ese tipo
    const AVISO_M = 20;           // la guía por voz avisa cuando estás a esta distancia
    const NOMBRE = { escalera: 'Escalera', rampa: 'Rampa', estacionamiento: 'Estacionamiento accesible', paso_peatonal: 'Paso peatonal accesible', elevador: 'Elevador' };
    const LETRA = { escalera: 'E', rampa: 'R', estacionamiento: 'P', paso_peatonal: '↔', elevador: 'A' };

    let todos = null;             // lista completa (se pide una sola vez)
    let pidiendo = null;
    let ruta = null;              // último detalle de 'fmc:ruta'
    let cercanos = [];            // elementos cerca de la ruta actual
    let navegando = false;
    let capa = null;
    const avisados = new Set();

    const rad = Math.PI / 180;
    // Metros entre dos puntos {lat,lng} (aproximación plana, suficiente en un campus)
    function dist(a, b) {
        const k = Math.cos(a.lat * rad);
        return Math.hypot((a.lat - b.lat) * 111320, (a.lng - b.lng) * 111320 * k);
    }
    function aSegmento(p, a, b) {
        const k = Math.cos(p.lat * rad) * 111320, m = 111320;
        const ax = (a.lng - p.lng) * k, ay = (a.lat - p.lat) * m, bx = (b.lng - p.lng) * k, by = (b.lat - p.lat) * m;
        const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        let t = l2 ? -(ax * dx + ay * dy) / l2 : 0;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(ax + t * dx, ay + t * dy);
    }
    function distARuta(p) {
        if (!ruta || !ruta.tramos) return Infinity;
        let d = Infinity;
        ruta.tramos.forEach((t) => { d = Math.min(d, aSegmento(p, t.a, t.b)); });
        return d;
    }

    function cargar() {
        if (todos) return Promise.resolve(todos);
        if (pidiendo) return pidiendo;
        pidiendo = (typeof apiFetch === 'function' ? apiFetch('/mapa/accesibilidad') : Promise.resolve([]))
            .then((l) => { todos = Array.isArray(l) ? l : []; return todos; })
            .catch((e) => { console.error('No se pudieron cargar los pines de accesibilidad:', e); pidiendo = null; return []; });
        return pidiendo;
    }

    // Distancia (m) entre un elemento (punto o linea) y un tramo de la ruta
    function distATramo(puntos, t) {
        let d = Infinity;
        puntos.forEach((p) => { d = Math.min(d, aSegmento(p, t.a, t.b)); });
        for (let i = 0; i + 1 < puntos.length; i++) {
            d = Math.min(d, aSegmento(t.a, puntos[i], puntos[i + 1]), aSegmento(t.b, puntos[i], puntos[i + 1]));
        }
        return d;
    }
    const puntosDe = (f) => (f.trazo && f.trazo.length ? f.trazo : [[f.lat, f.lng]]).map((q) => ({ lat: q[0], lng: q[1] }));

    async function calcularCercanos() {
        const lista = await cargar();
        // Quien no pidio rutas accesibles no necesita ver rampas ni escaleras: solo estorban
        if (!ruta || !ruta.perfilAccesible) { cercanos = []; return; }
        const tramos = ruta.tramos || [];
        const porTipo = (tipo) => tramos.filter((t) => t.tipo === tipo);
        const escaleras = porTipo('escaleras'), rampas = porTipo('rampa');

        cercanos = lista.filter((f) => {
            const puntos = puntosDe(f);
            // Las escaleras solo se muestran si la ruta REALMENTE pasa por escaleras (y ahi). Una escalera que queda junto a la
            // rampa que sí usa la ruta (o junto a un camino normal) no se marca: solo confundiría.
            if (f.tipo === 'escalera') return escaleras.some((t) => distATramo(puntos, t) <= CERCA_TRAMO_M);
            // Rampas dibujadas a mano con trazos muy largos (mas de 40 m) son poco exactas: no se muestran, para no inventar rampas
            if (f.tipo === 'rampa') return largoTrazo(f.trazo) <= MAX_LINEA_M && puntos.some((p) => distARuta(p) <= CERCA_RAMPA_M);
            return puntos.some((p) => distARuta(p) <= CERCA_RUTA_M);
        });

        // Tramos de escaleras o rampa que no tienen su propio pin (todavia no se han marcado): se crea uno con el trazo del tramo
        const nombre = { escalera: 'Escalera', rampa: 'Rampa' };
        [['escalera', escaleras], ['rampa', rampas]].forEach(([tipo, trs]) => {
            trs.forEach((t) => {
                if (cercanos.some((f) => f.tipo === tipo && distATramo(puntosDe(f), t) <= CERCA_TRAMO_M)) return;
                // Si ya hay un pin real de ese tipo muy cerca (aunque se haya filtrado), no se duplica
                if (lista.some((f) => f.tipo === tipo && distATramo(puntosDe(f), t) <= CERCA_TRAMO_M)) return;
                cercanos.push({
                    id: `tramo-${tipo}-${t.a.lat.toFixed(6)}-${t.a.lng.toFixed(6)}`, tipo, nombre: nombre[tipo],
                    trazo: [[t.a.lat, t.a.lng], [t.b.lat, t.b.lng]],
                    lat: (t.a.lat + t.b.lat) / 2, lng: (t.a.lng + t.b.lng) / 2, largo_m: t.metros,
                });
            });
        });
    }

    const MAX_LINEA_M = 40;
    function largoTrazo(tr) {
        let t = 0;
        for (let i = 1; tr && i < tr.length; i++) t += dist({ lat: tr[i - 1][0], lng: tr[i - 1][1] }, { lat: tr[i][0], lng: tr[i][1] });
        return t;
    }
    function icono(f) {
        const t = LETRA[f.tipo] ? f.tipo : 'rampa';
        return L.divIcon({
            className: 'acc-pin-wrap',
            html: `<span class="acc-pin acc-${t}" aria-hidden="true">${LETRA[t]}</span>`,
            iconSize: [22, 22], iconAnchor: [11, 11],
        });
    }
    function textoPin(f) {
        const base = f.nombre || NOMBRE[f.tipo] || 'Accesibilidad';
        const largo = f.largo_m && f.largo_m >= 8 ? `, aproximadamente ${Math.round(f.largo_m)} metros` : '';
        return `${base}${largo}`;
    }

    function quitar() {
        if (capa && window.FMCMapa && FMCMapa.mapa) { try { FMCMapa.mapa().removeLayer(capa); } catch (e) { /* ya no estaba */ } }
        capa = null;
    }

    function dibujar() {
        quitar();
        if ((!navegando && !(ruta && ruta.perfilAccesible)) || !cercanos.length || !window.FMCMapa || !FMCMapa.mapa) return;
        capa = L.layerGroup();
        cercanos.forEach((f) => {
            let lat = f.lat, lng = f.lng;
            const largo = f.largo_m || largoTrazo(f.trazo);
            if (f.trazo && f.trazo.length > 1 && largo > MAX_LINEA_M) {
                // Rampa/escalera muy larga: una linea recta cruzaria edificios. Solo se marca el punto mas cercano a tu camino
                let mejor = Infinity;
                f.trazo.forEach((q) => { const d = distARuta({ lat: q[0], lng: q[1] }); if (d < mejor) { mejor = d; lat = q[0]; lng = q[1]; } });
            } else if (f.trazo && f.trazo.length > 1) {
                L.polyline(f.trazo, { color: '#ffffff', weight: 7, opacity: .9, interactive: false }).addTo(capa);
                L.polyline(f.trazo, { color: f.tipo === 'escalera' ? '#D55E00' : f.tipo === 'rampa' ? '#0072B2' : '#009E73', weight: 4, dashArray: f.tipo === 'escalera' ? '2 6' : null, lineCap: 'round', interactive: false }).addTo(capa);
            }
            const m = L.marker([lat, lng], { icon: icono(f), title: textoPin(f), alt: textoPin(f), keyboard: false, riseOnHover: true });
            m.bindTooltip(textoPin(f), { direction: 'top', offset: [0, -12] });
            m.on('add', () => { const el = m.getElement(); if (el) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', textoPin(f)); el.removeAttribute('tabindex'); } });
            m.addTo(capa);
        });
        capa.addTo(FMCMapa.mapa());
    }

    function resumenTexto() {
        const n = (t) => cercanos.filter((f) => f.tipo === t).length;
        const partes = [];
        const e = n('escalera'), r = n('rampa');
        if (e) partes.push(e === 1 ? 'una escalera' : `${e} escaleras`);
        if (r) partes.push(r === 1 ? 'una rampa' : `${r} rampas`);
        if (!partes.length) return '';
        return `Cerca de tu camino hay ${partes.join(' y ')}.`;
    }
    // Para la guía por voz: avisa una sola vez por elemento cuando te acercas
    function avisoCerca(pos) {
        if (!navegando || !ruta || !ruta.perfilAccesible) return null;
        for (const f of cercanos) {
            if (f.tipo === 'estacionamiento' || avisados.has(f.id)) continue;
            const puntos = (f.trazo && f.trazo.length ? f.trazo : [[f.lat, f.lng]]);
            if (puntos.some((q) => dist(pos, { lat: q[0], lng: q[1] }) <= AVISO_M)) {
                avisados.add(f.id);
                return `Adelante: ${textoPin(f).toLowerCase()}.`;
            }
        }
        return null;
    }

    document.addEventListener('fmc:ruta', async (e) => {
        ruta = e.detail;
        avisados.clear();
        await calcularCercanos();
        dibujar();        // vista previa (perfil accesible) o recalculo a mitad de camino
    });
    document.addEventListener('fmc:empezar', async () => {
        navegando = true;
        await calcularCercanos();
        if (navegando) dibujar();
    });
    function terminar() { navegando = false; quitar(); }
    document.addEventListener('fmc:finalizar', terminar);
    document.addEventListener('fmc:limpiar', () => { ruta = null; cercanos = []; avisados.clear(); terminar(); });

    // Cajas de estacionamiento (discapacidad, embarazadas, motos, electricos, Solutions) cercanas a un estacionamiento elegido
    function categoriaCaja(nombre) {
        const n = String(nombre || '').toLowerCase();
        if (n.includes('embarazada')) return { icono: '🤰', texto: 'Para mujeres embarazadas' };
        if (n.includes('el\u00e9ctrico') || n.includes('electrico')) return { icono: '⚡', texto: 'Para carro eléctrico' };
        if (n.includes('moto')) return { icono: '🏍️', texto: 'Para motos' };
        if (n.includes('solutions')) return { icono: '🏢', texto: 'Exclusivo para empleados de Solutions' };
        return { icono: '♿', texto: 'Para personas con discapacidad' };
    }
    async function cajasDe(lugar, radio) {
        const lista = await cargar();
        const r = radio || 140;
        return lista.filter((f) => f.tipo === 'estacionamiento' && f.lat != null)
            .map((f) => {
                const lat = Number(f.lat), lng = Number(f.lng);
                const m = Math.round(dist({ lat, lng }, lugar));
                const cat = categoriaCaja(f.nombre);
                if (/aproximada/i.test(f.nombre)) cat.texto += ' (ubicación aproximada)';
                return Object.assign({ lat, lng, m, nombre: f.nombre }, cat);
            })
            .filter((c) => c.m <= r)
            .sort((a, b) => a.m - b.m);
    }

    window.FMCAcc = { cajasDe, cercanos: () => cercanos.slice(), resumen: resumenTexto, avisoCerca, visibles: () => !!capa };
})();
