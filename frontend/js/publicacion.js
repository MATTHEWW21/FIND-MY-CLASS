document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos existentes
    const openModalBtn = document.getElementById("open-activity-modal");
    const activityModal = document.getElementById("activity-modal");
    const btnAccept = document.getElementById("btn-accept-activity");
    const optionItems = document.querySelectorAll(".option-item");
    const displayActivityName = document.getElementById("display-activity-name");

    const btnClose = document.getElementById("btn-close");
    const btnNext = document.getElementById("btn-next");
    const btnBackStep = document.getElementById("btn-back-step");
    const btnPublish = document.getElementById("btn-publish");

    const stepPhotoSelect = document.getElementById("step-photo-select");
    const stepPublishDetails = document.getElementById("step-publish-details");

    const galleryItems = document.querySelectorAll(".gallery-item");
    const mainImg = document.querySelector(".main-preview-img");
    const selectedPublishImg = document.getElementById("selected-publish-img");

    // NUEVAS REFERENCIAS: Switch y cuadro de estadísticas
    const statsSwitch = document.querySelector(".switch input[type='checkbox']");
    const publishOverlayStats = document.querySelector(".publish-overlay-stats");

    let currentSelectedActivity = "CAMINATA";

    // 1. Darse tap a la X (✕) -> Regresa al Feed/Inicio
    if (btnClose) {
        btnClose.addEventListener("click", () => {
            window.location.href = "feed.html";
        });
    }

    // 2. Darse tap a NEXT -> Pasa a "FINALIZAR PUBLICACIÓN"
    if (btnNext) {
        btnNext.addEventListener("click", () => {
            stepPhotoSelect.classList.add("hidden");
            stepPublishDetails.classList.remove("hidden");
        });
    }

    // 3. Regresar del Paso 2 al Paso 1 (flecha ←)
    if (btnBackStep) {
        btnBackStep.addEventListener("click", () => {
            stepPublishDetails.classList.add("hidden");
            stepPhotoSelect.classList.remove("hidden");
        });
    }

    // 4. Darse tap a PUBLICAR -> Guarda en localStorage y redirige al Feed
    if (btnPublish) {
        btnPublish.addEventListener("click", () => {
            const captionText = document.querySelector(".caption-input-box textarea")?.value || "¡Increíble ruta por la facultad! #UAG";
            const currentImgSrc = document.getElementById("selected-publish-img")?.getAttribute("src") || "assets/uag-campus.jpg";
            const showStats = document.querySelector(".switch input[type='checkbox']")?.checked;

            const newPost = {
                author: "Ángel Orozco",
                time: "Hoy, Hace un momento",
                activity: currentSelectedActivity || "CAMINATA",
                dist: "2.80 km",
                cal: "125",
                duration: "00:32:25",
                imgSrc: currentImgSrc,
                caption: captionText,
                showStats: showStats
            };

            // Guardar publicación en localStorage
            localStorage.setItem("latestPost", JSON.stringify(newPost));

            alert("¡Tu publicación ha sido compartida con éxito! 🎉");
            window.location.href = "feed.html";
        });
    }

    // 5. Abrir selector de actividad (Pop-over)
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            activityModal.classList.remove("hidden");
        });
    }

    // 6. Selección de opción en el pop-over
    optionItems.forEach(item => {
        item.addEventListener("click", () => {
            optionItems.forEach(i => i.classList.remove("selected"));
            item.classList.add("selected");

            const text = item.querySelector(".opt-text").textContent;
            currentSelectedActivity = text.toUpperCase();
        });
    });

    // Confirmar actividad
    if (btnAccept) {
        btnAccept.addEventListener("click", () => {
            if (displayActivityName) displayActivityName.textContent = currentSelectedActivity;
            activityModal.classList.add("hidden");
        });
    }

    // Cerrar pop-over al dar clic fuera
    if (activityModal) {
        activityModal.addEventListener("click", (e) => {
            if (e.target === activityModal) {
                activityModal.classList.add("hidden");
            }
        });
    }

    // 7. Galería: Cambiar foto seleccionada en ambos pasos
    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            galleryItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const newSrc = item.querySelector("img").getAttribute("src");
            if (mainImg) mainImg.setAttribute("src", newSrc);
            if (selectedPublishImg) selectedPublishImg.setAttribute("src", newSrc);
        });
    });

    // 8. CONTROL DEL SWITCH: Mostrar u ocultar estadísticas sobre la foto
    if (statsSwitch && publishOverlayStats) {
        statsSwitch.addEventListener("change", (e) => {
            if (e.target.checked) {
                publishOverlayStats.classList.remove("hidden");
            } else {
                publishOverlayStats.classList.add("hidden");
            }
        });
    }
});