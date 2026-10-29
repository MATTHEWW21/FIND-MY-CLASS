// Sesion recordada (como Instagram o WhatsApp): si ya inició sesión, se salta la bienvenida.
// Quita la pantalla de "Cargando" y deja ver la bienvenida normal (elegir perfil)
function mostrarBienvenida() { document.documentElement.classList.remove('comprobando'); }

async function entrarSiHaySesion() {
    if (!localStorage.getItem('token')) { mostrarBienvenida(); return; }
    if (localStorage.getItem('userRole') === 'visitante') {
        // El visitante no tiene cuenta: cada visita empieza eligiendo su asunto
        limpiarSesion();
        mostrarBienvenida();
        return;
    }
    try {
        const data = await apiFetch('/auth/me');
        guardarSesion(localStorage.getItem('token'), data.usuario);
        window.location.replace(rutaInicio(data.usuario));
    } catch (err) {
        // Sin red o error del servidor: se muestra la bienvenida normal (si el token expiró, apiFetch ya lo limpió)
        mostrarBienvenida();
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
                    FMCAviso.aviso(err.message, 'error');
                    enCurso = false;
                }
                return;
            }

            // Estudiante y colaborador pasan directo a la pantalla de cuenta
            window.location.href = 'register.html';
        });
    });
});