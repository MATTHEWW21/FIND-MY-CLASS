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
        btnContinuar.addEventListener('click', () => {
            // Validación opcional: verificar que haya seleccionado un rol antes de avanzar
            if (!selectedRole) {
                alert('Por favor selecciona una opción antes de continuar.');
                return;
            }

            localStorage.setItem('selectedRole', selectedRole);
            window.location.href = 'register.html';
        });
    }
});