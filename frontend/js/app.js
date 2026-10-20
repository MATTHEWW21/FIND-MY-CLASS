// Sesion recordada (como Instagram o WhatsApp): si ya inició sesión, se salta la bienvenida.
async function entrarSiHaySesion() {
    if (!localStorage.getItem('token')) return;
    if (localStorage.getItem('userRole') === 'visitante') {
        // El visitante no tiene cuenta: cada visita empieza eligiendo su asunto
        limpiarSesion();
        return;
    }
    try {
        const data = await apiFetch('/auth/me');
        guardarSesion(localStorage.getItem('token'), data.usuario);
        window.location.href = rutaInicio(data.usuario);
    } catch (err) {
        // Sin red o error del servidor: se muestra la bienvenida normal (si el token expiró, apiFetch ya lo limpió)
    }
}
entrarSiHaySesion();

document.addEventListener('DOMContentLoaded', () => {
    const roleButtons = document.querySelectorAll('.role-btn');
    let enCurso = false; // evita doble toque mientras se entra como invitado

    roleButtons.forEach(button => {
        button.addEventListener('click', async () => {
            if (enCurso) return;
            enCurso = true;

            // Resalta la opcion elegida un instante antes de cambiar de pantalla
            roleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedRole = button.dataset.role;
            localStorage.setItem('selectedRole', selectedRole);

            // El visitante no se registra: entra como invitado y primero dice que asunto tiene
            if (selectedRole === 'visitante') {
                try {
                    const data = await apiFetch('/auth/invitado', { method: 'POST' });
                    guardarSesion(data.token, data.usuario);
                    localStorage.removeItem('visitaAsunto');
                    window.location.href = 'visitante-asunto.html';
                } catch (err) {
                    alert(err.message);
                    enCurso = false;
                }
                return;
            }

            // Estudiante y colaborador pasan directo a la pantalla de cuenta
            window.location.href = 'register.html';
        });
    });
});