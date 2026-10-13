document.addEventListener("DOMContentLoaded", () => {
    // 1. Delimitar área de la UAG e inicializar el mapa
    const boundsUAG = L.latLngBounds(
        L.latLng(20.6870, -103.4240),
        L.latLng(20.6990, -103.4110)
    );

    const map = L.map('map', {
        maxBounds: boundsUAG,
        maxBoundsViscosity: 1.0,
        minZoom: 16,
        maxZoom: 19,
        zoomControl: false
    }).setView([20.6938, -103.4178], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Refresco de lienzo para asegurar renderizado correcto en móviles
    setTimeout(() => { map.invalidateSize(); }, 200);

    // 2. Referencias a Elementos del DOM
    const searchTrigger = document.getElementById("search-trigger");
    const routePanel = document.getElementById("route-panel");       // Panel 1: Ruta Detallada
    const arrivalPanel = document.getElementById("arrival-panel");   // Panel 2: ¡Llegaste a tu destino!
    const feedbackPanel = document.getElementById("feedback-panel"); // Panel 3: Tu Experiencia
    const reportPanel = document.getElementById("report-panel");     // Panel 4: Reportar Incidencia

    const btnStart = document.getElementById("btn-start");
    const btnFinish = document.getElementById("btn-finish");
    const btnContinue = document.getElementById("btn-continue");

    const btnSendFeedback = document.getElementById("btn-send-feedback");
    const btnSkipFeedback = document.getElementById("btn-skip-feedback");
    const starBtns = document.querySelectorAll(".star-btn");

    // Botones del Panel de Reporte
    const btnReportIssue = document.getElementById("btn-report-issue");
    const btnBackReport = document.getElementById("btn-back-report");
    const btnCancelReport = document.getElementById("btn-cancel-report");
    const btnSubmitReport = document.getElementById("btn-submit-report");
    const categoryChips = document.querySelectorAll(".category-chip");

    // ABRIR PANEL 1: Al dar tap al buscador "BUSCA AQUÍ"
    if (searchTrigger && routePanel) {
        searchTrigger.addEventListener("click", () => {
            arrivalPanel.classList.add("hidden");
            feedbackPanel.classList.add("hidden");
            if (reportPanel) reportPanel.classList.add("hidden");
            routePanel.classList.remove("hidden");
        });
    }

    // BOTÓN EMPEZAR Y FINALIZAR
    if (btnStart && btnFinish) {
        btnStart.addEventListener("click", () => {
            btnStart.style.backgroundColor = "#5b8e5a";
            btnStart.textContent = "EN NAVEGACIÓN";
            btnFinish.disabled = false;
            btnFinish.style.backgroundColor = "#d9534f";
            btnFinish.style.color = "#ffffff";
            btnFinish.style.cursor = "pointer";
        });

        // PASO 1 A PASO 2: Al pulsar FINALIZAR abre "¡Llegaste a tu destino!"
        btnFinish.addEventListener("click", () => {
            routePanel.classList.add("hidden");
            setTimeout(() => {
                arrivalPanel.classList.remove("hidden");
            }, 250);
        });
    }

    // PASO 2 A PASO 3: Al pulsar CONTINUAR abre "TU EXPERIENCIA"
    if (btnContinue) {
        btnContinue.addEventListener("click", () => {
            arrivalPanel.classList.add("hidden");
            setTimeout(() => {
                feedbackPanel.classList.remove("hidden");
            }, 250);
        });
    }

    // SISTEMA INTERACTIVO DE ESTRELLAS
    starBtns.forEach((star, index) => {
        star.addEventListener("click", () => {
            starBtns.forEach((s, idx) => {
                if (idx <= index) {
                    s.textContent = "★";
                    s.classList.add("selected");
                } else {
                    s.textContent = "☆";
                    s.classList.remove("selected");
                }
            });
        });
    });

    // CERRAR Y REINICIAR LA VISTA GENERAL
    const closeFeedback = () => {
        if (feedbackPanel) feedbackPanel.classList.add("hidden");

        // Reinicia los botones de inicio al estado original
        if (btnStart && btnFinish) {
            btnStart.style.backgroundColor = "#f28d52";
            btnStart.textContent = "EMPEZAR";
            btnFinish.disabled = true;
            btnFinish.style.backgroundColor = "#d8d8d8";
            btnFinish.style.color = "#777777";
        }
    };

    // Si le da tap a ENVIAR: Muestra agradecimiento y cierra
    if (btnSendFeedback) {
        btnSendFeedback.addEventListener("click", () => {
            alert("¡Muchas gracias por tu opinión! 🙌");
            closeFeedback();
        });
    }

    // Si le da tap a AHORA NO, GRACIAS: Se cierra en silencio
    if (btnSkipFeedback) {
        btnSkipFeedback.addEventListener("click", () => {
            closeFeedback();
        });
    }

    // ==========================================
    // PASO 3 A PASO 4: FLUJO DE REPORTAR INCIDENCIA
    // ==========================================

    // Abrir la pantalla de Reportar Incidencia al presionar "Reportar ❗️"
    if (btnReportIssue && reportPanel) {
        btnReportIssue.addEventListener("click", () => {
            feedbackPanel.classList.add("hidden");
            setTimeout(() => {
                reportPanel.classList.remove("hidden");
            }, 250);
        });
    }

    // Regresar de Reportar a la pantalla de Valoración
    const closeReport = () => {
        if (reportPanel) reportPanel.classList.add("hidden");
        setTimeout(() => {
            if (feedbackPanel) feedbackPanel.classList.remove("hidden");
        }, 250);
    };

    if (btnBackReport) btnBackReport.addEventListener("click", closeReport);
    if (btnCancelReport) btnCancelReport.addEventListener("click", closeReport);

    // Selección de chips de categoría
    categoryChips.forEach(chip => {
        chip.addEventListener("click", () => {
            categoryChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
        });
    });

    // Enviar Reporte
    if (btnSubmitReport) {
        btnSubmitReport.addEventListener("click", () => {
            if (reportPanel) reportPanel.classList.add("hidden");
            closeFeedback(); // Reinicia el flujo
            alert("¡Reporte enviado con éxito! Muchas gracias por colaborar con la comunidad UAG.");
        });
    }
});