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

                // Redirigir a la vista principal / mapa
                window.location.href = 'index.html'; // O la pantalla principal de la app
            } else {
                alert('Por favor, ingresa tu correo y contraseña.');
            }
        });
    }
});