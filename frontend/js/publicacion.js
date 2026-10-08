document.addEventListener("DOMContentLoaded", () => {
    const openModalBtn = document.getElementById("open-activity-modal");
    const activityModal = document.getElementById("activity-modal");
    const btnAccept = document.getElementById("btn-accept-activity");
    const optionItems = document.querySelectorAll(".option-item");
    const displayActivityName = document.getElementById("display-activity-name");

    let currentSelectedActivity = "CAMINATA";

    // Abrir ventana desplegable (Pantalla 2)
    openModalBtn.addEventListener("click", () => {
        activityModal.classList.remove("hidden");
    });

    // Selección de opción en la lista
    optionItems.forEach(item => {
        item.addEventListener("click", () => {
            optionItems.forEach(i => i.classList.remove("selected"));
            item.classList.add("selected");

            const text = item.querySelector(".opt-text").textContent;
            currentSelectedActivity = text.toUpperCase();
        });
    });

    // Confirmar opción
    btnAccept.addEventListener("click", () => {
        displayActivityName.textContent = currentSelectedActivity;
        activityModal.classList.add("hidden");
    });

    // Cerrar si se da click fuera del popover
    activityModal.addEventListener("click", (e) => {
        if (e.target === activityModal) {
            activityModal.classList.add("hidden");
        }
    });

    // Selección de imágenes de la galería
    const galleryItems = document.querySelectorAll(".gallery-item");
    const mainImg = document.querySelector(".main-preview-img");

    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            galleryItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const newSrc = item.querySelector("img").getAttribute("src");
            mainImg.setAttribute("src", newSrc);
        });
    });
});