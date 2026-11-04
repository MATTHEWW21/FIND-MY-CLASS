function mostrarBienvenida() { document.documentElement.classList.remove('comprobando'); }

async function entrarSiHaySesion() {
    if (!localStorage.getItem('token')) { mostrarBienvenida(); return; }
    if (localStorage.getItem('userRole') === 'visitante') {
        limpiarSesion();
        mostrarBienvenida();
        return;
    }
    try {
        const data = await apiFetch('/auth/me');
        guardarSesion(localStorage.getItem('token'), data.usuario);
        window.location.replace(rutaInicio(data.usuario));
    } catch (err) {
        mostrarBienvenida();
    }
}
entrarSiHaySesion();

document.addEventListener('DOMContentLoaded', () => {
    const roleButtons = document.querySelectorAll('.role-btn');
    let enCurso = false;

    roleButtons.forEach(button => {
        button.addEventListener('click', async () => {
            if (enCurso) return;
            enCurso = true;

            roleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedRole = button.dataset.role;
            localStorage.setItem('selectedRole', selectedRole);

            if (selectedRole === 'visitante') {
                try {
                    const data = await apiFetch('/auth/invitado', { method: 'POST' });
                    guardarSesion(data.token, data.usuario);
                    localStorage.removeItem('visitaAsunto');
                    window.location.href = 'visitante-asunto.html';
                } catch (err) {
                    FMCAviso.aviso(err.message, 'error');
                    enCurso = false;
                }
                return;
            }

            window.location.href = 'register.html';
        });
    });
});