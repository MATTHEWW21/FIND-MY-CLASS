document.addEventListener("DOMContentLoaded", () => {
    // 1. Delimitar área de la UAG e inicializar el mapa
    // (márgenes un poco más amplios que antes para que los pines de las orillas se vean completos)
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

    // Refresco de lienzo para asegurar renderizado correcto en móviles
    setTimeout(() => { map.invalidateSize(); }, 300);

    // 2. Referencias a Elementos del DOM
    const searchTrigger = document.getElementById("search-trigger");
    const routePanel = document.getElementById("route-panel");       // Panel 1: Ruta Detallada
    const arrivalPanel = document.getElementById("arrival-panel");   // Panel 2: ¡Llegaste a tu destino!
    const feedbackPanel = document.getElementById("feedback-panel"); // Panel 3: Tu Experiencia
    const reportPanel = document.getElementById("report-panel");     // Panel 4: Reportar Incidencia
    const searchPanel = document.getElementById("search-panel");     // Panel nuevo: Buscador

    const btnStart = document.getElementById("btn-start");
    const btnFinish = document.getElementById("btn-finish");
    const btnContinue = document.getElementById("btn-continue");
    const btnChange = document.querySelector(".btn-change");

    const btnSendFeedback = document.getElementById("btn-send-feedback");
    const btnSkipFeedback = document.getElementById("btn-skip-feedback");
    const starBtns = document.querySelectorAll(".star-btn");

    // Botones del Panel de Reporte
    const btnReportIssue = document.getElementById("btn-report-issue");
    const btnBackReport = document.getElementById("btn-back-report");
    const btnCancelReport = document.getElementById("btn-cancel-report");
    const btnSubmitReport = document.getElementById("btn-submit-report");
    const categoryChips = document.querySelectorAll(".category-chip");

    // ==========================================
    // LUGARES DEL CAMPUS: PINES, CHIPS Y BUSCADOR
    // ==========================================
    const B = window.FMCBusqueda;
    const TIPOS = B ? B.TIPOS : {};

    const MIN_CAMINANDO = 80;   // metros por minuto (≈ 4.8 km/h)
    const MIN_BICI = 250;       // metros por minuto (≈ 15 km/h)
    const FACTOR_CAMINO = 1.3;  // la línea recta siempre es más corta que el camino real

    let lugares = [];
    let destino = null;
    let rutaActual = null;      // { metros } de la ruta dibujada, para guardarla al finalizar
    let inicioNavegacion = null;
    let ultimoDestino = null;   // se conserva hasta cerrar la calificación (limpiarRuta borra `destino`)
    let capaBase = L.layerGroup().addTo(map);   // edificios y puertas: siempre visibles
    let capaSel = L.layerGroup().addTo(map);    // destino elegido y línea de ruta
    const capasChip = {};                       // snacks / alimentos / bebedero: se prenden con los chips

    function crearPin(l, seleccionado) {
        const t = TIPOS[l.tipo] || { emoji: '📍' };
        const icono = L.divIcon({
            className: 'fmc-pin-wrap',
            html: `<div class="fmc-pin${seleccionado ? ' sel' : ''}">${t.emoji}</div>`,
            iconSize: seleccionado ? [40, 40] : [30, 30],
            iconAnchor: seleccionado ? [20, 20] : [15, 15],
        });
        const m = L.marker([l.lat, l.lng], { icon: icono, title: l.nombre });
        m.bindTooltip(l.nombre, { direction: 'top', offset: [0, -14] });
        m.on('click', () => seleccionarDestino(l));
        return m;
    }

    function dibujarPines() {
        capaBase.clearLayers();
        Object.keys(capasChip).forEach((k) => capasChip[k].clearLayers());
        lugares.forEach((l) => {
            if (l.tipo === 'edificio' || l.tipo === 'puerta') {
                crearPin(l, false).addTo(capaBase);
            } else if (capasChip[l.tipo]) {
                crearPin(l, false).addTo(capasChip[l.tipo]);
            }
        });
    }

    // Chips de filtros: prenden y apagan las capas de snacks, comida y bebederos
    document.querySelectorAll(".filter-chips .chip[data-tipo]").forEach((chip) => {
        const tipo = chip.dataset.tipo;
        capasChip[tipo] = L.layerGroup();
        chip.addEventListener("click", () => {
            const activo = chip.classList.toggle("active");
            if (activo) capasChip[tipo].addTo(map);
            else map.removeLayer(capasChip[tipo]);
        });
    });

    async function cargarLugares() {
        try {
            const data = await apiFetch('/mapa/lugares');
            lugares = B.preparar(data);
            dibujarPines();
        } catch (err) {
            console.error('No se pudieron cargar los lugares del mapa:', err);
        }
    }

    // Red de caminos (puntos y tramos). Si todavia no hay, las rutas se dibujan en linea recta aproximada.
    const R = window.FMCRutas;
    let grafo = { puntos: [], rutas: [] };
    async function cargarGrafo() {
        try {
            grafo = await apiFetch('/mapa/grafo');
        } catch (err) {
            console.error('No se pudo cargar la red de caminos:', err);
        }
    }

    // ---------- Buscador ----------
    const inputBusqueda = document.getElementById("search-input");
    const listaResultados = document.getElementById("search-results");
    const catsBusqueda = document.getElementById("search-cats");
    const btnCerrarBusqueda = document.getElementById("btn-close-search");
    let tipoFiltro = "";

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
        boton.addEventListener("click", () => seleccionarDestino(l));
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
            // Sin búsqueda: todo agrupado por tipo
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

    // ---------- Destino y ruta (línea recta aproximada por ahora) ----------
    function obtenerOrigen() {
        const puerta1 = lugares.find((l) => l.numero === "P1");
        const respaldo = {
            lat: puerta1 ? puerta1.lat : 20.6920,
            lng: puerta1 ? puerta1.lng : -103.4163,
            etiqueta: "DESDE LA PUERTA 1",
        };
        return new Promise((resolve) => {
            if (!navigator.geolocation) return resolve(respaldo);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const p = L.latLng(pos.coords.latitude, pos.coords.longitude);
                    // Si estás fuera del campus (o el GPS falló), se calcula desde la Puerta 1
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
        destino = null;
    }

    // Opción "Solo ruta accesible" (se recuerda en este navegador)
    const toggleAccesible = document.getElementById("toggle-accesible");
    try { if (toggleAccesible) toggleAccesible.checked = localStorage.getItem("soloAccesible") === "1"; } catch (e) {}
    if (toggleAccesible) {
        toggleAccesible.addEventListener("change", () => {
            try { localStorage.setItem("soloAccesible", toggleAccesible.checked ? "1" : "0"); } catch (e) {}
            if (destino) trazarRuta(destino);
        });
    }

    async function seleccionarDestino(l) {
        destino = l;
        ultimoDestino = l;
        cerrarBusqueda();
        map.setView([l.lat, l.lng], 18);

        // Textos del panel con el destino real
        textoPanel("dest-name", l.nombre);
        textoPanel("arrival-name", `${l.nombre} - UAG Campus CU`);
        routePanel.classList.remove("hidden");
        await trazarRuta(l);
    }

    // Dibuja la ruta hacia l: por los andadores si hay red de caminos, o en línea recta aproximada si no
    async function trazarRuta(l) {
        capaSel.clearLayers();
        crearPin(l, true).addTo(capaSel);
        textoPanel("metric-walk", "🚶 … MIN");
        textoPanel("metric-bike", "🚴 … MIN");

        const origen = await obtenerOrigen();
        if (destino !== l) return; // eligió otro destino mientras se obtenía la ubicación
        capaSel.clearLayers();
        crearPin(l, true).addTo(capaSel);

        const soloAccesible = !!(toggleAccesible && toggleAccesible.checked);
        let ruta = R ? R.calcular(grafo, origen, l, { soloAccesible }) : null;
        let aviso = "";
        if (!ruta && soloAccesible && R) {
            ruta = R.calcular(grafo, origen, l, { soloAccesible: false });
            if (ruta) aviso = " No encontramos un camino 100% accesible: esta ruta puede incluir escaleras.";
        }

        let metros, hint;
        if (ruta) {
            metros = Math.round(ruta.metros / 10) * 10;
            L.polyline(ruta.camino.map((p) => [p.lat, p.lng]), { color: "#d07f4c", weight: 5, opacity: 0.9 }).addTo(capaSel);
            hint = `Ruta por los andadores del campus hacia ${l.nombre}.${soloAccesible && !aviso ? " Camino accesible." : ""}${aviso}`;
        } else {
            metros = Math.round(map.distance([origen.lat, origen.lng], [l.lat, l.lng]) * FACTOR_CAMINO / 10) * 10;
            L.polyline([[origen.lat, origen.lng], [l.lat, l.lng]], { color: "#d07f4c", weight: 4, dashArray: "8 8" }).addTo(capaSel);
            hint = `Distancia aproximada en línea recta hacia ${l.nombre}: todavía no hay un camino trazado hasta ahí.`;
        }
        L.circleMarker([origen.lat, origen.lng], { radius: 8, color: "#ffffff", weight: 3, fillColor: "#2b7bd6", fillOpacity: 1 }).addTo(capaSel);

        rutaActual = { metros };
        textoPanel("origin-label", origen.etiqueta);
        textoPanel("metric-walk", `🚶 ${minutos(metros, MIN_CAMINANDO)} MIN - ${metros} M`);
        textoPanel("metric-bike", `🚴 ${minutos(metros, MIN_BICI)} MIN - ${metros} M`);
        textoPanel("route-hint", hint);
    }

    // ABRIR EL BUSCADOR: al dar tap en "BUSCA AQUÍ" (y al pulsar "VER OTRA RUTA")
    if (searchTrigger && searchPanel) searchTrigger.addEventListener("click", abrirBusqueda);
    if (btnChange && searchPanel) btnChange.addEventListener("click", abrirBusqueda);

    cargarLugares();
    cargarGrafo();

    // Guarda la última ruta terminada: "Nueva publicación" la usa para llenar distancia, tiempo y calorías
    function guardarUltimaRuta() {
        if (!rutaActual || !destino) return;
        const estimado = Math.round((rutaActual.metros / MIN_CAMINANDO) * 60);   // segundos a pie
        let segundos = inicioNavegacion ? Math.round((Date.now() - inicioNavegacion) / 1000) : estimado;
        if (segundos < estimado * 0.2) segundos = estimado;   // si se pulsó FINALIZAR casi al instante (pruebas), se usa el tiempo estimado
        try {
            localStorage.setItem("ultimaRuta", JSON.stringify({
                distancia_m: rutaActual.metros, duracion_s: segundos, destino: destino.nombre, ts: Date.now(),
            }));
        } catch (e) {}
    }

    // BOTÓN EMPEZAR Y FINALIZAR
    if (btnStart && btnFinish) {
        btnStart.addEventListener("click", () => {
            inicioNavegacion = Date.now();
            btnStart.style.backgroundColor = "#5b8e5a";
            btnStart.textContent = "EN NAVEGACIÓN";
            btnFinish.disabled = false;
            btnFinish.style.backgroundColor = "#d9534f";
            btnFinish.style.color = "#ffffff";
            btnFinish.style.cursor = "pointer";
        });

        // PASO 1 A PASO 2: Al pulsar FINALIZAR abre "¡Llegaste a tu destino!"
        btnFinish.addEventListener("click", () => {
            guardarUltimaRuta();
            routePanel.classList.add("hidden");
            setTimeout(() => {
                arrivalPanel.classList.remove("hidden");
            }, 250);
        });
    }

    // PASO 2 A PASO 3: Al pulsar CONTINUAR abre "TU EXPERIENCIA"
    if (btnContinue) {
        btnContinue.addEventListener("click", () => {
            arrivalPanel.classList.add("hidden");
            setTimeout(() => {
                feedbackPanel.classList.remove("hidden");
            }, 250);
        });
    }

    // SISTEMA INTERACTIVO DE ESTRELLAS
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

    // ---------- Mini mapa del reporte: tocar para colocar el pin ----------
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
        // Empieza centrado en el destino (o el centro del campus) con el pin ya puesto ahí
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

    // CERRAR Y REINICIAR LA VISTA GENERAL
    const closeFeedback = () => {
        if (feedbackPanel) feedbackPanel.classList.add("hidden");
        reiniciarFormularios();
        limpiarRuta();

        // Reinicia los botones de inicio al estado original
        if (btnStart && btnFinish) {
            btnStart.style.backgroundColor = "#f28d52";
            btnStart.textContent = "EMPEZAR";
            btnFinish.disabled = true;
            btnFinish.style.backgroundColor = "#d8d8d8";
            btnFinish.style.color = "#777777";
        }
    };

    // Si le da tap a ENVIAR: guarda la calificación en el servidor y cierra
    if (btnSendFeedback) {
        btnSendFeedback.addEventListener("click", async () => {
            if (!estrellasElegidas) {
                alert("Elige de 1 a 5 estrellas para enviar tu opinión.");
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
                alert("¡Muchas gracias por tu opinión! 🙌");
                closeFeedback();
            } catch (e) {
                alert(e.message || "No se pudo enviar tu opinión. Intenta de nuevo.");
            } finally {
                btnSendFeedback.disabled = false;
            }
        });
    }

    // Si le da tap a AHORA NO, GRACIAS: Se cierra en silencio
    if (btnSkipFeedback) {
        btnSkipFeedback.addEventListener("click", () => {
            closeFeedback();
        });
    }

    // ==========================================
    // PASO 3 A PASO 4: FLUJO DE REPORTAR INCIDENCIA
    // ==========================================

    // Abrir la pantalla de Reportar Incidencia al presionar "Reportar ❗️"
    if (btnReportIssue && reportPanel) {
        btnReportIssue.addEventListener("click", () => {
            feedbackPanel.classList.add("hidden");
            setTimeout(() => {
                reportPanel.classList.remove("hidden");
                prepararMiniMapa();
            }, 250);
        });
    }

    // Regresar de Reportar a la pantalla de Valoración
    const closeReport = () => {
        if (reportPanel) reportPanel.classList.add("hidden");
        setTimeout(() => {
            if (feedbackPanel) feedbackPanel.classList.remove("hidden");
        }, 250);
    };

    if (btnBackReport) btnBackReport.addEventListener("click", closeReport);
    if (btnCancelReport) btnCancelReport.addEventListener("click", closeReport);

    // Selección de chips de categoría
    categoryChips.forEach(chip => {
        chip.addEventListener("click", () => {
            categoryChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
        });
    });

    // Enviar Reporte: guarda la incidencia (categoría, descripción y ubicación del pin)
    if (btnSubmitReport) {
        btnSubmitReport.addEventListener("click", async () => {
            const chip = document.querySelector(".category-chip.active");
            const categoria = chip ? chip.dataset.categoria : "";
            if (!categoria) { alert("Elige qué tipo de problema encontraste."); return; }
            if (!pinReporte) { alert("Toca el mapa para marcar dónde está el problema."); return; }
            const ll = pinReporte.getLatLng();
            const descripcion = (document.querySelector(".report-textarea") || {}).value || "";
            btnSubmitReport.disabled = true;
            try {
                await apiFetch("/feedback/incidencias", {
                    method: "POST",
                    body: { categoria, descripcion, latitud: ll.lat, longitud: ll.lng },
                });
                if (reportPanel) reportPanel.classList.add("hidden");
                closeFeedback(); // Reinicia el flujo
                alert("¡Reporte enviado con éxito! Muchas gracias por colaborar con la comunidad UAG.");
            } catch (e) {
                alert(e.message || "No se pudo enviar el reporte. Intenta de nuevo.");
            } finally {
                btnSubmitReport.disabled = false;
            }
        });
    }

    // Contador de caracteres de la descripción
    const areaReporte = document.querySelector(".report-textarea");
    if (areaReporte && contador) {
        areaReporte.addEventListener("input", () => { contador.textContent = `${areaReporte.value.length}/200`; });
    }
});