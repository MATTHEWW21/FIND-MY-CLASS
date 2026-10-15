document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("tutorial-overlay");
    const tutorialCard = document.getElementById("tutorial-card");
    const tutorialText = document.getElementById("tutorial-text");
    const skipBtn = document.getElementById("btn-skip-tutorial");
    const bottomNav = document.querySelector(".bottom-nav");

    if (!overlay || !tutorialCard || !tutorialText) return;

    // El tutorial sale una sola vez por cuenta (no por teléfono).
    // Para volver a verlo mientras pruebas: agrega ?tutorial=1 a la URL del feed.
    const cuenta = localStorage.getItem("userEmail") || localStorage.getItem("userRole") || "anon";
    const claveVisto = "hasSeenTutorial:" + cuenta;
    const forzar = new URLSearchParams(location.search).get("tutorial") === "1";
    if (!forzar && localStorage.getItem(claveVisto) === "true") {
        overlay.classList.add("hidden");
        return;
    }

    // Pasos de la vista completa (estudiante y colaborador con feed)
    const completeSteps = [
        {
            text: "Toca la pantalla para iniciar el tutorial",
            target: null,
            position: "center"
        },
        {
            text: "Esta es la interfaz general en la que podras navegar por la aplicacion.",
            target: null,
            position: "center"
        },
        {
            text: "Permite cambiar de vista al mapa interactivo del campus para buscar rutas y edificios.",
            target: "#btn-mapas",
            position: "bottom"
        },
        {
            text: "Explora los eventos y actividades destacadas de la UAG deslizando horizontalmente en este carrusel.",
            target: ".uag-events-section",
            position: "bottom"
        },
        {
            text: "Muestra el perfil del usuario, la fecha, el deporte y sus métricas (distancia, calorías, tiempo).\n\nAbajo puedes reaccionar, comentar y ver más opciones.",
            target: ".feed-container .post-card",
            position: "top",
            scroll: "end"
        },
        {
            text: "Permite crear una nueva publicación para compartir tu actividad o recorrido dentro del campus.",
            target: "#btn-publicacion",
            position: "bottom"
        },
        {
            text: "Te lleva al feed principal de novedades, publicaciones y comunidad de la app.",
            target: "#nav-inicio",
            position: "top"
        },
        {
            text: "Abre la función del rastreador (tracker) para iniciar el conteo de tiempo, pasos y distancia recorrida.",
            target: "#nav-iniciar-ruta",
            position: "top"
        },
        {
            text: "Acceso al área de chats directos o avisos con otros compañeros/profesores.",
            target: "#nav-mensajes",
            position: "top"
        },
        {
            text: "Muestra tu información personal, historial de trayectos, medallas e insignias obtenidas.",
            target: "#nav-perfil",
            position: "top"
        }
    ];

    // Pasos de la vista simplificada (colaborador): aterriza directo en el mapa
    const simplifiedSteps = [
        {
            text: "Toca la pantalla para iniciar el tutorial",
            target: null,
            position: "center"
        },
        {
            text: "Te lleva al mapa principal de la app y aquí puedes iniciar tu viaje.",
            target: "#nav-inicio",
            position: "top"
        },
        {
            text: "Abre la función del rastreador (tracker) para iniciar el conteo de tiempo, pasos y distancia recorrida.",
            target: "#nav-iniciar-ruta",
            position: "top"
        },
        {
            text: "Muestra tu información personal, historial de trayectos, medallas e insignias obtenidas.",
            target: "#nav-perfil",
            position: "top"
        },
        {
            text: "Permite buscar la ubicación que quieras (por texto o voz).",
            target: "#search-trigger",
            position: "bottom"
        }
    ];

    // role-ui.js (en el <head>) marca <html data-vista="simplificada"> para el colaborador simplificado
    const esSimplificada = document.documentElement.dataset.vista === "simplificada";
    const allSteps = esSimplificada ? simplifiedSteps : completeSteps;

    // Solo se muestran los pasos cuyo elemento existe y está visible en esta pantalla
    // (la vista simplificada oculta PUBLICACIÓN y MENSAJES con role-ui.css).
    function esVisible(selector) {
        const el = document.querySelector(selector);
        return !!el && el.getClientRects().length > 0;
    }
    const tutorialSteps = allSteps.filter(step => !step.target || esVisible(step.target));

    let currentStep = 0;

    function clearHighlights() {
        document.querySelectorAll(".step-highlight").forEach(el => {
            el.classList.remove("step-highlight");
        });
        if (bottomNav) bottomNav.classList.remove("nav-above");
        tutorialCard.classList.remove("pos-top", "pos-bottom", "pos-center");
    }

    function updateStep() {
        clearHighlights();

        if (currentStep >= tutorialSteps.length) {
            closeTutorial();
            return;
        }

        const stepData = tutorialSteps[currentStep];
        tutorialText.innerText = stepData.text;
        tutorialCard.classList.add(`pos-${stepData.position || "center"}`);

        if (stepData.target) {
            const targetElement = document.querySelector(stepData.target);
            if (targetElement) {
                targetElement.classList.add("step-highlight");

                const inBottomNav = bottomNav && bottomNav.contains(targetElement);
                if (inBottomNav) {
                    bottomNav.classList.add("nav-above");
                } else {
                    targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: stepData.scroll || "center"
                    });
                }
            }
        }
    }

    overlay.addEventListener("click", (e) => {
        if (skipBtn && (e.target === skipBtn || skipBtn.contains(e.target))) return;
        currentStep++;
        updateStep();
    });

    if (skipBtn) {
        skipBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            closeTutorial();
        });
    }

    function closeTutorial() {
        clearHighlights();
        overlay.classList.add("hidden");
        localStorage.setItem(claveVisto, "true");
    }

    updateStep();
});