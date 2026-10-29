document.addEventListener('DOMContentLoaded', () => {
    const correo = localStorage.getItem('pendingEmail');

    // Sin correo pendiente no hay nada que verificar
    if (!correo) {
        FMCAviso.alerta('No hay un registro pendiente de verificar. Inicia sesión o regístrate.', 'error').then(() => { window.location.href = 'index.html'; });
        return;
    }

    const formVerify = document.getElementById('form-verify');
    const inputCode = document.getElementById('verify-code');
    const btnResend = document.getElementById('btn-resend');

    formVerify.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = formVerify.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            await apiFetch('/auth/verificar', {
                method: 'POST',
                body: { correo, codigo: inputCode.value.trim(), password: document.getElementById('verify-password').value },
            });
            localStorage.removeItem('pendingEmail');
            await FMCAviso.alerta('¡Verificación exitosa! Ahora inicia sesión.', 'ok');
            window.location.href = 'login.html';
        } catch (err) {
            FMCAviso.aviso(err.message, 'error');
            submitBtn.disabled = false;
        }
    });

    if (btnResend) {
        btnResend.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const data = await apiFetch('/auth/reenviar-codigo', {
                    method: 'POST',
                    body: { correo },
                });
                if (data.codigo_dev) {
                    await FMCAviso.alerta(`[Modo desarrollo]\nTu nuevo código es: ${data.codigo_dev}`, 'info');
                } else {
                    FMCAviso.aviso('Te enviamos un nuevo código a tu correo institucional.', 'ok');
                }
            } catch (err) {
                FMCAviso.aviso(err.message, 'error');
            }
        });
    }
});
