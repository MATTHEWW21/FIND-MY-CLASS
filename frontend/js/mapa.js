document.addEventListener("DOMContentLoaded", () => {
    const boundsUAG = L.latLngBounds(
        L.latLng(20.6850, -103.4260),
        L.latLng(20.7010, -103.4090)
    );

    const map = L.map('map', {
        maxBounds: boundsUAG,
        maxBoundsViscosity: 1.0,
        minZoom: 16,
        maxZoom: 19,
        zoomControl: false
    }).setView([20.6938, -103.4178], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    setTimeout(() => { map.invalidateSize(); }, 300);

    const searchTrigger = document.getElementById("search-trigger");
    const routePanel = document.getElementById("route-panel");
    const arrivalPanel = document.getElementById("arrival-panel");
    const feedbackPanel = document.getElementById("feedback-panel");
    const reportPanel = document.getElementById("report-panel");
    const searchPanel = document.getElementById("search-panel");

    const btnStart = document.getElementById("btn-start");
    const btnFinish = document.getElementById("btn-finish");
    const btnContinue = document.getElementById("btn-continue");
    const btnChange = document.getElementById("btn-cambiar-destino");
    const btnOtraRuta = document.getElementById("btn-otra-ruta");

    const btnSendFeedback = document.getElementById("btn-send-feedback");
    const btnSkipFeedback = document.getElementById("btn-skip-feedback");
    const starBtns = document.querySelectorAll(".star-btn");

    const btnReportIssue = document.getElementById("btn-report-issue");
    const btnBackReport = document.getElementById("btn-back-report");
    const btnCancelReport = document.getElementById("btn-cancel-report");
    const btnSubmitReport = document.getElementById("btn-submit-report");
    const categoryChips = document.querySelectorAll(".category-chip");

    const B = window.FMCBusqueda;
    const TIPOS = B ? B.TIPOS : {};

    const MIN_CAMINANDO = 80;
    const MODOS = {
        caminata:  { nombre: "Caminar",   emoji: "🚶", vel: 80 },
        carrera:   { nombre: "Correr",    emoji: "🏃", vel: 170 },
        ciclismo:  { nombre: "Bici",      emoji: "🚴", vel: 250 },
        scooter:   { nombre: "Scooter",   emoji: "🛴", vel: 200 },
        inclusivo: { nombre: "Accesible", emoji: "♿", vel: 65, largo: "Silla de ruedas o recorrido accesible" },
    };
    const CLAVE_RUTA = "rutaMapa";
    const CADUCA_RUTA_MS = 4 * 3600 * 1000;
    const FACTOR_CAMINO = 1.3;

    let lugares = [];
    let destino = null;
    let sinCajas = null;
    let rutaActual = null;
    let inicioNavegacion = null;
    let modo = "caminata";
    let metrosRuta = null;
    let ultimoDestino = null;
    let capaBase = L.layerGroup().addTo(map);
    let capaSel = L.layerGroup().addTo(map);
    let marcaOrigen = null;
    let siguiendo = true;
    let btnCentrar = null;
    let marcaPosicion = null;
    const capasChip = {};

    function crearPin(l, seleccionado) {
        const t = TIPOS[l.tipo] || { emoji: '📍' };
        const icono = L.divIcon({
            className: 'fmc-pin-wrap',
            html: `<div class="fmc-pin${seleccionado ? ' sel' : ''}" aria-hidden="true">${t.emoji}</div>`,
            iconSize: seleccionado ? [40, 40] : [30, 30],
            iconAnchor: seleccionado ? [20, 20] : [15, 15],
        });
        const m = L.marker([l.lat, l.lng], { icon: icono, title: l.nombre });
        m.bindTooltip(l.nombre, { direction: 'top', offset: [0, -14] });
        m.on('add', () => { const el = m.getElement(); if (el) { el.setAttribute('role', 'button'); el.setAttribute('aria-label', `${l.nombre}. Toca para ir a este lugar`); } });
        m.on('click', () => seleccionarDestino(l));
        return m;
    }

    const ASUNTOS = {
        administrativo: { etiqueta: 'Administrativo', tipos: ['oficina', 'puerta', 'estacionamiento', 'encuentro', 'entrada_accesible'], servicios: /banco|solutions|recursos humanos|asistencia social|store|protecci/ },
        medico:         { etiqueta: 'Médico',         tipos: ['salud', 'puerta', 'estacionamiento', 'encuentro', 'entrada_accesible'] },
        deportivo:      { etiqueta: 'Deportivo',      tipos: ['deportes', 'bebedero', 'puerta', 'estacionamiento', 'encuentro', 'entrada_accesible'] },
        evento:         { etiqueta: 'Evento',         tipos: ['auditorio', 'alimentos', 'puerta', 'estacionamiento', 'encuentro', 'entrada_accesible'] },
    };
    const asuntoVisita = localStorage.getItem('userRole') === 'visitante' ? ASUNTOS[localStorage.getItem('visitaAsunto')] : null;

    function filtrarPorAsunto(lista) {
        if (!asuntoVisita) return lista;
        return lista.filter((l) =>
            asuntoVisita.tipos.includes(l.tipo) ||
            (l.tipo === 'servicio' && asuntoVisita.servicios && asuntoVisita.servicios.test(B.normalizar(l.nombre)))
        );
    }

    function dibujarPines() {
        capaBase.clearLayers();
        Object.keys(capasChip).forEach((k) => capasChip[k].clearLayers());
        lugares.forEach((l) => {
            if (l.tipo === 'edificio' || l.tipo === 'puerta' || (asuntoVisita && !capasChip[l.tipo])) {
                crearPin(l, false).addTo(capaBase);
            } else if (capasChip[l.tipo]) {
                crearPin(l, false).addTo(capasChip[l.tipo]);
            }
        });
    }

    document.querySelectorAll(".filter-chips .chip[data-tipo]").forEach((chip) => {
        const tipo = chip.dataset.tipo;
        capasChip[tipo] = L.layerGroup();
        chip.addEventListener("click", () => {
            const activo = chip.classList.toggle("active");
            if (activo) capasChip[tipo].addTo(map);
            else map.removeLayer(capasChip[tipo]);
        });
    });

    function prepararAvisoAsunto() {
        if (!asuntoVisita) return;
        const cont = document.querySelector('.filter-chips');
        if (!cont || cont.querySelector('.chip-asunto')) return;
        const a = document.createElement('a');
        a.className = 'chip chip-asunto';
        a.href = 'visitante-asunto.html';
        a.textContent = '🎯 ' + asuntoVisita.etiqueta.toUpperCase() + ' · CAMBIAR';
        cont.insertBefore(a, cont.firstChild);
        cont.querySelectorAll('.chip[data-tipo]').forEach((c) => {
            if (!lugares.some((l) => l.tipo === c.dataset.tipo)) c.style.display = 'none';
        });
    }

    async function cargarLugares() {
        try {
            const data = await apiFetch('/mapa/lugares');
            lugares = filtrarPorAsunto(B.preparar(data));
            prepararAvisoAsunto();
            dibujarPines();
        } catch (err) {
            console.error('No se pudieron cargar los lugares del mapa:', err);
        }
    }

    const R = window.FMCRutas;
    const GUIA = window.FMCGuia;
    let grafo = { puntos: [], rutas: [] };
    async function cargarGrafo() {
        try {
            grafo = await apiFetch('/mapa/grafo');
        } catch (err) {
            console.error('No se pudo cargar la red de caminos:', err);
        }
    }

    const inputBusqueda = document.getElementById("search-input");
    const listaResultados = document.getElementById("search-results");
    const catsBusqueda = document.getElementById("search-cats");
    const btnCerrarBusqueda = document.getElementById("btn-close-search");
    let tipoFiltro = "";

    const CLAVE_ORIGEN = "fmc_origen_manual";
    let origenManual = null;
    let modoOrigen = false;
    try { origenManual = JSON.parse(sessionStorage.getItem(CLAVE_ORIGEN) || "null"); } catch (e) { origenManual = null; }
    const origenEstado = document.getElementById("origen-estado");
    const btnOrigenElegir = document.getElementById("btn-origen-elegir");
    const btnOrigenGps = document.getElementById("btn-origen-gps");
    function pintarOrigen() {
        if (origenEstado) origenEstado.textContent = origenManual ? `📍 Estás en: ${origenManual.nombre}` : "📍 Tu ubicación: GPS";
        if (btnOrigenElegir) {
            btnOrigenElegir.textContent = modoOrigen ? "ELIGE EN LA LISTA" : (origenManual ? "CAMBIAR" : "ESTOY EN…");
            btnOrigenElegir.setAttribute("aria-label", modoOrigen ? "Elige en la lista el edificio o lugar donde estás" : (origenManual ? "Cambiar el lugar donde estoy" : "Poner mi ubicación actual: elegir el edificio o lugar donde estoy"));
        }
        if (btnOrigenGps) btnOrigenGps.hidden = !origenManual;
        inputBusqueda.placeholder = modoOrigen ? "¿Dónde estás? Busca tu edificio o lugar…" : "Busca edificios, comida, bebederos...";
        inputBusqueda.setAttribute("aria-label", modoOrigen ? "Busca el edificio o lugar donde estás" : "Buscar edificios, comida o bebederos");
    }
    function fijarOrigen(l) {
        origenManual = l ? { nombre: l.nombre, lat: l.lat, lng: l.lng } : null;
        try { if (origenManual) sessionStorage.setItem(CLAVE_ORIGEN, JSON.stringify(origenManual)); else sessionStorage.removeItem(CLAVE_ORIGEN); } catch (e) {  }
        modoOrigen = false;
        pintarOrigen();
    }
    if (btnOrigenElegir) btnOrigenElegir.addEventListener("click", () => { modoOrigen = !modoOrigen; pintarOrigen(); inputBusqueda.focus(); });
    if (btnOrigenGps) btnOrigenGps.addEventListener("click", async () => { fijarOrigen(null); if (destino) { cerrarBusqueda(); routePanel.classList.remove("hidden"); await trazarRuta(destino); } });

    function elemento(tag, clase, texto) {
        const el = document.createElement(tag);
        if (clase) el.className = clase;
        if (texto != null) el.textContent = texto;
        return el;
    }

    function crearItem(l) {
        const t = TIPOS[l.tipo] || { emoji: '📍', sing: '' };
        const boton = elemento("button", "search-item");
        boton.type = "button";
        boton.appendChild(elemento("span", "search-item-emoji", t.emoji));
        const textos = elemento("span", "search-item-text");
        textos.appendChild(elemento("strong", "", l.nombre));
        const detalle = [t.sing, l.numero ? `Nº ${l.numero}` : ""].filter(Boolean).join(" · ");
        if (detalle) textos.appendChild(elemento("small", "", detalle));
        boton.appendChild(textos);
        boton.addEventListener("click", async () => {
            if (modoOrigen) {
                fijarOrigen(l);
                if (destino) { cerrarBusqueda(); routePanel.classList.remove("hidden"); await trazarRuta(destino); } else { cerrarBusqueda(); map.setView([l.lat, l.lng], 18); }
                return;
            }
            seleccionarDestino(l);
        });
        return boton;
    }

    function renderCategorias() {
        catsBusqueda.innerHTML = "";
        const opciones = [["", "Todo"]].concat(
            B.ORDEN_TIPOS.filter((t) => lugares.some((l) => l.tipo === t)).map((t) => [t, TIPOS[t].etiqueta])
        );
        opciones.forEach(([tipo, etiqueta]) => {
            const b = elemento("button", "search-cat" + (tipo === tipoFiltro ? " active" : ""), etiqueta);
            b.type = "button";
            b.addEventListener("click", () => { tipoFiltro = tipo; renderCategorias(); renderResultados(); });
            catsBusqueda.appendChild(b);
        });
    }

    function renderResultados() {
        listaResultados.innerHTML = "";
        const consulta = inputBusqueda.value;
        if (!lugares.length) {
            listaResultados.appendChild(elemento("p", "search-empty", "Cargando lugares…"));
            return;
        }
        if (!consulta.trim() && !tipoFiltro) {
            B.agrupar(lugares).forEach((g) => {
                listaResultados.appendChild(elemento("h4", "search-group", `${TIPOS[g.tipo].emoji} ${TIPOS[g.tipo].etiqueta}`));
                g.items.forEach((l) => listaResultados.appendChild(crearItem(l)));
            });
            return;
        }
        const res = B.buscar(lugares, consulta, tipoFiltro);
        if (!res.length) {
            listaResultados.appendChild(elemento("p", "search-empty", "No encontramos nada con eso. Prueba con otra palabra."));
            return;
        }
        res.forEach((l) => listaResultados.appendChild(crearItem(l)));
    }

    function abrirBusqueda() {
        [routePanel, arrivalPanel, feedbackPanel, reportPanel].forEach((p) => p && p.classList.add("hidden"));
        searchPanel.classList.remove("hidden");
        modoOrigen = false;
        pintarOrigen();
        renderCategorias();
        renderResultados();
        inputBusqueda.focus();
    }

    function cerrarBusqueda() {
        searchPanel.classList.add("hidden");
        inputBusqueda.blur();
    }

    if (inputBusqueda) inputBusqueda.addEventListener("input", renderResultados);
    if (btnCerrarBusqueda) btnCerrarBusqueda.addEventListener("click", cerrarBusqueda);

    function obtenerOrigen() {
        const puerta1 = lugares.find((l) => l.numero === "P1");
        const respaldo = {
            lat: puerta1 ? puerta1.lat : 20.6920,
            lng: puerta1 ? puerta1.lng : -103.4163,
            etiqueta: "DESDE LA PUERTA 1",
        };
        if (origenManual && !marcaPosicion) return Promise.resolve({ lat: origenManual.lat, lng: origenManual.lng, etiqueta: `ESTÁS EN: ${origenManual.nombre.toUpperCase()}` });
        return new Promise((resolve) => {
            if (!navigator.geolocation) return resolve(respaldo);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const p = L.latLng(pos.coords.latitude, pos.coords.longitude);
                    if (boundsUAG.contains(p)) resolve({ lat: p.lat, lng: p.lng, etiqueta: "TU UBICACIÓN" });
                    else resolve(respaldo);
                },
                () => resolve(respaldo),
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
            );
        });
    }

    function minutos(metros, velocidad) {
        return Math.max(1, Math.round(metros / velocidad));
    }

    function textoPanel(id, texto) {
        const el = document.getElementById(id);
        if (el) el.textContent = texto;
    }

    function limpiarRuta() {
        capaSel.clearLayers();
        if (marcaPosicion) { map.removeLayer(marcaPosicion); marcaPosicion = null; }
        siguiendo = true; if (btnCentrar) btnCentrar.hidden = true;
        destino = null;
        inicioNavegacion = null;
        metrosRuta = null;
        borrarEstadoRuta();
        pintarModos();
        pintarLeyenda([], false);
        document.dispatchEvent(new CustomEvent("fmc:limpiar"));
    }

    function modosDisponibles() {
        return necesitaRutaAccesible() ? ["inclusivo", "scooter"] : ["caminata", "carrera", "ciclismo", "scooter", "inclusivo"];
    }
    function modoInicial() {
        const disp = modosDisponibles();
        let g = null;
        try { g = localStorage.getItem("modoMovilidad"); } catch (e) {}
        return disp.includes(g) ? g : disp[0];
    }
    const soloAccesibleEfectivo = () => necesitaRutaAccesible() || modo === "inclusivo";

    const filaModos = document.getElementById("metrics-row");
    function pintarModos() {
        if (!filaModos) return;
        filaModos.replaceChildren();
        const disp = modosDisponibles();
        disp.forEach((clave) => {
            const m = MODOS[clave];
            const b = document.createElement("button");
            b.type = "button";
            b.className = "metric-box" + (clave === modo ? " selected" : "");
            b.dataset.modo = clave;
            b.setAttribute("role", "radio");
            b.setAttribute("aria-checked", clave === modo ? "true" : "false");
            b.tabIndex = clave === modo ? 0 : -1;
            b.disabled = !!inicioNavegacion;
            const ico = elemento("span", "m-ico", m.emoji); ico.setAttribute("aria-hidden", "true");
            const nom = elemento("span", "m-nombre", m.nombre);
            const tpo = elemento("span", "m-tiempo", metrosRuta == null ? "-- MIN" : minutos(metrosRuta, m.vel) + " MIN");
            b.append(ico, nom, tpo);
            b.setAttribute("aria-label", `${m.largo || m.nombre}: ${metrosRuta == null ? "sin calcular" : minutos(metrosRuta, m.vel) + " minutos"}`);
            b.addEventListener("click", () => elegirModo(clave));
            b.addEventListener("keydown", (e) => {
                const i = disp.indexOf(clave);
                const sig = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
                if (!sig) return;
                e.preventDefault();
                const otro = filaModos.children[(i + sig + disp.length) % disp.length];
                if (otro && !otro.disabled) { otro.focus(); elegirModo(otro.dataset.modo, true); }
            });
            filaModos.appendChild(b);
        });
        textoPanel("route-dist", metrosRuta == null ? "" : `Distancia: ${metrosRuta} m`);
    }
    async function elegirModo(clave, conservarFoco) {
        if (inicioNavegacion || clave === modo) return;
        const antes = soloAccesibleEfectivo();
        modo = clave;
        try { localStorage.setItem("modoMovilidad", clave); } catch (e) {}
        pintarModos();
        if (conservarFoco) { const b = filaModos.querySelector(`[data-modo="${clave}"]`); if (b) b.focus(); }
        guardarEstadoRuta();
        if (destino && antes !== soloAccesibleEfectivo()) await trazarRuta(destino);
    }

    function guardarEstadoRuta() {
        try {
            if (!destino) { localStorage.removeItem(CLAVE_RUTA); return; }
            localStorage.setItem(CLAVE_RUTA, JSON.stringify({ id: destino.id, tipo: destino.tipo, nombre: destino.nombre, modo, empezo: inicioNavegacion || null, ts: Date.now() }));
        } catch (e) {}
    }
    function borrarEstadoRuta() { try { localStorage.removeItem(CLAVE_RUTA); } catch (e) {} }

    function necesitaRutaAccesible() {
        try { return localStorage.getItem("accessibleRoutes") === "true"; } catch (e) { return false; }
    }

    async function seleccionarDestino(l) {
        destino = l;
        ultimoDestino = l;
        cerrarBusqueda();
        map.setView([l.lat, l.lng], 18);

        textoPanel("dest-name", l.nombre);
        textoPanel("arrival-name", `${l.nombre} - UAG Campus CU`);
        routePanel.classList.remove("hidden");
        guardarEstadoRuta();
        await trazarRuta(l);
    }

    const ESTILO_TRAMO = {
        normal:    { nombre: "Camino normal", color: "#8A3A0B", weight: 5, dash: null,    cap: "round" },
        escaleras: { nombre: "Escaleras",     color: "#D55E00", weight: 6, dash: "1 9",   cap: "round" },
        rampa:     { nombre: "Rampa",         color: "#0072B2", weight: 5, dash: "16 7",  cap: "butt" },
    };
    const colorTramo = (t) => (window.FMCDaltonismo && FMCDaltonismo.activo() ? FMCDaltonismo.RUTA[t] : ESTILO_TRAMO[t].color);
    const tipoDeTramo = (t) => (ESTILO_TRAMO[t] ? t : "normal");

    function dibujarTramos(tramos) {
        const corridas = [];
        tramos.forEach((t) => {
            const tipo = tipoDeTramo(t.tipo);
            const ult = corridas[corridas.length - 1];
            if (ult && ult.tipo === tipo) ult.pts.push([t.b.lat, t.b.lng]);
            else corridas.push({ tipo, pts: [[t.a.lat, t.a.lng], [t.b.lat, t.b.lng]] });
        });
        corridas.forEach((c) => L.polyline(c.pts, { color: "#ffffff", weight: ESTILO_TRAMO[c.tipo].weight + 5, opacity: 0.95, lineCap: "round", interactive: false }).addTo(capaSel));
        corridas.forEach((c) => {
            const e = ESTILO_TRAMO[c.tipo];
            L.polyline(c.pts, { color: colorTramo(c.tipo), weight: e.weight, opacity: 1, dashArray: e.dash, lineCap: e.cap, interactive: false }).addTo(capaSel);
        });
        return Array.from(new Set(corridas.map((c) => c.tipo)));
    }

    function pintarLeyenda(tipos, aproximada) {
        const cont = document.getElementById("route-legend");
        if (!cont) return;
        cont.textContent = "";
        const items = aproximada
            ? [{ nombre: "Línea recta aproximada", color: "#6b5a50", dash: "8 8", cap: "butt", weight: 4 }]
            : tipos.map((t) => ({ nombre: ESTILO_TRAMO[t].nombre, color: colorTramo(t), dash: ESTILO_TRAMO[t].dash, cap: ESTILO_TRAMO[t].cap, weight: ESTILO_TRAMO[t].weight }));
        const NS = "http://www.w3.org/2000/svg";
        items.forEach((it) => {
            const li = document.createElement("li");
            const svg = document.createElementNS(NS, "svg");
            svg.setAttribute("width", "44"); svg.setAttribute("height", "14"); svg.setAttribute("viewBox", "0 0 44 14"); svg.setAttribute("aria-hidden", "true");
            const l = document.createElementNS(NS, "line");
            l.setAttribute("x1", "3"); l.setAttribute("x2", "41"); l.setAttribute("y1", "7"); l.setAttribute("y2", "7");
            l.setAttribute("stroke", it.color); l.setAttribute("stroke-width", String(it.weight)); l.setAttribute("stroke-linecap", it.cap);
            if (it.dash) l.setAttribute("stroke-dasharray", it.dash);
            svg.appendChild(l);
            li.appendChild(svg);
            li.appendChild(document.createTextNode(it.nombre));
            cont.appendChild(li);
        });
    }

    let indiceRuta = 0;
    let destinoDeIndice = null;

    async function trazarRuta(l) {
        if (destinoDeIndice !== l) { indiceRuta = 0; destinoDeIndice = l; }
        capaSel.clearLayers();
        crearPin(l, true).addTo(capaSel);
        metrosRuta = null;
        pintarModos();

        const origen = await obtenerOrigen();
        if (destino !== l) return;
        capaSel.clearLayers();
        crearPin(l, true).addTo(capaSel);

        const soloAccesible = soloAccesibleEfectivo();
        let lista = R ? R.alternativas(grafo, origen, l, { soloAccesible }, 3) : [];
        let aviso = "";
        if (!lista.length && soloAccesible && R) {
            lista = R.alternativas(grafo, origen, l, { soloAccesible: false }, 3);
            if (lista.length) aviso = " No encontramos un camino 100% accesible: esta ruta puede incluir escaleras.";
        }
        if (indiceRuta >= lista.length) indiceRuta = 0;
        let ruta = lista[indiceRuta] || null;
        const extra = ruta && lista.length > 1 && indiceRuta > 0 ? ` Es ${Math.max(10, Math.round((ruta.metros - lista[0].metros) / 10) * 10)} m más larga que la ruta 1.` : "";
        if (btnOtraRuta) {
            btnOtraRuta.hidden = !ruta;
            btnOtraRuta.disabled = lista.length < 2;
            btnOtraRuta.textContent = lista.length < 2 ? "NO HAY OTRA RUTA" : `OTRA RUTA (${indiceRuta + 1}/${lista.length})`;
            btnOtraRuta.setAttribute("aria-label", lista.length < 2
                ? "NO HAY OTRA RUTA. No hay otro camino cercano para llegar a este destino"
                : `OTRA RUTA (${indiceRuta + 1}/${lista.length}). Ver otro camino para llegar al mismo destino`);
        }

        let metros, hint, tiposRuta = [];
        if (ruta) {
            metros = Math.round(ruta.metros / 10) * 10;
            tiposRuta = ruta.tramos && ruta.tramos.length ? dibujarTramos(ruta.tramos) : ["normal"];
            const rampas = soloAccesible ? (ruta.rampas || []) : [];
            const textoRampas = rampas.length ? ` Pasa por ${rampas.length === 1 ? "una rampa" : rampas.length + " rampas"} ♿.` : "";
            const numero = lista.length > 1 ? `Ruta ${indiceRuta + 1} de ${lista.length}. ` : "";
            const recta = map.distance([origen.lat, origen.lng], [l.lat, l.lng]);
            const vuelta = ruta.metros > 700 && ruta.metros > recta * 3 ? " Ojo: esta ruta da mucha vuelta; puede que todavía falte un camino en el mapa por esta zona." : "";
            hint = `${numero}Ruta por los andadores del campus hacia ${l.nombre}.${soloAccesible && !aviso ? " Camino accesible." : ""}${textoRampas}${extra}${aviso}${vuelta}`;
        } else {
            metros = Math.round(map.distance([origen.lat, origen.lng], [l.lat, l.lng]) * FACTOR_CAMINO / 10) * 10;
            L.polyline([[origen.lat, origen.lng], [l.lat, l.lng]], { color: "#ffffff", weight: 9, opacity: 0.95, interactive: false }).addTo(capaSel);
            L.polyline([[origen.lat, origen.lng], [l.lat, l.lng]], { color: "#6b5a50", weight: 4, dashArray: "8 8", interactive: false }).addTo(capaSel);
            hint = `Distancia aproximada en línea recta hacia ${l.nombre}: todavía no hay un camino trazado hasta ahí.`;
        }
        if (!marcaPosicion) marcaOrigen = L.circleMarker([origen.lat, origen.lng], { radius: 8, color: "#ffffff", weight: 3, fillColor: "#2b7bd6", fillOpacity: 1, interactive: false }).addTo(capaSel);

        if (l.tipo === "estacionamiento" && sinCajas !== l && window.FMCAcc && FMCAcc.cajasDe) {
            let cajas = [];
            try { cajas = await FMCAcc.cajasDe(l, 140); } catch (e) { cajas = []; }
            if (destino !== l) return;
            cajas.forEach((c) => {
                const ic = L.divIcon({ className: "", iconSize: [34, 34], iconAnchor: [17, 17], html: `<div style="width:34px;height:34px;border-radius:50%;background:#fff;border:3px solid #1d4f91;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 6px rgba(0,0,0,.4)" aria-hidden="true">${c.icono}</div>` });
                const mk = L.marker([c.lat, c.lng], { icon: ic, title: `${c.texto}, a ${c.m} m`, keyboard: false }).bindTooltip(`${c.texto} (${c.m} m)`).addTo(capaSel);
                const el = mk.getElement(); if (el) { el.setAttribute("role", "img"); el.setAttribute("aria-label", `${c.texto}, a ${c.m} metros`); }
            });
            if (cajas.length) {
                const resumen = {};
                cajas.forEach((c) => { resumen[c.texto] = (resumen[c.texto] || 0) + 1; });
                const lista2 = Object.keys(resumen).map((t) => `${resumen[t]} ${t.charAt(0).toLowerCase() + t.slice(1)}`).join(", ");
                hint += ` Cerca de este estacionamiento hay cajas especiales: ${lista2}.`;
            }
        }

        const tramos = ruta && ruta.tramos ? ruta.tramos : [{ a: { lat: origen.lat, lng: origen.lng }, b: { lat: l.lat, lng: l.lng }, metros, tipo: "libre" }];
        const aproximada = !ruta;
        const pasos = GUIA ? GUIA.generarPasos(tramos, l.nombre, { aproximada }) : [];
        rutaActual = { metros };
        textoPanel("origin-label", origen.etiqueta);
        metrosRuta = metros;
        pintarModos();
        textoPanel("route-hint", hint);
        pintarLeyenda(tiposRuta, !ruta);

        const resumenVoz = GUIA ? GUIA.resumen(l.nombre, metros, tramos, { aproximada, accesible: soloAccesible && !aviso }) : "";
        document.dispatchEvent(new CustomEvent("fmc:ruta", {
            detail: { perfilAccesible: soloAccesible, destino: l, origen, metros, minutos: minutos(metros, MODOS[modo].vel), modo, accesible: soloAccesible && !aviso, tramos, pasos, aproximada, resumen: resumenVoz },
        }));
    }

    if (searchTrigger && searchPanel) {
        searchTrigger.addEventListener("click", abrirBusqueda);
        searchTrigger.addEventListener("keydown", (e) => {
            if ((e.target === searchTrigger || e.target.matches("input[readonly]")) && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); abrirBusqueda(); }
        });
    }
    if (btnChange && searchPanel) btnChange.addEventListener("click", abrirBusqueda);
    if (btnOtraRuta) {
        btnOtraRuta.addEventListener("click", async () => {
            if (!destino || btnOtraRuta.disabled) return;
            indiceRuta += 1;
            await trazarRuta(destino);
            if (inicioNavegacion) document.dispatchEvent(new CustomEvent("fmc:rutacambiada"));
            btnOtraRuta.focus();
        });
    }

    const btnCancelarRuta = document.getElementById("btn-cancelar-ruta");
    if (btnCancelarRuta) {
        btnCancelarRuta.addEventListener("click", async () => {
            if (inicioNavegacion && !(await FMCAviso.confirmar("¿Cancelar la ruta que llevas en curso?", { si: "Cancelar ruta", no: "Seguir", peligro: true }))) return;
            if (inicioNavegacion) document.dispatchEvent(new CustomEvent("fmc:finalizar"));
            routePanel.classList.add("hidden");
            reiniciarBotones();
            limpiarRuta();
            FMCAviso.aviso("Ruta cancelada", "info");
        });
    }

    async function restaurarRuta() {
        let g = null;
        try { g = JSON.parse(localStorage.getItem(CLAVE_RUTA) || "null"); } catch (e) {}
        if (!g || Date.now() - g.ts > CADUCA_RUTA_MS) { borrarEstadoRuta(); return; }
        const l = lugares.find((x) => x.id === g.id && x.tipo === g.tipo) || lugares.find((x) => x.nombre === g.nombre);
        if (!l) { borrarEstadoRuta(); return; }
        modo = modosDisponibles().includes(g.modo) ? g.modo : modoInicial();
        if (g.empezo) inicioNavegacion = g.empezo;
        await seleccionarDestino(l);
        if (g.empezo) {
            marcarEnNavegacion();
            document.dispatchEvent(new CustomEvent("fmc:empezar"));
        }
    }

    modo = modoInicial();
    pintarModos();
    Promise.all([cargarLugares(), cargarGrafo()]).then(restaurarRuta).then(() => {
        let ir = null; try { ir = new URLSearchParams(location.search).get('ir'); } catch (e) {  }
        if (!ir) return;
        const l = lugares.find((x) => x.nombre === ir);
        if (l) { sinCajas = l; seleccionarDestino(l); }
    });

    function guardarUltimaRuta() {
        if (!rutaActual || !destino) return;
        const estimado = Math.round((rutaActual.metros / MODOS[modo].vel) * 60);
        let segundos = inicioNavegacion ? Math.round((Date.now() - inicioNavegacion) / 1000) : estimado;
        if (segundos < estimado * 0.2) segundos = estimado;
        try {
            localStorage.setItem("ultimaRuta", JSON.stringify({
                distancia_m: rutaActual.metros, duracion_s: segundos, destino: destino.nombre, actividad: modo, ts: Date.now(),
            }));
        } catch (e) {}
        if (typeof registrarActividad === "function") {
            registrarActividad({ tipo: modo, origen: "mapa", destino: destino.nombre, distancia_m: Math.round(rutaActual.metros), duracion_s: segundos });
        }
    }

    function marcarEnNavegacion() {
        btnStart.style.backgroundColor = (window.FMCDaltonismo && FMCDaltonismo.activo()) ? "#005a8d" : "#2f6f3a";
        btnStart.textContent = "EN NAVEGACIÓN";
        btnFinish.disabled = false;
        const dal = window.FMCDaltonismo && FMCDaltonismo.activo();
        btnFinish.style.backgroundColor = dal ? "#E69F00" : "#B3261E";
        btnFinish.style.color = dal ? "#000000" : "#ffffff";
        btnFinish.style.cursor = "pointer";
        pintarModos();
    }
    function reiniciarBotones() {
        if (!btnStart || !btnFinish) return;
        btnStart.style.backgroundColor = (window.FMCDaltonismo && FMCDaltonismo.activo()) ? "#0072B2" : "#B04E0E";
        btnStart.textContent = "EMPEZAR";
        btnFinish.disabled = true;
        btnFinish.style.backgroundColor = "#d8d8d8";
        btnFinish.style.color = "#777777";
        if (btnOtraRuta && !btnOtraRuta.hidden) btnOtraRuta.disabled = /NO HAY/.test(btnOtraRuta.textContent);
    }

    if (btnStart && btnFinish) {
        btnStart.addEventListener("click", () => {
            inicioNavegacion = Date.now();
            marcarEnNavegacion();
            guardarEstadoRuta();
            document.dispatchEvent(new CustomEvent("fmc:empezar"));
        });

        btnFinish.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("fmc:finalizar"));
            guardarUltimaRuta();
            borrarEstadoRuta();
            routePanel.classList.add("hidden");
            setTimeout(() => {
                arrivalPanel.classList.remove("hidden");
            }, 250);
        });
    }

    if (btnContinue) {
        btnContinue.addEventListener("click", () => {
            arrivalPanel.classList.add("hidden");
            setTimeout(() => {
                feedbackPanel.classList.remove("hidden");
            }, 250);
        });
    }

    let estrellasElegidas = 0;
    starBtns.forEach((star, index) => {
        star.addEventListener("click", () => {
            estrellasElegidas = index + 1;
            starBtns.forEach((s, idx) => {
                if (idx <= index) {
                    s.textContent = "★";
                    s.classList.add("selected");
                } else {
                    s.textContent = "☆";
                    s.classList.remove("selected");
                }
            });
        });
    });

    const contador = document.querySelector(".char-count");
    let miniMapa = null;
    let pinReporte = null;

    function prepararMiniMapa() {
        const caja = document.getElementById("report-map-box");
        if (!caja) return;
        if (!miniMapa) {
            caja.innerHTML = "";
            const lienzo = document.createElement("div");
            lienzo.style.cssText = "width:100%;height:100%;min-height:170px;border-radius:inherit;";
            caja.appendChild(lienzo);
            if (caja.offsetHeight < 170) caja.style.height = "170px";
            miniMapa = L.map(lienzo, { maxBounds: boundsUAG, minZoom: 16, maxZoom: 19, zoomControl: false, attributionControl: false });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(miniMapa);
            miniMapa.on("click", (e) => ponerPin(e.latlng));
        }
        const centro = ultimoDestino ? L.latLng(ultimoDestino.lat, ultimoDestino.lng) : L.latLng(20.6938, -103.4178);
        miniMapa.setView(centro, 18);
        setTimeout(() => miniMapa.invalidateSize(), 50);
        if (!pinReporte) ponerPin(centro);
    }

    function ponerPin(latlng) {
        if (pinReporte) { pinReporte.setLatLng(latlng); return; }
        pinReporte = L.marker(latlng, { draggable: true }).addTo(miniMapa);
    }

    function reiniciarFormularios() {
        estrellasElegidas = 0;
        starBtns.forEach((s) => { s.textContent = "☆"; s.classList.remove("selected"); });
        const c = document.querySelector(".comment-textarea"); if (c) c.value = "";
        const d = document.querySelector(".report-textarea"); if (d) d.value = "";
        if (contador) contador.textContent = "0/200";
        categoryChips.forEach((x, i) => x.classList.toggle("active", i === 0));
        if (pinReporte && miniMapa) { miniMapa.removeLayer(pinReporte); }
        pinReporte = null;
        ultimoDestino = null;
    }

    const closeFeedback = () => {
        if (feedbackPanel) feedbackPanel.classList.add("hidden");
        reiniciarFormularios();
        limpiarRuta();

        reiniciarBotones();
    };

    if (btnSendFeedback) {
        btnSendFeedback.addEventListener("click", async () => {
            if (!estrellasElegidas) {
                FMCAviso.aviso("Elige de 1 a 5 estrellas para enviar tu opinión.", 'error');
                return;
            }
            const comentario = (document.querySelector(".comment-textarea") || {}).value || "";
            btnSendFeedback.disabled = true;
            try {
                await apiFetch("/feedback/calificaciones", {
                    method: "POST",
                    body: {
                        estrellas: estrellasElegidas,
                        comentario,
                        destino_clave: ultimoDestino ? ultimoDestino.clave : null,
                        destino_nombre: ultimoDestino ? ultimoDestino.nombre : null,
                    },
                });
                FMCAviso.aviso("¡Muchas gracias por tu opinión! 🙌", 'ok');
                closeFeedback();
            } catch (e) {
                FMCAviso.aviso(e.message || "No se pudo enviar tu opinión. Intenta de nuevo.", 'error');
            } finally {
                btnSendFeedback.disabled = false;
            }
        });
    }

    if (btnSkipFeedback) {
        btnSkipFeedback.addEventListener("click", () => {
            closeFeedback();
        });
    }


    if (btnReportIssue && reportPanel) {
        btnReportIssue.addEventListener("click", () => {
            feedbackPanel.classList.add("hidden");
            setTimeout(() => {
                reportPanel.classList.remove("hidden");
                prepararMiniMapa();
            }, 250);
        });
    }

    const closeReport = () => {
        if (reportPanel) reportPanel.classList.add("hidden");
        setTimeout(() => {
            if (feedbackPanel) feedbackPanel.classList.remove("hidden");
        }, 250);
    };

    if (btnBackReport) btnBackReport.addEventListener("click", closeReport);
    if (btnCancelReport) btnCancelReport.addEventListener("click", closeReport);

    categoryChips.forEach(chip => {
        chip.addEventListener("click", () => {
            categoryChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
        });
    });

    if (btnSubmitReport) {
        btnSubmitReport.addEventListener("click", async () => {
            const chip = document.querySelector(".category-chip.active");
            const categoria = chip ? chip.dataset.categoria : "";
            if (!categoria) { FMCAviso.aviso("Elige qué tipo de problema encontraste.", 'error'); return; }
            if (!pinReporte) { FMCAviso.aviso("Toca el mapa para marcar dónde está el problema.", 'error'); return; }
            const ll = pinReporte.getLatLng();
            const descripcion = (document.querySelector(".report-textarea") || {}).value || "";
            btnSubmitReport.disabled = true;
            try {
                await apiFetch("/feedback/incidencias", {
                    method: "POST",
                    body: { categoria, descripcion, latitud: ll.lat, longitud: ll.lng },
                });
                if (reportPanel) reportPanel.classList.add("hidden");
                closeFeedback();
                FMCAviso.aviso("¡Reporte enviado con éxito! Muchas gracias por colaborar con la comunidad UAG.", 'ok');
            } catch (e) {
                FMCAviso.aviso(e.message || "No se pudo enviar el reporte. Intenta de nuevo.", 'error');
            } finally {
                btnSubmitReport.disabled = false;
            }
        });
    }

    function crearBotonCentrar() {
        btnCentrar = document.createElement("button");
        btnCentrar.type = "button";
        btnCentrar.id = "btn-centrar";
        btnCentrar.className = "btn-centrar-mapa";
        btnCentrar.hidden = true;
        btnCentrar.textContent = "📍";
        btnCentrar.title = "Centrar el mapa en mi ubicación";
        btnCentrar.setAttribute("aria-label", "Centrar el mapa en mi ubicación");
        btnCentrar.addEventListener("click", () => {
            siguiendo = true;
            btnCentrar.hidden = true;
            if (marcaPosicion) map.panTo(marcaPosicion.getLatLng(), { animate: true });
        });
        (document.querySelector(".map-container") || document.body).appendChild(btnCentrar);
    }
    function dejarDeSeguir() {
        if (!marcaPosicion) return;
        siguiendo = false;
        if (btnCentrar) btnCentrar.hidden = false;
    }
    crearBotonCentrar();
    map.on("dragstart", dejarDeSeguir);
    map.on("zoomstart", dejarDeSeguir);
    document.addEventListener("fmc:empezar", () => { siguiendo = true; if (btnCentrar) btnCentrar.hidden = true; });

    window.FMCMapa = {
        lugares: () => lugares,
        mapa: () => map,
        destino: () => destino,
        seleccionarDestino: (l) => seleccionarDestino(l),
        obtenerOrigen: () => obtenerOrigen(),
        recalcular: () => (destino ? trazarRuta(destino) : Promise.resolve()),
        dentroDelCampus: (lat, lng) => boundsUAG.contains(L.latLng(lat, lng)),
        abrirBusqueda: () => abrirBusqueda(),
        ponerPinReporte: (lat, lng) => {
            if (!miniMapa) return false;
            const ll = L.latLng(lat, lng);
            ponerPin(ll);
            miniMapa.setView(ll, 18);
            return true;
        },
        empezar: () => { if (btnStart) btnStart.click(); },
        enNavegacion: () => !!inicioNavegacion && !!btnFinish && !btnFinish.disabled,
        finalizar: () => { if (btnFinish && !btnFinish.disabled) btnFinish.click(); },
        mostrarPosicion: (lat, lng) => {
            if (marcaOrigen) { try { capaSel.removeLayer(marcaOrigen); } catch (e) {  } marcaOrigen = null; }
            if (!marcaPosicion) {
                marcaPosicion = L.circleMarker([lat, lng], { radius: 9, color: "#ffffff", weight: 3, fillColor: "#2b7bd6", fillOpacity: 1, interactive: false }).addTo(map);
            } else {
                marcaPosicion.setLatLng([lat, lng]);
            }
            if (siguiendo) map.panTo([lat, lng], { animate: true });
        },
        quitarPosicion: () => { if (marcaPosicion) { map.removeLayer(marcaPosicion); marcaPosicion = null; } siguiendo = true; if (btnCentrar) btnCentrar.hidden = true; },
    };

    const areaReporte = document.querySelector(".report-textarea");
    if (areaReporte && contador) {
        areaReporte.addEventListener("input", () => { contador.textContent = `${areaReporte.value.length}/200`; });
    }
});
