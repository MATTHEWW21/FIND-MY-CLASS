const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            showBuildingCard({
                nombre: query,
                descripcion: 'Resultado encontrado en la búsqueda.'
            });
        }
    }
});