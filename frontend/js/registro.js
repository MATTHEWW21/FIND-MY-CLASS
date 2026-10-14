document.addEventListener("DOMContentLoaded", () => {
    // Variables Cronómetro Principal
    let timerInterval = null;
    let secondsElapsed = 0;
    let isRunning = false;

    const timerDisplay = document.getElementById("timer");
    const btnComenzar = document.getElementById("btn-comenzar");
    const selectedText = document.getElementById("selected-activity-text");
    const btnSos = document.getElementById("btn-sos");
    const selectorBtns = document.querySelectorAll(".selector-btn");
    const mainIconContainer = document.getElementById("activity-main-icon");

    // SVGs Actividad
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

    // Botón Comenzar / Pausar
    if (btnComenzar) {
        btnComenzar.addEventListener("click", () => {
            if (!isRunning) {
                isRunning = true;
                const startTitle = btnComenzar.querySelector(".start-title");
                if (startTitle) startTitle.textContent = "PAUSAR";
                btnComenzar.style.backgroundColor = "#cc6324";

                timerInterval = setInterval(() => {
                    secondsElapsed++;
                    if (timerDisplay) timerDisplay.textContent = formatTime(secondsElapsed);

                    const distElem = document.getElementById("distancia");
                    const calElem = document.getElementById("calorias");

                    if (distElem) distElem.textContent = (secondsElapsed * 0.0014).toFixed(2);
                    if (calElem) calElem.textContent = Math.floor(secondsElapsed * 0.08);
                }, 1000);
            } else {
                isRunning = false;
                clearInterval(timerInterval);
                const startTitle = btnComenzar.querySelector(".start-title");
                if (startTitle) startTitle.textContent = "REANUDAR";
                btnComenzar.style.backgroundColor = "#1a1a1a";
            }
        });
    }

    // Selector de Modo
    selectorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            selectorBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const mode = btn.getAttribute("data-mode");
            if (selectedText) selectedText.textContent = mode.toUpperCase();

            if (iconsSVG[mode] && mainIconContainer) {
                mainIconContainer.innerHTML = iconsSVG[mode];
            }
        });
    });

    // ==========================================
    // LÓGICA DEL PANEL SOS Y ASISTENCIA MÉDICA
    // ==========================================
    const sosOverlay = document.getElementById("sos-overlay");
    const btnSosCancel = document.getElementById("btn-sos-cancel");
    const sosChips = document.querySelectorAll(".sos-chip");
    const sosTimerNum = document.getElementById("sos-timer");
    const btnSosCall = document.getElementById("btn-sos-call");
    const btnSosContact = document.getElementById("btn-sos-contact");

    const medicalOverlay = document.getElementById("medical-overlay");
    const btnCloseMedical = document.getElementById("btn-close-medical");
    const medicalCountdown = document.getElementById("medical-countdown");

    let sosTimerInterval = null;
    let sosTimeLeft = 25;

    let medicalInterval = null;
    let medicalSeconds = 120; // 2:00 minutos

    // Iniciar Cuenta Regresiva SOS
    const startSosCountdown = () => {
        clearInterval(sosTimerInterval);
        sosTimeLeft = 25;
        if (sosTimerNum) sosTimerNum.textContent = "0:25";

        sosTimerInterval = setInterval(() => {
            sosTimeLeft--;
            let secondsStr = sosTimeLeft < 10 ? `0:0${sosTimeLeft}` : `0:${sosTimeLeft}`;
            if (sosTimerNum) sosTimerNum.textContent = secondsStr;

            if (sosTimeLeft <= 0) {
                clearInterval(sosTimerInterval);
                alert("🚨 Llamada automática de emergencia disparada a Seguridad UAG.");
                closeSosPanel();
            }
        }, 1000);
    };

    const closeSosPanel = () => {
        if (sosOverlay) sosOverlay.classList.add("hidden");
        clearInterval(sosTimerInterval);
    };

    // Abrir Modal SOS
    if (btnSos) {
        btnSos.addEventListener("click", () => {
            if (sosOverlay) {
                sosOverlay.classList.remove("hidden");
                startSosCountdown();
            }
        });
    }

    // Chips de opciones SOS
    sosChips.forEach(chip => {
        chip.addEventListener("click", () => {
            sosChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
        });
    });

    if (btnSosCancel) {
        btnSosCancel.addEventListener("click", closeSosPanel);
    }

    if (btnSosCall) {
        btnSosCall.addEventListener("click", () => {
            clearInterval(sosTimerInterval);
            alert("📞 Conectando con Autoridades de Seguridad UAG...");
            closeSosPanel();
        });
    }

    // Iniciar Mapa Médico
    const startMedicalTimer = () => {
        clearInterval(medicalInterval);
        medicalSeconds = 120;
        if (medicalCountdown) medicalCountdown.textContent = "2:00 min";

        medicalInterval = setInterval(() => {
            medicalSeconds--;
            let mins = Math.floor(medicalSeconds / 60);
            let secs = medicalSeconds % 60;
            let secsStr = secs < 10 ? `0${secs}` : secs;

            if (medicalCountdown) {
                medicalCountdown.textContent = `${mins}:${secsStr} min`;
            }

            if (medicalSeconds <= 0) {
                clearInterval(medicalInterval);
                if (medicalCountdown) medicalCountdown.textContent = "¡Personal médico arribó!";
            }
        }, 1000);
    };

    // Al presionar Avisar a Contacto Emergencia -> Abrir Mapa de Asistencia
    if (btnSosContact) {
        btnSosContact.addEventListener("click", () => {
            closeSosPanel();
            if (medicalOverlay) medicalOverlay.classList.remove("hidden");
            startMedicalTimer();
        });
    }

    if (btnCloseMedical) {
        btnCloseMedical.addEventListener("click", () => {
            if (medicalOverlay) medicalOverlay.classList.add("hidden");
            clearInterval(medicalInterval);
        });
    }
});