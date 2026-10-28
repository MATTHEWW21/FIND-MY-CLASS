// perfil.js - perfil de otra persona (perfil_usuario.html?id=N). Datos reales desde /api/amigos/perfil/:id
document.addEventListener("DOMContentLoaded", async () => {
    if (typeof requerirSesion === "function" && !requerirSesion()) return;
    const $ = (id) => document.getElementById(id);
    const rol = localStorage.getItem("userRole");
    if (rol !== "estudiante" && rol !== "colaborador") { window.location.href = "mapa.html"; return; }

    const id = Number(new URLSearchParams(location.search).get("id"));
    if (!Number.isInteger(id) || id <= 0) { window.location.replace("feed.html"); return; }

    const menuBtn = $("profile-menu-btn"), menu = $("profile-dropdown-menu"), btn = $("btn-add-friend");
    let persona = null;

    // Menu desplegable
    menuBtn.setAttribute("aria-haspopup", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    function cerrarMenu() { menu.classList.add("hidden"); menuBtn.setAttribute("aria-expanded", "false"); }
    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const abierto = menu.classList.toggle("hidden") === false;
        menuBtn.setAttribute("aria-expanded", String(abierto));
    });
    document.addEventListener("click", cerrarMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { cerrarMenu(); menuBtn.focus(); } });


    $("perfil-volver").addEventListener("click", () => { if (history.length > 1) history.back(); else location.href = "feed.html"; });

    const nombreDe = (p) => [p.nombre, p.apellido].filter(Boolean).join(" ");

    function pintarBoton() {
        const r = persona.relacion;
        const bloqueado = !!persona.bloqueado_por_mi;
        $("blocked-banner").classList.toggle("hidden", !bloqueado);
        btn.classList.toggle("hidden", bloqueado);
        btn.style.backgroundColor = "";
        const texto = { ninguna: "Agregar amigo", enviada: "Solicitud enviada", recibida: "Aceptar solicitud", amigo: "✓ Amigos" }[r];
        if (texto) btn.querySelector("span").textContent = texto;
        btn.disabled = r === "enviada" || r === "amigo";
        $("opt-quitar").classList.toggle("hidden", r !== "amigo" || bloqueado);
        $("opt-silenciar").classList.toggle("hidden", bloqueado);
        $("opt-silenciar").textContent = persona.silenciado ? "Dejar de silenciar" : "Silenciar";
        $("opt-bloquear").textContent = bloqueado ? "Desbloquear" : "Bloquear";
        $("opt-bloquear").classList.toggle("danger", !bloqueado);
    }

    function pintar(p) {
        persona = p;
        const nombre = nombreDe(p);
        document.title = "UAGPS - " + nombre;
        $("perfil-nombre").textContent = nombre;
        $("perfil-handle").textContent = nombre.toUpperCase().replace(/\s+/g, "_");
        $("perfil-rol").textContent = p.rol === "colaborador" ? "Colaborador UAG" : "Estudiante";
        $("stat-amigos").textContent = p.n_amigos;
        $("stat-pubs").textContent = p.n_publicaciones;
        const av = $("perfil-avatar");
        av.textContent = ((p.nombre || "?")[0] + ((p.apellido || "")[0] || "")).toUpperCase();
        av.setAttribute("aria-hidden", "true");
        pintarBoton();
    }

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
            if (persona.relacion === "ninguna") {
                const r = await apiFetch("/amigos/solicitar", { method: "POST", body: { usuario_id: persona.id } });
                FMCAviso.aviso(r.estado === "aceptada" ? "¡Ahora son amigos!" : "Solicitud enviada", "ok");
            } else if (persona.relacion === "recibida") {
                await apiFetch("/amigos/" + persona.amistad_id + "/aceptar", { method: "POST" });
                FMCAviso.aviso("¡Ahora son amigos!", "ok");
            }
            pintar(await apiFetch("/amigos/perfil/" + id));
        } catch (e) { FMCAviso.aviso(e.message, "error"); pintarBoton(); }
    });

    async function recargar() { pintar(await apiFetch("/amigos/perfil/" + id)); }

    $("opt-silenciar").addEventListener("click", async () => {
        try {
            if (persona.silenciado) {
                await apiFetch("/moderacion/silenciar/" + id, { method: "DELETE" });
                FMCAviso.aviso("Volverás a ver sus publicaciones", "ok");
            } else {
                await apiFetch("/moderacion/silenciar/" + id, { method: "POST" });
                FMCAviso.aviso("Ya no verás sus publicaciones. Siguen siendo amigos.", "ok");
            }
            await recargar();
        } catch (e) { FMCAviso.aviso(e.message, "error"); }
    });

    $("opt-bloquear").addEventListener("click", async () => {
        const nombre = nombreDe(persona);
        try {
            if (persona.bloqueado_por_mi) {
                await apiFetch("/moderacion/bloquear/" + id, { method: "DELETE" });
                FMCAviso.aviso("Desbloqueaste a " + nombre + ". Si quieren ser amigos otra vez, hay que volver a agregarse.", "ok");
            } else {
                const si = await FMCAviso.confirmar("¿Bloquear a " + nombre + "? No verán las publicaciones del otro, no podrán escribirse ni agregarse, y dejarán de ser amigos.", { si: "Bloquear", no: "Cancelar", peligro: true });
                if (!si) return;
                await apiFetch("/moderacion/bloquear/" + id, { method: "POST" });
                FMCAviso.aviso("Bloqueaste a " + nombre, "ok");
            }
            await recargar();
        } catch (e) { FMCAviso.aviso(e.message, "error"); }
    });

    // ---------- Reportar: hoja con motivo, comentario opcional y la opcion de bloquear tambien ----------
    const MOTIVOS = [
        ["acoso", "Acoso o conducta ofensiva"], ["spam", "Spam o publicidad"], ["suplantacion", "Se hace pasar por otra persona"],
        ["inapropiado", "Contenido inapropiado"], ["otro", "Otro motivo"],
    ];
    function elem(tag, clase, texto) { const e = document.createElement(tag); if (clase) e.className = clase; if (texto != null) e.textContent = texto; return e; }
    $("opt-reportar").addEventListener("click", () => {
        const fondo = elem("div", "pub-fondo");
        const hoja = elem("div", "pub-hoja rep-hoja");
        hoja.appendChild(elem("h2", "rep-titulo", "Reportar a " + nombreDe(persona)));
        hoja.appendChild(elem("p", "rep-ayuda", "Tu reporte es privado: la otra persona no sabrá quién lo hizo. Lo revisa el equipo de UAGPS."));
        const grupo = elem("fieldset", "rep-grupo");
        grupo.appendChild(elem("legend", "", "¿Qué pasó?"));
        MOTIVOS.forEach(([clave, texto], i) => {
            const l = elem("label", "rep-opcion");
            const r = document.createElement("input");
            r.type = "radio"; r.name = "motivo"; r.value = clave; if (i === 0) r.checked = true;
            l.append(r, document.createTextNode(" " + texto));
            grupo.appendChild(l);
        });
        hoja.appendChild(grupo);
        const lc = elem("label", "rep-etiqueta", "Cuéntanos más (opcional)"); lc.htmlFor = "rep-comentario";
        const ta = document.createElement("textarea"); ta.id = "rep-comentario"; ta.maxLength = 300; ta.rows = 3;
        hoja.append(lc, ta);
        const lb = elem("label", "rep-opcion rep-bloquear");
        const cb = document.createElement("input"); cb.type = "checkbox";
        cb.checked = !persona.bloqueado_por_mi; cb.disabled = !!persona.bloqueado_por_mi;
        lb.append(cb, document.createTextNode(persona.bloqueado_por_mi ? " Ya lo bloqueaste" : " También bloquear a esta persona"));
        hoja.appendChild(lb);
        const fila = elem("div", "rep-botones");
        const cancelar = elem("button", "rep-cancelar", "Cancelar"); cancelar.type = "button";
        const enviar = elem("button", "rep-enviar", "Enviar reporte"); enviar.type = "button";
        fila.append(cancelar, enviar);
        hoja.appendChild(fila);
        fondo.appendChild(hoja);
        const cerrar = () => fondo.remove();
        fondo.addEventListener("click", (e) => { if (e.target === fondo) cerrar(); });
        cancelar.addEventListener("click", cerrar);
        enviar.addEventListener("click", async () => {
            enviar.disabled = true;
            try {
                const motivo = grupo.querySelector("input:checked").value;
                await apiFetch("/moderacion/reportar/" + id, { method: "POST", body: { motivo, comentario: ta.value, bloquear: cb.checked && !cb.disabled } });
                cerrar();
                FMCAviso.aviso(cb.checked && !cb.disabled ? "Reporte enviado y persona bloqueada" : "Gracias, revisaremos tu reporte", "ok");
                await recargar();
            } catch (e) { enviar.disabled = false; FMCAviso.aviso(e.message, "error"); }
        });
        document.body.appendChild(fondo);
    });

    $("opt-quitar").addEventListener("click", async () => {
        if (!(await FMCAviso.confirmar("¿Quitar a " + nombreDe(persona) + " de tus amigos?", { si: "Quitar", no: "Cancelar", peligro: true }))) return;
        try {
            await apiFetch("/amigos/" + persona.amistad_id, { method: "DELETE" });
            pintar(await apiFetch("/amigos/perfil/" + id));
            FMCAviso.aviso("Ya no son amigos", "ok");
        } catch (e) { FMCAviso.aviso(e.message, "error"); }
    });

    try {
        const p = await apiFetch("/amigos/perfil/" + id);
        if (p.es_yo) { window.location.replace("mi_perfil.html"); return; }
        pintar(p);
    } catch (e) {
        $("perfil-nombre").textContent = "Perfil no disponible";
        FMCAviso.aviso(e.message, "error");
    }
});
