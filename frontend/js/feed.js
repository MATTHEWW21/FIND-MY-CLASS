// feed.js - feed de la comunidad: lista publicaciones reales, me gusta, comentarios, menú ⋮ (eliminar / reportar).
// Requiere api.js cargado antes. Todo el texto de usuarios se inserta con textContent (nunca innerHTML).
document.addEventListener("DOMContentLoaded", () => {
    const cont = document.getElementById("feed-posts");
    if (!cont) return;
    if (typeof requerirSesion === "function" && !requerirSesion()) return;

    const ACT = {
        caminata:  { emoji: "🚶", nombre: "Caminata" },
        carrera:   { emoji: "🏃", nombre: "Carrera" },
        ciclismo:  { emoji: "🚴", nombre: "Ciclismo" },
        inclusivo: { emoji: "♿", nombre: "Recorrido inclusivo" },
        scooter:   { emoji: "🛴", nombre: "Scooter" },
    };
    const MOTIVOS = [["ofensivo", "Contenido ofensivo"], ["spam", "Spam o publicidad"], ["falso", "Información falsa"], ["otro", "Otro motivo"]];

    // ---------- utilidades ----------
    function el(tag, clase, texto) {
        const e = document.createElement(tag);
        if (clase) e.className = clase;
        if (texto != null) e.textContent = texto;
        return e;
    }

    function iniciales(nombre) {
        const p = String(nombre || "?").trim().split(/\s+/).slice(0, 2);
        return p.map((x) => x.charAt(0).toUpperCase()).join("") || "?";
    }

    function enlacePerfil(autor, clase, hijo, oculto) {
        const a = el("a", clase);
        a.href = "perfil_usuario.html?id=" + encodeURIComponent(autor.id);
        if (oculto) { a.tabIndex = -1; a.setAttribute("aria-hidden", "true"); }
        a.appendChild(hijo);
        return a;
    }

    function avatar(autor, chico) {
        return el("span", `avatar-iniciales ${autor.rol === "colaborador" ? "colaborador" : ""} ${chico ? "chico" : ""}`, iniciales(autor.nombre));
    }

    function cuando(iso) {
        const d = new Date(iso), ahora = new Date();
        const seg = (ahora - d) / 1000;
        if (seg < 60) return "Hace un momento";
        if (seg < 3600) return `Hace ${Math.floor(seg / 60)} min`;
        const hora = d.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
        const mismoDia = d.toDateString() === ahora.toDateString();
        const ayer = new Date(ahora); ayer.setDate(ayer.getDate() - 1);
        if (mismoDia) return `Hoy, ${hora}`;
        if (d.toDateString() === ayer.toDateString()) return `Ayer, ${hora}`;
        return `${d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}, ${hora}`;
    }

    function titulo(p) {
        const h = new Date(p.creado_en).getHours();
        const franja = h < 12 ? "en la mañana" : h < 19 ? "en la tarde" : "en la noche";
        return `${ACT[p.actividad].nombre} ${franja}`;
    }

    const fmtDistancia = (m) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(2)} km`);
    const fmtDuracion = (s) => {
        if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min`;
        const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
        return `${h} h ${String(m).padStart(2, "0")} min`;
    };

    function aviso(texto) {
        const t = el("div", "pub-toast", texto);
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2600);
    }

    const ICONO_CORAZON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
    const ICONO_COMENT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    const ICONO_MAS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>';

    // ---------- hojas inferiores (comentarios, menú) ----------
    function abrirHoja(contenido) {
        const fondo = el("div", "pub-fondo");
        const hoja = el("div", "pub-hoja");
        hoja.appendChild(contenido);
        fondo.appendChild(hoja);
        fondo.addEventListener("click", (e) => { if (e.target === fondo) fondo.remove(); });
        document.body.appendChild(fondo);
        return fondo;
    }

    // ---------- tarjeta de publicación ----------
    function textoLikes(p) {
        if (p.yo_di_like) return p.likes <= 1 ? "Te gusta a ti" : `Te gusta a ti y a ${p.likes - 1} más`;
        if (p.likes === 0) return "Sé la primera persona en dar me gusta";
        return p.likes === 1 ? "Le gusta a 1 persona" : `Le gusta a ${p.likes} personas`;
    }

    function crearTarjeta(p) {
        const card = el("article", "post-card");

        const cab = el("div", "pub-cabecera");
        cab.appendChild(enlacePerfil(p.autor, "enlace-perfil", avatar(p.autor), true));
        const info = el("div", "user-info");
        const nombre = el("h3", "user-name");
        nombre.appendChild(enlacePerfil(p.autor, "enlace-perfil", document.createTextNode(p.autor.nombre)));
        if (p.autor.rol === "colaborador") nombre.appendChild(el("span", "pub-insignia", "Colaborador UAG"));
        info.appendChild(nombre);
        info.appendChild(el("span", "post-time", `${cuando(p.creado_en)}${p.privacidad === "solo_yo" ? " · 🔒 Solo tú" : ""}`));
        cab.appendChild(info);
        const insignia = el("div", "pub-insignia-actividad");
        insignia.innerHTML = window.FMCActividades ? window.FMCActividades.icono(p.actividad, 20) : ACT[p.actividad].emoji;
        if (window.FMCActividades) insignia.style.backgroundColor = window.FMCActividades.ACTIVIDADES[p.actividad].color;
        cab.appendChild(insignia);
        card.appendChild(cab);

        card.appendChild(el("h2", "activity-title", titulo(p)));
        if (p.ubicacion) card.appendChild(el("div", "pub-ubicacion", `📍 ${p.ubicacion}`));

        const stats = [];
        if (p.mostrar_estadisticas) {
            if (p.distancia_m != null) stats.push(["Distancia", fmtDistancia(p.distancia_m)]);
            if (p.calorias != null) stats.push(["Calorías", String(p.calorias)]);
            if (p.duracion_s != null) stats.push(["Tiempo", fmtDuracion(p.duracion_s)]);
        }
        if (stats.length) {
            const grid = el("div", "metrics-grid");
            stats.forEach(([lbl, val]) => {
                const it = el("div", "metric-item");
                it.appendChild(el("span", "metric-label", lbl));
                it.appendChild(el("span", "metric-value", val));
                grid.appendChild(it);
            });
            card.appendChild(grid);
        }

        if (p.fotos.length) {
            const fotos = el("div", `pub-fotos n${p.fotos.length}`);
            p.fotos.forEach((src) => {
                const img = el("img");
                img.src = src; img.alt = "Foto de la publicación"; img.loading = "lazy";
                img.addEventListener("click", () => verFoto(src));
                fotos.appendChild(img);
            });
            card.appendChild(fotos);
        }

        if (p.pie_foto) card.appendChild(el("div", "pub-pie", p.pie_foto));

        const acciones = el("div", "pub-acciones");
        const izq = el("div", "izq");
        const btnLike = el("button", `pub-btn like${p.yo_di_like ? " activo" : ""}`);
        btnLike.type = "button"; btnLike.setAttribute("aria-label", "Me gusta");
        btnLike.innerHTML = ICONO_CORAZON;
        const btnComent = el("button", "pub-btn");
        btnComent.type = "button"; btnComent.setAttribute("aria-label", `Comentarios: ${p.comentarios}`);
        btnComent.innerHTML = ICONO_COMENT;
        const nComent = el("span", "", String(p.comentarios));
        btnComent.appendChild(nComent);
        izq.appendChild(btnLike); izq.appendChild(btnComent);
        const btnMas = el("button", "pub-btn");
        btnMas.type = "button"; btnMas.setAttribute("aria-label", "Más opciones");
        btnMas.innerHTML = ICONO_MAS;
        acciones.appendChild(izq); acciones.appendChild(btnMas);
        card.appendChild(acciones);

        const textoL = el("p", "pub-likes-texto", textoLikes(p));
        card.appendChild(textoL);

        // Me gusta: se pinta al instante y se confirma con el servidor
        btnLike.addEventListener("click", async () => {
            const antes = { yo: p.yo_di_like, n: p.likes };
            p.yo_di_like = !p.yo_di_like; p.likes += p.yo_di_like ? 1 : -1;
            btnLike.classList.toggle("activo", p.yo_di_like); textoL.textContent = textoLikes(p);
            try {
                const r = await apiFetch(`/publicaciones/${p.id}/like`, { method: "POST" });
                p.yo_di_like = r.yo_di_like; p.likes = r.likes;
            } catch (e) {
                p.yo_di_like = antes.yo; p.likes = antes.n;
                aviso(e.message);
            }
            btnLike.classList.toggle("activo", p.yo_di_like); textoL.textContent = textoLikes(p);
        });

        btnComent.addEventListener("click", () => abrirComentarios(p, (n) => { p.comentarios = n; nComent.textContent = String(n); btnComent.setAttribute("aria-label", `Comentarios: ${n}`); }));
        btnMas.addEventListener("click", () => abrirMenu(p, card));
        return card;
    }

    // ---------- comentarios ----------
    async function abrirComentarios(p, alCambiar) {
        const caja = el("div");
        caja.appendChild(el("h2", "", "Comentarios"));
        const lista = el("div", "lista");
        const form = el("form", "pub-form");
        const entrada = el("input"); entrada.type = "text"; entrada.maxLength = 300; entrada.placeholder = "Escribe un comentario…";
        const enviar = el("button", "", "Enviar"); enviar.type = "submit";
        form.appendChild(entrada); form.appendChild(enviar);
        caja.appendChild(lista); caja.appendChild(form);
        abrirHoja(caja);

        async function cargar() {
            try {
                const items = await apiFetch(`/publicaciones/${p.id}/comentarios`);
                lista.innerHTML = "";
                if (!items.length) lista.appendChild(el("p", "pub-vacio", "Aún no hay comentarios. ¡Escribe el primero!"));
                items.forEach((c) => {
                    const fila = el("div", "pub-coment");
                    fila.appendChild(enlacePerfil(c.autor, "enlace-perfil", avatar(c.autor, true), true));
                    const cuerpo = el("div", "cuerpo");
                    { const n = el("div", "nombre"); n.appendChild(enlacePerfil(c.autor, "enlace-perfil", document.createTextNode(c.autor.nombre))); cuerpo.appendChild(n); }
                    cuerpo.appendChild(el("div", "txt", c.texto));
                    if (c.puedo_borrar) {
                        const b = el("button", "borrar", "Eliminar"); b.type = "button";
                        b.addEventListener("click", async () => {
                            try { await apiFetch(`/publicaciones/${p.id}/comentarios/${c.id}`, { method: "DELETE" }); await cargar(); }
                            catch (e) { aviso(e.message); }
                        });
                        cuerpo.appendChild(b);
                    }
                    fila.appendChild(cuerpo);
                    lista.appendChild(fila);
                });
                alCambiar(items.length);
            } catch (e) {
                lista.innerHTML = ""; lista.appendChild(el("p", "pub-error", e.message));
            }
        }

        form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            const t = entrada.value.trim();
            if (!t) return;
            enviar.disabled = true;
            try {
                await apiFetch(`/publicaciones/${p.id}/comentarios`, { method: "POST", body: { texto: t } });
                entrada.value = "";
                await cargar();
                lista.scrollTop = lista.scrollHeight;
            } catch (e) { aviso(e.message); }
            enviar.disabled = false;
        });
        cargar();
    }

    // ---------- menú ⋮ ----------
    function abrirMenu(p, card) {
        const caja = el("div", "pub-menu");
        let fondo;
        const boton = (texto, clase, fn) => {
            const b = el("button", clase || "", texto); b.type = "button";
            b.addEventListener("click", fn);
            caja.appendChild(b);
        };
        if (p.es_mio) {
            boton("🗑️ Eliminar publicación", "peligro", async () => {
                if (!(await FMCAviso.confirmar("¿Eliminar esta publicación? No se puede deshacer.", { si: "Eliminar", no: "Cancelar", peligro: true }))) return;
                try {
                    await apiFetch(`/publicaciones/${p.id}`, { method: "DELETE" });
                    fondo.remove(); card.remove();
                    if (!cont.querySelector(".post-card")) mostrarVacio();
                    aviso("Publicación eliminada");
                } catch (e) { aviso(e.message); }
            });
        } else {
            boton("🚩 Reportar publicación", "peligro", () => {
                caja.innerHTML = "";
                caja.appendChild(el("h2", "", "¿Por qué la reportas?"));
                MOTIVOS.forEach(([clave, texto]) => boton(texto, "", async () => {
                    try {
                        await apiFetch(`/publicaciones/${p.id}/reportar`, { method: "POST", body: { motivo: clave } });
                        fondo.remove(); aviso("Gracias, revisaremos la publicación");
                    } catch (e) { aviso(e.message); }
                }));
                boton("Cancelar", "", () => fondo.remove());
            });
        }
        boton("Cancelar", "", () => fondo.remove());
        fondo = abrirHoja(caja);
    }

    // ---------- foto a pantalla completa ----------
    function verFoto(src) {
        const fondo = el("div", "pub-fondo");
        fondo.style.alignItems = "center";
        const img = el("img"); img.src = src; img.alt = "Foto";
        img.style.cssText = "max-width:96%;max-height:90vh;border-radius:10px;";
        fondo.appendChild(img);
        fondo.addEventListener("click", () => fondo.remove());
        document.body.appendChild(fondo);
    }

    // ---------- carga del feed ----------
    let ultimoId = null;
    let botonMas = null;

    function mostrarVacio() {
        cont.appendChild(el("p", "pub-vacio", "Aún no hay publicaciones. ¡Sé la primera persona en compartir tu recorrido por el campus!"));
    }

    async function cargar() {
        if (botonMas) { botonMas.remove(); botonMas = null; }
        try {
            const q = ultimoId ? `?antes=${ultimoId}` : "";
            const r = await apiFetch(`/publicaciones${q}`);
            r.publicaciones.forEach((p) => { cont.appendChild(crearTarjeta(p)); ultimoId = p.id; });
            if (!cont.querySelector(".post-card")) mostrarVacio();
            if (r.hay_mas) {
                botonMas = el("button", "pub-mas", "Ver más publicaciones");
                botonMas.type = "button";
                botonMas.addEventListener("click", cargar);
                cont.appendChild(botonMas);
            }
        } catch (e) {
            cont.appendChild(el("p", "pub-error", e.status === 403 ? "Tu cuenta no tiene acceso al feed." : e.message));
        }
    }

    cargar();
});