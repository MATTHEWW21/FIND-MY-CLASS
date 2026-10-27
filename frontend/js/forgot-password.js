document.addEventListener('DOMContentLoaded', () => {
    const stepEmail = document.getElementById('step-email');
    const stepReset = document.getElementById('step-reset');
    const subtitle = document.getElementById('form-subtitle');

    const formEmail = document.getElementById('form-forgot-email');
    const formReset = document.getElementById('form-forgot-reset');

    const inputEmail = document.getElementById('forgot-email');
    const inputCode = document.getElementById('forgot-code');
    const passMain = document.getElementById('pass-main');
    const passConfirm = document.getElementById('pass-confirm');

    const btnResend = document.getElementById('btn-resend');
    const btnChangeEmail = document.getElementById('btn-change-email');

    let correo = '';

    const rules = {
        min:   { el: document.getElementById('rule-min'),   test: (v) => v.length >= 8 },
        upper: { el: document.getElementById('rule-upper'), test: (v) => /[A-Z]/.test(v) },
        num:   { el: document.getElementById('rule-num'),   test: (v) => /[0-9]/.test(v) },
        spec:  { el: document.getElementById('rule-spec'),  test: (v) => /[^A-Za-z0-9]/.test(v) },
    };

    passMain.addEventListener('input', () => {
        Object.values(rules).forEach(({ el, test }) => {
            const ok = test(passMain.value);
            el.classList.toggle('rule-valid', ok);
            el.classList.toggle('rule-invalid', !ok);
        });
    });

    function mostrarPaso(paso) {
        const enReset = paso === 'reset';
        stepEmail.style.display = enReset ? 'none' : '';
        stepReset.style.display = enReset ? '' : 'none';
        subtitle.textContent = enReset
            ? 'Ingresa el código que enviamos a tu correo y elige tu nueva contraseña.'
            : 'Ingresa tu correo institucional y te enviaremos un código para redefinir tu clave de acceso.';
    }

    // Pide el código al backend. Devuelve true si la petición se hizo.
    async function pedirCodigo() {
        const data = await apiFetch('/auth/olvide-password', {
            method: 'POST',
            body: { correo },
        });
        if (data.codigo_dev) {
            await FMCAviso.alerta(`[Modo desarrollo]\nTu código de recuperación es: ${data.codigo_dev}`, 'info');
        } else {
            FMCAviso.aviso('Si el correo está registrado, te enviamos un código.', 'ok');
        }
    }

    // Paso 1: correo -> se envía el código
    formEmail.addEventListener('submit', async (e) => {
        e.preventDefault();
        correo = inputEmail.value.trim();
        const btn = formEmail.querySelector('button[type="submit"]');
        btn.disabled = true;
        try {
            await pedirCodigo();
            mostrarPaso('reset');
        } catch (err) {
            FMCAviso.aviso(err.message, 'error');
        } finally {
            btn.disabled = false;
        }
    });

    // Paso 2: código + nueva contraseña
    formReset.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!Object.values(rules).every(({ test }) => test(passMain.value))) {
            FMCAviso.aviso('La nueva contraseña debe cumplir con todas las reglas de seguridad.', 'error');
            return;
        }
        if (passMain.value !== passConfirm.value) {
            FMCAviso.aviso('Las contraseñas no coinciden. Por favor verifica.', 'error');
            return;
        }

        const btn = formReset.querySelector('button[type="submit"]');
        btn.disabled = true;
        try {
            await apiFetch('/auth/restablecer-password', {
                method: 'POST',
                body: { correo, codigo: inputCode.value.trim(), password: passMain.value },
            });
            await FMCAviso.alerta('¡Tu contraseña ha sido actualizada con éxito!', 'ok');
            window.location.href = 'login.html';
        } catch (err) {
            FMCAviso.aviso(err.message, 'error');
            btn.disabled = false;
        }
    });

    btnResend.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await pedirCodigo();
        } catch (err) {
            FMCAviso.aviso(err.message, 'error');
        }
    });

    btnChangeEmail.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPaso('email');
    });
});
