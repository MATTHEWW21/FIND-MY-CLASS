document.addEventListener('DOMContentLoaded', () => {
    // Solo los visitantes pasan por aquí
    if (!requerirSesion()) return;
    if (localStorage.getItem('userRole') !== 'visitante') {
        window.location.href = rutaHome();
        return;
    }

    const botones = document.querySelectorAll('.role-btn');
    const btnContinuar = document.getElementById('btn-continuar');
    let asunto = null;

    botones.forEach((b) => {
        b.addEventListener('click', () => {
            botones.forEach((x) => x.classList.remove('active'));
            b.classList.add('active');
            asunto = b.dataset.asunto;
        });
    });

    btnContinuar.addEventListener('click', () => {
        if (!asunto) {
            alert('Selecciona el asunto de tu visita.');
            return;
        }
        // El mapa usa este valor para mostrar solo los lugares de ese asunto
        localStorage.setItem('visitaAsunto', asunto);
        window.location.href = 'preferences.html';
    });
});
