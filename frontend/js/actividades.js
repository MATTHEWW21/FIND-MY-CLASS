// actividades.js - nombre, color e ícono de cada actividad (los mismos del selector de "Nueva publicación").
// Lo usan el selector, la publicación y el feed, para que el ícono siempre coincida con la actividad elegida.
(function (root) {
    const TRAZOS = {
        caminata:  '<circle cx="12" cy="5" r="2.5"/><path d="m9 20 3-6 3 6"/><path d="m6 9 6 1 6-1"/><path d="M12 10v4"/>',
        carrera:   '<circle cx="15" cy="4" r="2"/><path d="M7 21l3-4 2 1 3 4"/><path d="M11 13l-2-2 3-3 4 2 3-2"/>',
        ciclismo:  '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M12 17.5V14l-3-4 4-3.5 3 3"/>',
        inclusivo: '<circle cx="12" cy="4" r="2"/><path d="M12 6v7"/><circle cx="12" cy="17" r="4"/>',
        scooter:   '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 18h12M16 6h2v12"/>',
    };
    const ACTIVIDADES = {
        caminata:  { nombre: 'Caminata',            color: '#d96828' },
        carrera:   { nombre: 'Carrera',             color: '#2b73d9' },
        ciclismo:  { nombre: 'Ciclismo',            color: '#2e8b46' },
        inclusivo: { nombre: 'Recorrido inclusivo', color: '#7b3294' },
        scooter:   { nombre: 'Scooter',             color: '#6b6b6b' },
    };

    // Devuelve el SVG (blanco) de la actividad, del tamaño pedido en px
    function icono(clave, tam) {
        const t = TRAZOS[clave] || TRAZOS.caminata;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${t}</svg>`;
    }

    root.FMCActividades = { ACTIVIDADES, icono };
})(window);
