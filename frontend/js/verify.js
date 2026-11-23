document.addEventListener('DOMContentLoaded', () => {
    const correo = localStorage.getItem('pendingEmail');

    if (!correo) {
        FMCAviso.alerta('No hay un registro pendiente de verificar. Inicia sesión o regístrate.', 'error').then(() => { window.location.href = 'index.html'; });
        return;
    }

    const formVerify = document.getElementById('form-verify');
    const inputCode = document.getElementById('verify-code');
    const btnResend = document.getElementById('btn-resend');
    const estadoResend = document.getElementById('resend-estado');
    const cajaCodigo = document.getElementById('codigo-dev');
    const valorCodigo = document.getElementById('codigo-dev-valor');
    const ESPERA = 60;
    let temporizador = null;

    function mostrarCodigo(codigo) {
        if (!codigo || !cajaCodigo) return;
        localStorage.setItem('codigoDev', codigo);
        valorCodigo.textContent = codigo;
        cajaCodigo.hidden = false;
        inputCode.value = codigo;
    }

    function esperarReenvio(segundos) {
        if (!btnResend) return;
        clearInterval(temporizador);
        let restante = segundos;
        btnResend.disabled = true;
        btnResend.textContent = `Reenviar código (${restante} s)`;
        temporizador = setInterval(() => {
            restante -= 1;
            if (restante <= 0) {
                clearInterval(temporizador);
                btnResend.disabled = false;
                btnResend.textContent = 'Reenviar código';
                return;
            }
            btnResend.textContent = `Reenviar código (${restante} s)`;
        }, 1000);
    }

    const guardado = localStorage.getItem('codigoDev');
    if (guardado) {
        mostrarCodigo(guardado);
        esperarReenvio(ESPERA);
    }

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
            localStorage.removeItem('codigoDev');
            await FMCAviso.alerta('¡Verificación exitosa! Ahora inicia sesión.', 'ok');
            window.location.href = 'login.html';
        } catch (err) {
            FMCAviso.aviso(err.message, 'error');
            submitBtn.disabled = false;
        }
    });

    if (btnResend) {
        btnResend.addEventListener('click', async () => {
            btnResend.disabled = true;
            estadoResend.textContent = '';
            try {
                const data = await apiFetch('/auth/reenviar-codigo', {
                    method: 'POST',
                    body: { correo },
                });
                if (data.codigo_dev) {
                    mostrarCodigo(data.codigo_dev);
                    estadoResend.textContent = 'Listo, este es tu nuevo código.';
                } else {
                    estadoResend.textContent = 'Si no te llega en un minuto, revisa tu correo no deseado o vuelve a pedirlo.';
                }
                esperarReenvio(ESPERA);
            } catch (err) {
                estadoResend.textContent = err.message;
                btnResend.disabled = false;
            }
        });
    }
});
