// publicacion.js - pantalla "Nueva publicación": fotos (hasta 3), actividad, estadísticas de tu última ruta,
// ubicación, privacidad y envío al servidor. Requiere api.js (y mapa-busqueda.js para elegir ubicación).
document.addEventListener("DOMContentLoaded", () => {
    if (typeof requerirSesion === "function" && !requerirSesion()) return;

    const $ = (id) => document.getElementById(id);
    const MAX_FOTOS = 3;
    const LADO_MAX = 1080;           // las fotos se reducen a 1080 px de lado mayor antes de subirlas
    const PESO_KG = 70;              // peso de referencia para estimar calorías (aproximado)
    const MET = { caminata: 3.5, carrera: 9, ciclismo: 6.8, inclusivo: 3, scooter: 4 };
    const ACT = {
        caminata:  { emoji: "🚶", nombre: "CAMINATA" },
        carrera:   { emoji: "🏃", nombre: "CARRERA" },
        ciclismo:  { emoji: "🚴", nombre: "CICLISMO" },
        inclusivo: { emoji: "♿", nombre: "RECORRIDO INCLUSIVO" },
        scooter:   { emoji: "🛴", nombre: "SCOOTER" },
    };

    const estado = { actividad: "caminata", fotos: [], ubicacion: null, privacidad: "todos", ruta: null };

    // Última ruta terminada en el mapa (solo si es de las últimas 12 horas)
    try {
        const r = JSON.parse(localStorage.getItem("ultimaRuta") || "null");
        if (r && Date.now() - r.ts < 12 * 3600 * 1000 && r.distancia_m > 0 && r.duracion_s > 0) {
            estado.ruta = r;
            estado.ubicacion = r.destino || null;
        }
    } catch (e) {}

    // ---------- utilidades ----------
    const fmtDistancia = (m) => (m < 1000 ? `${m} M` : `${(m / 1000).toFixed(2)} KM`);
    const fmtDuracion = (s) => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
        return [h, m, x].map((n) => String(n).padStart(2, "0")).join(":");
    };
    const calorias = () => (estado.ruta ? Math.round(MET[estado.actividad] * PESO_KG * (estado.ruta.duracion_s / 3600)) : null);

    function aviso(texto) {
        const t = document.createElement("div");
        t.className = "pub-toast"; t.textContent = texto;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2600);
    }

    // ---------- pintar pantalla ----------
    function pintar() {
        const act = ACT[estado.actividad];
        $("display-activity-name").textContent = act.nombre;
        // El ícono y el color de los dos círculos siguen a la actividad elegida
        const A = window.FMCActividades;
        const info = A.ACTIVIDADES[estado.actividad];
        const botonIcono = $("open-activity-modal");
        botonIcono.innerHTML = A.icono(estado.actividad, 20);
        botonIcono.style.backgroundColor = info.color;
        $("publish-badge").innerHTML = A.icono(estado.actividad, 20);
        $("publish-badge").style.backgroundColor = info.color;

        const kcal = calorias();
        const tieneStats = !!estado.ruta;
        $("display-dist").textContent = tieneStats ? fmtDistancia(estado.ruta.distancia_m) : "—";
        $("display-dur").textContent = tieneStats ? fmtDuracion(estado.ruta.duracion_s) : "—";
        $("display-cal").textContent = tieneStats ? String(kcal) : "—";
        $("ov-dist").textContent = $("display-dist").textContent;
        $("ov-dur").textContent = $("display-dur").textContent;
        $("ov-cal").textContent = $("display-cal").textContent;

        // Interruptor de estadísticas: solo si hay una ruta terminada
        $("chk-stats").disabled = !tieneStats;
        if (!tieneStats) $("chk-stats").checked = false;
        $("txt-stats-ayuda").textContent = tieneStats ? "Calorías aproximadas" : "Termina una ruta en el mapa para incluirlas";
        $("overlay-stats").classList.toggle("hidden", !(tieneStats && $("chk-stats").checked));

        // Fotos
        const hay = estado.fotos.length > 0;
        const principal = $("main-preview-img"), cuadro = $("selected-publish-img");
        principal.classList.toggle("hidden", !hay); cuadro.classList.toggle("hidden", !hay);
        if (hay) { principal.src = estado.fotos[0]; cuadro.src = estado.fotos[0]; }
        $("sin-foto").classList.toggle("hidden", hay);

        const cont = $("miniaturas");
        cont.innerHTML = "";
        estado.fotos.forEach((src, i) => {
            const mini = document.createElement("div");
            mini.className = "mini";
            const img = document.createElement("img"); img.src = src; img.alt = `Foto ${i + 1}`;
            const x = document.createElement("button"); x.type = "button"; x.textContent = "✕"; x.setAttribute("aria-label", "Quitar foto");
            x.addEventListener("click", () => { estado.fotos.splice(i, 1); pintar(); });
            mini.appendChild(img); mini.appendChild(x);
            cont.appendChild(mini);
        });
        if (estado.fotos.length < MAX_FOTOS) {
            const mas = document.createElement("div");
            mas.className = "agregar"; mas.textContent = "＋"; mas.setAttribute("role", "button");
            mas.addEventListener("click", () => $("input-fotos").click());
            cont.appendChild(mas);
        }

        $("txt-ubicacion").textContent = estado.ubicacion || "Sin ubicación";
        $("txt-privacidad").textContent = estado.privacidad === "todos" ? "Todos" : "Solo yo";
    }

    // ---------- fotos: se leen, se reducen y se guardan como JPEG (data URL) ----------
    function reducir(archivo) {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();
            lector.onerror = () => reject(new Error("No se pudo leer la foto"));
            lector.onload = () => {
                const img = new Image();
                img.onerror = () => reject(new Error("Ese archivo no se pudo abrir como foto"));
                img.onload = () => {
                    const escala = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
                    const c = document.createElement("canvas");
                    c.width = Math.round(img.width * escala); c.height = Math.round(img.height * escala);
                    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                    resolve(c.toDataURL("image/jpeg", 0.8));
                };
                img.src = lector.result;
            };
            lector.readAsDataURL(archivo);
        });
    }

    $("input-fotos").addEventListener("change", async (e) => {
        const archivos = Array.from(e.target.files || []);
        e.target.value = "";
        for (const a of archivos) {
            if (estado.fotos.length >= MAX_FOTOS) { aviso(`Máximo ${MAX_FOTOS} fotos`); break; }
            if (!/^image\//.test(a.type)) { aviso("Solo se pueden subir imágenes"); continue; }
            try { estado.fotos.push(await reducir(a)); }
            catch (err) { aviso(err.message); }
        }
        pintar();
    });
    $("btn-agregar-foto-grande").addEventListener("click", () => $("input-fotos").click());

    // ---------- navegación entre pasos ----------
    const paso1 = $("step-photo-select"), paso2 = $("step-publish-details");
    $("btn-close").addEventListener("click", () => {
        const hayCambios = estado.fotos.length || $("pie-foto").value.trim();
        if (hayCambios && !confirm("¿Descartar esta publicación?")) return;
        window.location.href = "feed.html";
    });
    $("btn-next").addEventListener("click", () => { paso1.classList.add("hidden"); paso2.classList.remove("hidden"); window.scrollTo(0, 0); });
    $("btn-back-step").addEventListener("click", () => { paso2.classList.add("hidden"); paso1.classList.remove("hidden"); });
    $("chk-stats").addEventListener("change", pintar);

    // ---------- actividad (pop-over) ----------
    const modal = $("activity-modal");
    let actividadElegida = estado.actividad;
    $("open-activity-modal").addEventListener("click", () => {
        actividadElegida = estado.actividad;
        document.querySelectorAll(".option-item").forEach((i) => i.classList.toggle("selected", i.dataset.act === actividadElegida));
        modal.classList.remove("hidden");
    });
    document.querySelectorAll(".option-item").forEach((item) => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".option-item").forEach((i) => i.classList.remove("selected"));
            item.classList.add("selected");
            actividadElegida = item.dataset.act;
        });
    });
    $("btn-accept-activity").addEventListener("click", () => { estado.actividad = actividadElegida; modal.classList.add("hidden"); pintar(); });
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

    // ---------- privacidad ----------
    $("fila-privacidad").addEventListener("click", () => {
        estado.privacidad = estado.privacidad === "todos" ? "solo_yo" : "todos";
        pintar();
    });

    // ---------- ubicación: lista de lugares del campus ----------
    let lugares = null;
    async function elegirUbicacion() {
        const caja = document.createElement("div");
        const titulo = document.createElement("h4"); titulo.textContent = "Añadir ubicación";
        const buscador = document.createElement("div"); buscador.className = "pub-form";
        const entrada = document.createElement("input"); entrada.type = "text"; entrada.placeholder = "Busca un lugar del campus…";
        buscador.appendChild(entrada);
        const lista = document.createElement("div"); lista.className = "lista pub-lugares-lista";
        caja.appendChild(titulo); caja.appendChild(buscador); caja.appendChild(lista);

        const fondo = document.createElement("div"); fondo.className = "pub-fondo";
        const hoja = document.createElement("div"); hoja.className = "pub-hoja"; hoja.appendChild(caja);
        fondo.appendChild(hoja);
        fondo.addEventListener("click", (e) => { if (e.target === fondo) fondo.remove(); });
        document.body.appendChild(fondo);

        const item = (texto, sub, valor) => {
            const d = document.createElement("div"); d.className = "item"; d.textContent = texto;
            if (sub) { const s = document.createElement("small"); s.textContent = sub; d.appendChild(s); }
            d.addEventListener("click", () => { estado.ubicacion = valor; fondo.remove(); pintar(); });
            return d;
        };
        function pintarLista() {
            lista.innerHTML = "";
            if (estado.ubicacion) lista.appendChild(item("✕ Quitar ubicación", "", null));
            if (!lugares) { lista.appendChild(Object.assign(document.createElement("p"), { className: "pub-vacio", textContent: "Cargando lugares…" })); return; }
            const B = window.FMCBusqueda;
            const res = (B ? B.buscar(lugares, entrada.value, "") : lugares).slice(0, 40);
            res.forEach((l) => lista.appendChild(item(l.nombre, B && B.TIPOS[l.tipo] ? B.TIPOS[l.tipo].sing : "", l.nombre)));
            if (!res.length) lista.appendChild(Object.assign(document.createElement("p"), { className: "pub-vacio", textContent: "No encontramos ese lugar." }));
        }
        entrada.addEventListener("input", pintarLista);
        pintarLista();
        if (!lugares) {
            try {
                const datos = await apiFetch("/mapa/lugares");
                lugares = window.FMCBusqueda ? window.FMCBusqueda.preparar(datos) : datos;
            } catch (e) { lugares = []; aviso("No se pudieron cargar los lugares"); }
            pintarLista();
        }
    }
    $("fila-ubicacion").addEventListener("click", elegirUbicacion);

    // ---------- publicar ----------
    $("btn-publish").addEventListener("click", async () => {
        const pie = $("pie-foto").value.trim();
        if (!pie && !estado.fotos.length) { aviso("Escribe algo o agrega una foto"); return; }
        const boton = $("btn-publish");
        boton.disabled = true; boton.textContent = "PUBLICANDO…";
        try {
            await apiFetch("/publicaciones", {
                method: "POST",
                body: {
                    actividad: estado.actividad,
                    pie_foto: pie,
                    fotos: estado.fotos,
                    ubicacion: estado.ubicacion,
                    privacidad: estado.privacidad,
                    mostrar_estadisticas: !!estado.ruta && $("chk-stats").checked,
                    distancia_m: estado.ruta ? estado.ruta.distancia_m : null,
                    duracion_s: estado.ruta ? estado.ruta.duracion_s : null,
                    calorias: calorias(),
                },
            });
            try { localStorage.removeItem("ultimaRuta"); } catch (e) {}   // una ruta se publica una sola vez
            window.location.href = "feed.html";
        } catch (e) {
            aviso(e.message);
            boton.disabled = false; boton.textContent = "PUBLICAR";
        }
    });

    pintar();
});