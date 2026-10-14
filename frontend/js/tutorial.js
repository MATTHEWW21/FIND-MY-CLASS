document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("tutorial-overlay");
    const tutorialCard = document.getElementById("tutorial-card");
    const tutorialText = document.getElementById("tutorial-text");
    const skipBtn = document.getElementById("btn-skip-tutorial");
    const bottomNav = document.querySelector(".bottom-nav");

    if (!overlay || !tutorialCard || !tutorialText) return;

    const tutorialSteps = [
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
        localStorage.setItem("hasSeenTutorial", "true");
    }

    updateStep();
});