document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const correo = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!correo || !password) {
            alert('Por favor, ingresa tu correo y contraseña.');
            return;
        }

        const submitBtn = formLogin.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: { correo, password },
            });
            guardarSesion(data.token, data.usuario);
            window.location.href = rutaInicio(data.usuario);
        } catch (err) {
            // Cuenta creada pero sin verificar: mandarlo a verificar
            if (err.data && err.data.requiereVerificacion) {
                localStorage.setItem('pendingEmail', correo);
                alert('Tu cuenta aún no está verificada. Ingresa el código que te enviamos.');
                window.location.href = 'verify.html';
                return;
            }
            alert(err.message);
            submitBtn.disabled = false;
        }
    });
});
