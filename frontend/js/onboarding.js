document.addEventListener('DOMContentLoaded', () => {
    if (!requerirSesion()) return;

    const track = document.getElementById('carousel-track');
    const pills = document.querySelectorAll('.indicator-pill');
    const btnNext = document.getElementById('btn-next');

    let currentIndex = 0;
    const totalSlides = pills.length;

    function updateCarousel(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        pills.forEach((pill, i) => {
            if (i === currentIndex) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        if (currentIndex === totalSlides - 1) {
            btnNext.textContent = 'Comenzar';
        } else {
            btnNext.textContent = 'Continuar';
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentIndex < totalSlides - 1) {
            updateCarousel(currentIndex + 1);
        } else {
            window.location.href = 'preferences.html';
        }
    });

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
        const threshold = 40;
        if (startX - endX > threshold && currentIndex < totalSlides - 1) {
            updateCarousel(currentIndex + 1);
        } else if (endX - startX > threshold && currentIndex > 0) {
            updateCarousel(currentIndex - 1);
        }
    }
});
