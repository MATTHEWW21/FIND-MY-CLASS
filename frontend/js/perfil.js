document.addEventListener("DOMContentLoaded", () => {
    const profileMenuBtn = document.getElementById("profile-menu-btn");
    const profileDropdown = document.getElementById("profile-dropdown-menu");
    const btnAddFriend = document.getElementById("btn-add-friend");
    const blockedBanner = document.getElementById("blocked-banner");

    // Opciones del menú
    const optSilenciar = document.getElementById("opt-silenciar");
    const optReportar = document.getElementById("opt-reportar");
    const optDenunciar = document.getElementById("opt-denunciar");
    const optBloquear = document.getElementById("opt-bloquear");

    let isBlocked = false;
    let isMuted = false;

    // Abrir / Cerrar Menú Desplegable
    if (profileMenuBtn && profileDropdown) {
        profileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("hidden");
        });

        // Cerrar menú si da clic fuera
        document.addEventListener("click", () => {
            if (!profileDropdown.classList.contains("hidden")) {
                profileDropdown.classList.add("hidden");
            }
        });
    }

    // Acción: Silenciar
    if (optSilenciar) {
        optSilenciar.addEventListener("click", () => {
            isMuted = !isMuted;
            optSilenciar.textContent = isMuted ? "Desactivar silencio" : "Silenciar";
            alert(isMuted ? "🔕 Usuario silenciado. No verás sus publicaciones en el feed." : "🔔 Se ha quitado el silencio al usuario.");
        });
    }

    // Acción: Reportar
    if (optReportar) {
        optReportar.addEventListener("click", () => {
            alert("⚠️ Reporte enviado a los administradores de Find My Class UAG.");
        });
    }

    // Acción: Denunciar
    if (optDenunciar) {
        optDenunciar.addEventListener("click", () => {
            alert("📢 Denuncia registrada. Nuestro equipo de soporte revisará el perfil.");
        });
    }

    // Acción: Bloquear / Desbloquear
    if (optBloquear) {
        optBloquear.addEventListener("click", () => {
            isBlocked = !isBlocked;

            if (isBlocked) {
                optBloquear.textContent = "Desbloquear";
                if (blockedBanner) blockedBanner.classList.remove("hidden");

                if (btnAddFriend) {
                    btnAddFriend.classList.add("blocked-btn");
                    btnAddFriend.disabled = true;
                    btnAddFriend.innerHTML = `<span>Usuario Bloqueado</span>`;
                }

                alert("🚫 Has bloqueado a Ángel Orozco.");
            } else {
                optBloquear.textContent = "Bloquear";
                if (blockedBanner) blockedBanner.classList.add("hidden");

                if (btnAddFriend) {
                    btnAddFriend.classList.remove("blocked-btn");
                    btnAddFriend.disabled = false;
                    btnAddFriend.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        <span>Agrega amigos</span>
                    `;
                }

                alert("✅ Has desbloqueado a Ángel Orozco.");
            }
        });
    }

    // Lógica del botón de agregar amigos
    if (btnAddFriend) {
        btnAddFriend.addEventListener("click", () => {
            if (!isBlocked) {
                btnAddFriend.style.backgroundColor = "#5c8a5c";
                btnAddFriend.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>¡Amigos agregados!</span>
                `;
            }
        });
    }
});