document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    const pills = document.querySelectorAll('.indicator-pill');
    const btnNext = document.getElementById('btn-next');

    let currentIndex = 0;
    const totalSlides = pills.length;

    // Actualizar vista según el índice actual
    function updateCarousel(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Actualizar estados del indicador
        pills.forEach((pill, i) => {
            if (i === currentIndex) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        // Cambiar texto en la última tarjeta si se desea
        if (currentIndex === totalSlides - 1) {
            btnNext.textContent = 'Comenzar';
        } else {
            btnNext.textContent = 'Continuar';
        }
    }

    // Evento del botón Continuar
    btnNext.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            updateCarousel(currentIndex + 1);
        } else {
            // Fin del onboarding -> ir al mapa/home
            window.location.href = 'preferences.html';
        }
    });

    // Soporte para gestos táctiles (Swipe)
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const threshold = 40; // Sensibilidad del deslizado
        if (startX - endX > threshold && currentIndex < totalSlides - 1) {
            // Swipe a la izquierda -> Siguiente
            updateCarousel(currentIndex + 1);
        } else if (endX - startX > threshold && currentIndex > 0) {
            // Swipe a la derecha -> Anterior
            updateCarousel(currentIndex - 1);
        }
    }
});