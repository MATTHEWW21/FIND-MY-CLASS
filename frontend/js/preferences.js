document.addEventListener('DOMContentLoaded', () => {
    const btnYes = document.getElementById('btn-accessible-yes');
    const btnNo = document.getElementById('btn-accessible-no');
    const btnSave = document.getElementById('btn-save'); // 1. Referencia al botón Guardar
    let needsAccessibility = null; // Inicia sin selección

    // 1. Manejo de botones Sí / No
    if (btnYes && btnNo) {
        btnYes.addEventListener('click', () => {
            needsAccessibility = true;
            btnYes.classList.add('active');
            btnNo.classList.remove('active');
        });

        btnNo.addEventListener('click', () => {
            needsAccessibility = false;
            btnNo.classList.add('active');
            btnYes.classList.remove('active');
        });
    }

    // 2. Manejo de Dropdowns (Actualiza texto dinámicamente)
    setupDropdown('select-building', 'select-building-trigger', '• Edificio Habitual');
    setupDropdown('select-career', 'select-career-trigger', '• ¿Que estudias?');

    function setupDropdown(selectId, triggerId, defaultPrefix) {
        const selectEl = document.getElementById(selectId);
        const triggerEl = document.getElementById(triggerId);

        if (selectEl && triggerEl) {
            const labelSpan = triggerEl.querySelector('.select-label');
            selectEl.addEventListener('change', (e) => {
                const selectedText = selectEl.options[selectEl.selectedIndex].text;
                labelSpan.textContent = `${defaultPrefix}: ${selectedText}`;
            });
        }
    }

    // 3. Redirección al dar clic en Guardar y Continuar -> envía a loading.html
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            localStorage.setItem('accessibleRoutes', needsAccessibility);
            window.location.href = 'loading.html';
        });
    }
});