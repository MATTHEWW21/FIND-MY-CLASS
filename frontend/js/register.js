document.addEventListener('DOMContentLoaded', () => {
    const rol = localStorage.getItem('selectedRole');

    // Si no eligió rol (o es visitante) no debe estar aquí
    if (rol !== 'estudiante' && rol !== 'colaborador') {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('form-register');
    const btnSubmit = document.getElementById('btn-submit');
    const passMain = document.getElementById('pass-main');
    const passConfirm = document.getElementById('pass-confirm');

    const rules = {
        min:   { el: document.getElementById('rule-min'),   test: (v) => v.length >= 8 },
        upper: { el: document.getElementById('rule-upper'), test: (v) => /[A-Z]/.test(v) },
        num:   { el: document.getElementById('rule-num'),   test: (v) => /[0-9]/.test(v) },
        spec:  { el: document.getElementById('rule-spec'),  test: (v) => /[^A-Za-z0-9]/.test(v) },
    };

    // Validación en vivo mientras escribe
    passMain.addEventListener('input', () => {
        Object.values(rules).forEach(({ el, test }) => {
            const ok = test(passMain.value);
            el.classList.toggle('rule-valid', ok);
            el.classList.toggle('rule-invalid', !ok);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const todasOk = Object.values(rules).every(({ test }) => test(passMain.value));
        if (!todasOk) {
            FMCAviso.aviso('La contraseña debe cumplir con todas las reglas de seguridad.', 'error');
            return;
        }
        if (passMain.value !== passConfirm.value) {
            FMCAviso.aviso('Las contraseñas no coinciden. Por favor verifica.', 'error');
            return;
        }

        const correo = document.getElementById('reg-correo').value.trim();

        btnSubmit.disabled = true;
        try {
            const data = await apiFetch('/auth/registro', {
                method: 'POST',
                body: {
                    nombre: document.getElementById('reg-nombre').value.trim(),
                    apellido: document.getElementById('reg-apellido').value.trim(),
                    numero_registro: document.getElementById('reg-registro').value.trim(),
                    correo,
                    password: passMain.value,
                    rol,
                },
            });

            localStorage.setItem('pendingEmail', correo);
            // Solo aparece si el backend tiene DEV_MOSTRAR_CODIGO=true (pruebas)
            if (data.codigo_dev) {
                await FMCAviso.alerta(`[Modo desarrollo]\nTu código de verificación es: ${data.codigo_dev}`, 'info');
            }
            window.location.href = 'verify.html';
        } catch (err) {
            FMCAviso.aviso(err.message, 'error');
            btnSubmit.disabled = false;
        }
    });
});
