document.addEventListener("DOMContentLoaded", () => {
    let timerInterval = null;
    let secondsElapsed = 0;
    let isRunning = false;

    const timerDisplay = document.getElementById("timer");
    const btnComenzar = document.getElementById("btn-comenzar");
    const selectedText = document.getElementById("selected-activity-text");
    const btnSos = document.getElementById("btn-sos");
    const selectorBtns = document.querySelectorAll(".selector-btn");
    const mainIconContainer = document.getElementById("activity-main-icon");

    // Mapeo de SVG para el ícono principal superior
    const iconsSVG = {
        caminata: `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="5" r="2.5"/><path d="m9 20 3-6 3 6"/><path d="m6 9 6 1 6-1"/><path d="M12 10v4"/>
            </svg>`,
        carrera: `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="15" cy="4" r="2"/><path d="M7 21l3-4 2 1 3 4"/><path d="M11 13l-2-2 3-3 4 2 3-2"/><path d="M14 8l-2 5"/>
            </svg>`,
        bicicleta: `
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h2l1.5 4.5"/><path d="M12 17.5V14l-3-4 4-3.5 3 3"/>
            </svg>`
    };

    function formatTime(totalSeconds) {
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    // Cronómetro
    btnComenzar.addEventListener("click", () => {
        if (!isRunning) {
            isRunning = true;
            btnComenzar.querySelector(".start-title").textContent = "PAUSAR";
            btnComenzar.style.backgroundColor = "#cc6324";

            timerInterval = setInterval(() => {
                secondsElapsed++;
                timerDisplay.textContent = formatTime(secondsElapsed);
                document.getElementById("distancia").textContent = (secondsElapsed * 0.0014).toFixed(2);
                document.getElementById("calorias").textContent = Math.floor(secondsElapsed * 0.08);
            }, 1000);
        } else {
            isRunning = false;
            clearInterval(timerInterval);
            btnComenzar.querySelector(".start-title").textContent = "REANUDAR";
            btnComenzar.style.backgroundColor = "#121212";
        }
    });

    // Cambiar modo e ícono superior dinámicamente
    selectorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectorBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const mode = btn.getAttribute("data-mode");
            selectedText.textContent = mode.toUpperCase();

            // Reemplazar el ícono principal arriba
            if (iconsSVG[mode]) {
                mainIconContainer.innerHTML = iconsSVG[mode];
            }
        });
    });

    // Botón SOS
    btnSos.addEventListener("click", () => {
        if (confirm("🚨 ¿Deseas enviar una alerta de emergencia SOS a seguridad del campus?")) {
            alert("✅ Alerta SOS enviada con éxito.");
        }
    });
});