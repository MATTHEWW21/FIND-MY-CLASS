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
            position: "bottom" // <--- Al poner 'top' sube la tarjeta para no tapar la publicación
        },
        {
            text: "Permite crear una nueva publicación para compartir tu actividad o recorrido dentro del campus.",
            target: "#btn-publicacion", // <--- Selector del botón PUBLICACIÓN
            position: "center"
        },
        {
            text: "Te lleva al feed principal de novedades, publicaciones y comunidad de la app.",
            target: "#nav-inicio", // Selector del ícono INICIO en la barra inferior
            position: "top"
        },
        {
            text: "Abre la función del rastreador (tracker) para iniciar el conteo de tiempo, pasos y distancia recorrida.",
            target: "#nav-registro", // Selector del ícono REGISTRO en la barra inferior
            position: "top"
        },
        {
            text: "Acceso al área de chats directos o avisos con otros compañeros/profesores.",
            target: "#nav-mensajes", // Target para MENSAJES
            position: "top"
        },
        {
            text: "Muestra tu información personal, historial de trayectos, medallas e insignias obtenidas.",
            target: "#nav-perfil", // Target para PERFIL
            position: "top"
        }
    ];

    let currentStep = 0;

    function clearHighlights() {
        document.querySelectorAll('.step-highlight').forEach(el => {
            el.classList.remove('step-highlight');
        });
        // Limpia clases de posición de la tarjeta
        tutorialCard.classList.remove('pos-top', 'pos-bottom', 'pos-center');
    }

    function updateStep() {
        clearHighlights();

        if (currentStep < tutorialSteps.length) {
            const stepData = tutorialSteps[currentStep];
            tutorialText.innerText = stepData.text;

            // Ajusta la posición visual de la tarjeta
            const posClass = stepData.position ? `pos-${stepData.position}` : 'pos-center';
            tutorialCard.classList.add(posClass);

            // Aplica el marco rojo al objetivo
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

    overlay.addEventListener('click', (e) => {
        if (e.target === skipBtn) return;
        currentStep++;
        updateStep();
    });

    skipBtn.addEventListener('click', () => {
        closeTutorial();
    });

    function closeTutorial() {
        clearHighlights();
        overlay.classList.add('hidden');
        localStorage.setItem('hasSeenTutorial', 'true');
    }

    updateStep();
});