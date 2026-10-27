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

    const proximamente = () => FMCAviso.aviso("Esta opción estará disponible próximamente.", "info");
    $("opt-reportar").addEventListener("click", proximamente);
    $("opt-bloquear").addEventListener("click", proximamente);

    $("perfil-volver").addEventListener("click", () => { if (history.length > 1) history.back(); else location.href = "feed.html"; });

    const nombreDe = (p) => [p.nombre, p.apellido].filter(Boolean).join(" ");

    function pintarBoton() {
        const r = persona.relacion;
        btn.classList.remove("hidden");
        btn.style.backgroundColor = "";
        btn.disabled = false;
        const texto = { ninguna: "Agregar amigo", enviada: "Solicitud enviada", recibida: "Aceptar solicitud", amigo: "✓ Amigos" }[r];
        btn.querySelector("span").textContent = texto;
        btn.disabled = r === "enviada" || r === "amigo";
        $("opt-quitar").classList.toggle("hidden", r !== "amigo");
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
