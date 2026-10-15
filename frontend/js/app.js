document.addEventListener('DOMContentLoaded', () => {
    const roleButtons = document.querySelectorAll('.role-btn');
    const btnContinuar = document.getElementById('btn-continuar');
    let selectedRole = null; // Inicia sin ninguna selección

    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remueve el estilo activo de todos los botones
            roleButtons.forEach(btn => btn.classList.remove('active'));

            // Le agrega el estilo activo únicamente al botón presionado
            button.classList.add('active');
            selectedRole = button.dataset.role;
        });
    });

    if (btnContinuar) {
        btnContinuar.addEventListener('click', async () => {
            if (!selectedRole) {
                alert('Por favor selecciona una opción antes de continuar.');
                return;
            }

            localStorage.setItem('selectedRole', selectedRole);

            // El visitante no se registra: entra como invitado directo al mapa
            if (selectedRole === 'visitante') {
                btnContinuar.disabled = true;
                try {
                    const data = await apiFetch('/auth/invitado', { method: 'POST' });
                    guardarSesion(data.token, data.usuario);
                    window.location.href = rutaInicio(data.usuario);
                } catch (err) {
                    alert(err.message);
                    btnContinuar.disabled = false;
                }
                return;
            }

            window.location.href = 'register.html';
        });
    }
});
