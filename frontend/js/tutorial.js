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
            text: "Permite cambiar de vista al mapa interactivo del campus para buscar rutas y edificios. Ahí también puedes pedir tu ruta con la voz.",
            target: "#btn-mapas",
            position: "bottom"
        },
        {
            text: "Explora los eventos y actividades destacadas de la UAG deslizando horizontalmente en este carrusel.",
            target: ".uag-events-section",
            position: "bottom"
        },
        // Una publicación del feed, explicada pieza por pieza (si todavía no hay ninguna, sale un solo aviso)
        {
            text: "Cada publicación muestra quién la hizo y cuándo. El ícono de color de la derecha indica la actividad: caminata, carrera, bici, scooter o inclusiva.",
            target: ".feed-container .post-card .pub-cabecera",
            position: "bottom",
            siFalta: "Aquí aparecerán las publicaciones de la comunidad: quién las hizo, el tipo de actividad, sus fotos y métricas. Todavía no hay ninguna, ¡puedes ser la primera persona en publicar!"
        },
        {
            text: "Estas son las métricas de la actividad: distancia, calorías y tiempo.",
            target: ".feed-container .post-card .metrics-grid",
            position: "bottom"
        },
        {
            text: "Las fotos que compartió la persona. Toca una para verla en grande.",
            target: ".feed-container .post-card .pub-fotos",
            position: "top"
        },
        {
            text: "El corazón es para dar me gusta. Se pinta de rojo al tocarlo y abajo ves a quién más le gustó.",
            target: ".feed-container .post-card .pub-btn.like",
            position: "top"
        },
        {
            text: "La burbuja abre los comentarios: puedes leer lo que escribieron y dejar el tuyo.",
            target: ".feed-container .post-card .pub-acciones .izq .pub-btn:not(.like)",
            position: "top"
        },
        {
            text: "Los tres puntos abren más opciones: eliminar tu publicación o reportar una que sea inapropiada.",
            target: ".feed-container .post-card .pub-acciones > .pub-btn",
            position: "top"
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
            text: "Permite buscar la ubicación que quieras: escribe el nombre, o toca el micrófono y dilo con tu voz.",
            target: "#search-trigger",
            position: "bottom"
        },
        {
            text: "Este es el asistente de voz. Tócalo y di a dónde quieres ir (por ejemplo: “llévame al consultorio” o “tengo sed”). Te dice la ruta y te va guiando hablando, con avisos de escaleras y rampas.",
            target: "#btn-voz",
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
    // Si falta el elemento pero el paso trae un texto "siFalta" (p. ej. el feed todavía no tiene publicaciones), se muestra ese aviso solo.
    // Se calcula hasta que el feed termine de cargar (las publicaciones llegan del servidor un momento después de abrir la página)
    let tutorialSteps = null;
    function prepararPasos() {
        tutorialSteps = allSteps.map(step => {
            if (!step.target || esVisible(step.target)) return step;
            if (step.siFalta) return { text: step.siFalta, target: null, position: "center" };
            return null;
        }).filter(Boolean);
    }

    // Lector de pantalla (TalkBack): el tutorial es un diálogo, anuncia cada paso y se avanza con Enter/espacio
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Tutorial. Toca la pantalla para avanzar");
    overlay.tabIndex = -1;
    tutorialText.setAttribute("aria-live", "polite");
    overlay.addEventListener("keydown", (e) => {
        if (e.target === overlay && (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")) { e.preventDefault(); overlay.click(); }
        if (e.key === "Escape") closeTutorial();
    });

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
        if (!tutorialSteps) return;   // todavía cargando el feed
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

    function arrancar() {
        prepararPasos();
        updateStep();
        try { overlay.focus({ preventScroll: true }); } catch (e) { /* sin foco */ }
    }

    // En el feed espera (máximo 3 s) a que aparezca la primera publicación; en las demás pantallas arranca de inmediato
    if (document.getElementById("feed-posts") && !document.querySelector("#feed-posts .post-card")) {
        let esperado = 0;
        const revisar = setInterval(() => {
            esperado += 100;
            if (document.querySelector("#feed-posts .post-card") || esperado >= 3000) {
                clearInterval(revisar);
                arrancar();
            }
        }, 100);
    } else {
        arrancar();
    }
});
