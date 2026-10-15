document.addEventListener('DOMContentLoaded', () => {
    const correo = localStorage.getItem('pendingEmail');

    // Sin correo pendiente no hay nada que verificar
    if (!correo) {
        alert('No hay un registro pendiente de verificar. Inicia sesión o regístrate.');
        window.location.href = 'index.html';
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
                body: { correo, codigo: inputCode.value.trim() },
            });
            localStorage.removeItem('pendingEmail');
            alert('¡Verificación exitosa! Ahora inicia sesión.');
            window.location.href = 'login.html';
        } catch (err) {
            alert(err.message);
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
                    alert(`[Modo desarrollo]\nTu nuevo código es: ${data.codigo_dev}`);
                } else {
                    alert('Te enviamos un nuevo código a tu correo institucional.');
                }
            } catch (err) {
                alert(err.message);
            }
        });
    }
});
