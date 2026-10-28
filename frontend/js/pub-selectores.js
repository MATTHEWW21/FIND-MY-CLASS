// pub-selectores.js - hojas para elegir amigos a etiquetar y la privacidad de una publicación.
// Las usan nueva-publicacion.html (al publicar) y feed.html (al editar). Requiere api.js.
// Cada función devuelve una promesa: el valor elegido, o null si la persona cerró la hoja sin confirmar.
(function () {
    const MAX_ETIQUETAS = 10;
    const PRIVACIDADES = [
        { clave: "todos", icono: "🌎", titulo: "Todos", ayuda: "Cualquiera en UAGPS puede verla" },
        { clave: "amigos", icono: "👥", titulo: "Solo amigos", ayuda: "Solo tus amigos pueden verla" },
        { clave: "solo_yo", icono: "🔒", titulo: "Solo yo", ayuda: "Nadie más la ve" },
    ];

    const el = (tag, clase, texto) => {
        const n = document.createElement(tag);
        if (clase) n.className = clase;
        if (texto !== undefined) n.textContent = texto;
        return n;
    };

    // Abre una hoja inferior; resolver(valor) la cierra. Tocar fuera o Escape = null.
    function hoja(contenido, resolver) {
        const fondo = el("div", "pub-fondo");
        const h = el("div", "pub-hoja");
        h.appendChild(contenido);
        fondo.appendChild(h);
        let cerrada = false;
        const cerrar = (v) => { if (cerrada) return; cerrada = true; fondo.remove(); resolver(v); };
        fondo.addEventListener("click", (e) => { if (e.target === fondo) cerrar(null); });
        document.body.appendChild(fondo);
        return cerrar;
    }

    function privacidad(actual) {
        return new Promise((resolver) => {
            const caja = el("div", "pub-menu");
            caja.appendChild(el("h2", "", "¿Quién puede verla?"));
            let cerrar;
            PRIVACIDADES.forEach((o) => {
                const b = el("button", "priv-opcion" + (o.clave === actual ? " elegida" : ""));
                b.type = "button";
                b.setAttribute("aria-pressed", String(o.clave === actual));
                b.appendChild(el("span", "priv-titulo", `${o.icono} ${o.titulo}`));
                b.appendChild(el("small", "priv-ayuda", o.ayuda));
                b.addEventListener("click", () => cerrar(o.clave));
                caja.appendChild(b);
            });
            const c = el("button", "", "Cancelar"); c.type = "button";
            c.addEventListener("click", () => cerrar(null));
            caja.appendChild(c);
            cerrar = hoja(caja, resolver);
        });
    }

    // actuales: [{id, nombre}] -> resuelve con la lista nueva [{id, nombre}]
    function etiquetas(actuales) {
        return new Promise((resolver) => {
            const caja = el("div");
            caja.appendChild(el("h2", "", "Etiquetar personas"));
            caja.appendChild(el("p", "et-ayuda", "Solo tus amigos. Les llegará un aviso."));
            const buscador = el("div", "pub-form");
            const entrada = el("input"); entrada.type = "text"; entrada.placeholder = "Busca a un amigo…";
            entrada.setAttribute("aria-label", "Buscar entre tus amigos");
            buscador.appendChild(entrada);
            const lista = el("div", "lista et-lista");
            const listo = el("button", "et-listo"); listo.type = "button";
            caja.append(buscador, lista, listo);
            const cerrar = hoja(caja, resolver);

            const sel = new Map((actuales || []).map((x) => [x.id, x]));
            let amigos = null;
            const vacio = (t) => lista.appendChild(el("p", "pub-vacio", t));
            function pintar() {
                lista.innerHTML = "";
                listo.textContent = sel.size ? `Listo (${sel.size})` : "Listo";
                if (!amigos) { vacio("Cargando amigos…"); return; }
                const q = entrada.value.trim().toLowerCase();
                const visibles = amigos.filter((a) => !q || `${a.nombre} ${a.apellido || ""}`.toLowerCase().includes(q));
                visibles.forEach((a) => {
                    const l = el("label", "et-opcion");
                    const c = el("input"); c.type = "checkbox"; c.checked = sel.has(a.id);
                    c.disabled = !c.checked && sel.size >= MAX_ETIQUETAS;
                    c.addEventListener("change", () => {
                        if (c.checked) sel.set(a.id, { id: a.id, nombre: a.nombre }); else sel.delete(a.id);
                        pintar();
                    });
                    l.append(c, document.createTextNode(" " + [a.nombre, a.apellido].filter(Boolean).join(" ")));
                    lista.appendChild(l);
                });
                if (!visibles.length) vacio(amigos.length ? "No encontramos a ese amigo." : "Todavía no tienes amigos para etiquetar.");
                if (sel.size >= MAX_ETIQUETAS) vacio(`Máximo ${MAX_ETIQUETAS} personas.`);
            }
            entrada.addEventListener("input", pintar);
            listo.addEventListener("click", () => cerrar(Array.from(sel.values())));
            pintar();
            apiFetch("/amigos").then((r) => { amigos = r.amigos; })
                .catch((e) => { amigos = []; aviso(e.message); })
                .then(pintar);
        });
    }

    window.PubSel = { privacidad, etiquetas, PRIVACIDADES, MAX_ETIQUETAS };
})();
