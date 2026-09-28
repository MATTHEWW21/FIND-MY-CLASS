// 1. Coordenadas exactas del Campus Central UAG y límites de zoom
const UAG_CENTER = [20.6956, -103.4172];

// 2. Definición de Capas (Tile Layers)
const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
});

const osmSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// 3. Inicialización del Mapa con Zoom y Capas
const map = L.map('map', {
    center: UAG_CENTER,
    zoom: 17,
    minZoom: 15,
    maxZoom: 20,
    layers: [osmStandard]
});

// Agregar Control de Capas en la esquina superior derecha
const baseMaps = {
    "Mapa Estándar": osmStandard,
    "Vista Satelital": osmSatellite
};
L.control.layers(baseMaps).addTo(map);

// Grupo para gestionar los Marcadores
const markersLayer = L.layerGroup().addTo(map);

// 4. Datos de Edificios (pueden ser consumidos desde la API de Express/PostgreSQL)
const campusBuildings = [
    { id: 1, name: "Edificio A", coords: [20.6952, -103.4190], desc: "Aulas de Ingeniería y Ciencias Exactas" },
    { id: 2, name: "Edificio B", coords: [20.69463, -103.42000], desc: "Laboratorios y Salas de Cómputo" },
    { id: 3, name: "Rectoría UAG", coords: [20.6942, -103.4190], desc: "Oficinas Administrativas y Servicios Estudiantiles" },
    { id: 4, name: "Gimnasio Universitario", coords: [20.6967, -103.4179], desc: "Área Deportiva y Canchas" }
];

// Función para renderizar marcadores en el mapa
function renderMarkers(buildings) {
    markersLayer.clearLayers(); // Limpia marcadores previos

    buildings.forEach(building => {
        const marker = L.marker(building.coords).addTo(markersLayer);

        // Popup rápido al pasar sobre el marcador
        marker.bindTooltip(building.name, { permanent: false, direction: 'top' });

        // Evento al hacer clic en un marcador: enfocar mapa y abrir tarjeta
        marker.on('click', () => {
            map.flyTo(building.coords, 18, { duration: 0.8 }); // Efecto de zoom suave
            showBuildingCard({
                nombre: building.name,
                descripcion: building.desc
            });
        });
    });
}

renderMarkers(campusBuildings);