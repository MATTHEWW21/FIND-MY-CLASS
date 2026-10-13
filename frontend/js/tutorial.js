document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('tutorial-overlay');
    const tutorialCard = document.getElementById('tutorial-card');
    const tutorialText = document.getElementById('tutorial-text');
    const skipBtn = document.getElementById('btn-skip-tutorial');

    // Pasos del tutorial con posición dinámica de la tarjeta
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
            position: "center"
        },
        {
            text: "Muestra el perfil del usuario, la fecha y el deporte junto a sus métricas clave (distancia, calorías, tiempo) y su mapa o fotos.\n\nEn la parte inferior incluye botones para reaccionar ('me gusta'), comentar y desplegar opciones (compartir, reportar o guardar).",
            target: ".post-card:first-child",
            position: "bottom"
        },
        {
            text: "Permite crear una nueva publicación para compartir tu actividad o recorrido dentro del campus.",
            target: "#btn-publicacion",
            position: "center"
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
        document.querySelectorAll('.step-highlight').forEach(el => {
            el.classList.remove('step-highlight');
        });
        tutorialCard.classList.remove('pos-top', 'pos-bottom', 'pos-center');
    }

    function updateStep() {
        clearHighlights();

        if (currentStep < tutorialSteps.length) {
            const stepData = tutorialSteps[currentStep];
            tutorialText.innerText = stepData.text;

            const posClass = stepData.position ? `pos-${stepData.position}` : 'pos-center';
            tutorialCard.classList.add(posClass);

            if (stepData.target) {
                const targetElement = document.querySelector(stepData.target);
                if (targetElement) {
                    targetElement.classList.add('step-highlight');
                }
            }
        } else {
            closeTutorial();
        }
    }

    // EVENTO DE PANTALLA COMPLETA
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            // Verificar si el clic fue en el botón de Omitir (o dentro de él)
            if (skipBtn && (e.target === skipBtn || skipBtn.contains(e.target))) {
                return; // No avanzar, el evento propio de skipBtn se encargará
            }

            // Clic en cualquier otra parte de la pantalla avanza de paso
            currentStep++;
            updateStep();
        });
    }

    // EVENTO EXCLUSIVO BOTÓN OMITIR
    if (skipBtn) {
        skipBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Detener propagación para no avanzar paso al cerrar
            closeTutorial();
        });
    }

    function closeTutorial() {
        clearHighlights();
        if (overlay) {
            overlay.classList.add('hidden');
        }
        localStorage.setItem('hasSeenTutorial', 'true');
    }

    updateStep();
});