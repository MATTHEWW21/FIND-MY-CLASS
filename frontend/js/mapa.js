document.addEventListener("DOMContentLoaded", () => {
    // 1. Límites geográficos (Límites Suroeste y Noreste del Campus UAG)
    const boundsUAG = L.latLngBounds(
        L.latLng(20.6870, -103.4240), // Esquina inferior izquierda (Suroeste)
        L.latLng(20.6990, -103.4110)  // Esquina superior derecha (Noreste)
    );

    const campusCenter = [20.6931, -103.4178];

    // 2. Inicializar mapa con límites estrictos y límites de zoom
    const map = L.map('map', {
        zoomControl: false,
        maxBounds: boundsUAG,        // Bloquea el desplazamiento fuera de la zona
        maxBoundsViscosity: 1.0,     // Efecto "pared sólida" al intentar arrastrar fuera
        minZoom: 16,                 // No permite alejarse más allá del campus
        maxZoom: 19                  // Acercamiento máximo para ver aulas/edificios
    }).setView(campusCenter, 17);

    // 3. Capa de baldosas OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Recalcular tamaño
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    // Puntos de interés del campus
    const pois = [
        { name: "Patio del Cristal / Rectoría", type: "edificio", lat: 20.6932, lng: -103.4180 },
        { name: "Cafetería Gran Terraza", type: "tienda", lat: 20.6928, lng: -103.4175 },
        { name: "Máquina de Snacks - Edificio 9", type: "snack", lat: 20.6936, lng: -103.4182 },
        { name: "Parada Tecobús Entrada Principal", type: "tecobus", lat: 20.6922, lng: -103.4170 },
        { name: "Bebedero de Agua Filtrada - Aulas", type: "bebedero", lat: 20.6934, lng: -103.4177 }
    ];

    const markersGroup = L.layerGroup().addTo(map);

    function displayMarkers(filterType = 'all') {
        markersGroup.clearLayers();

        pois.forEach(poi => {
            if (filterType === 'all' || poi.type === filterType) {
                const marker = L.marker([poi.lat, poi.lng]).addTo(markersGroup);
                marker.bindPopup(`<b>${poi.name}</b><br>Servicio: ${poi.type.toUpperCase()}`);
            }
        });
    }

    displayMarkers();

    window.filterPOIs = function(type) {
        displayMarkers(type);
    };
});