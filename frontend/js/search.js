// Referencia a la barra de búsqueda
const searchInput = document.getElementById('searchInput');

// Evento para capturar la búsqueda al presionar Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            // Llamamos a la función definida en app.js
            showBuildingCard({
                nombre: query,
                descripcion: 'Resultado encontrado en la búsqueda.'
            });
        }
    }
});