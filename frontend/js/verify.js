document.addEventListener('DOMContentLoaded', () => {
    // Generar un código simulado de 6 dígitos
    let generatedCode = localStorage.getItem('simulatedCode');

    if (!generatedCode) {
        generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('simulatedCode', generatedCode);
    }

    // Mostrar el código en una alerta simulando la llegada del correo
    setTimeout(() => {
        alert(`[Simulación Correo UAG]\nTu código de verificación es: ${generatedCode}`);
    }, 500);

    const formVerify = document.getElementById('form-verify');
    const inputCode = document.getElementById('verify-code');

    if (formVerify) {
        formVerify.addEventListener('submit', (e) => {
            e.preventDefault();

            if (inputCode.value.trim() === generatedCode) {
                alert('¡Verificación exitosa!');
                localStorage.removeItem('simulatedCode');
                window.location.href = 'login.html';
            } else {
                alert('El código ingresado es incorrecto. Por favor intenta de nuevo.');
            }
        });
    }
});