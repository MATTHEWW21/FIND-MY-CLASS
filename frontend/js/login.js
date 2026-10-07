document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            if (email && password) {
                // Guardar estado de sesión (simulado)
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', email);

                // Redirigir al onboarding de propósitos antes del mapa
                window.location.href = 'onboarding.html';
            } else {
                alert('Por favor, ingresa tu correo y contraseña.');
            }
        });
    }
});