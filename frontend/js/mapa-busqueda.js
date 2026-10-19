// mapa-busqueda.js - lógica pura del buscador del mapa (sin Leaflet ni DOM, para poder probarla sola).
// Se carga ANTES de mapa.js:  <script src="js/mapa-busqueda.js"></script>
(function (root) {
    // Tipos de lugar: emoji del pin, nombre para mostrar y palabras con las que la gente los busca.
    const TIPOS = {
        edificio:        { emoji: '🏢', etiqueta: 'Edificios',          sing: 'Edificio',     sinonimos: 'edificio salon clase' },
        puerta:          { emoji: '🚪', etiqueta: 'Puertas',            sing: 'Puerta',       sinonimos: 'entrada salida acceso' },
        alimentos:       { emoji: '🍽️', etiqueta: 'Comida',             sing: 'Comida',       sinonimos: 'comida comer food point cafeteria restaurante hambre' },
        oficina:         { emoji: '🏛️', etiqueta: 'Oficinas y centros', sing: 'Oficina',      sinonimos: 'oficina centro direccion' },
        auditorio:       { emoji: '🎭', etiqueta: 'Auditorios',         sing: 'Auditorio',    sinonimos: 'conferencia evento' },
        servicio:        { emoji: '🛎️', etiqueta: 'Servicios',          sing: 'Servicio',     sinonimos: 'servicios tienda banco' },
        deportes:        { emoji: '⚽', etiqueta: 'Deportes',           sing: 'Deportes',     sinonimos: 'deporte cancha estadio gimnasio alberca' },
        salud:           { emoji: '🏥', etiqueta: 'Salud',              sing: 'Salud',        sinonimos: 'medico doctor consultorio enfermeria' },
        estacionamiento: { emoji: '🅿️', etiqueta: 'Estacionamientos',   sing: 'Estacionamiento', sinonimos: 'parking auto coche' },
        snacks:          { emoji: '🍿', etiqueta: 'Máquinas de snacks', sing: 'Máquina de snacks', sinonimos: 'snack maquina botana frituras' },
        bebedero:        { emoji: '💧', etiqueta: 'Bebederos',          sing: 'Bebedero',     sinonimos: 'agua bebedero tomar sed' },
    };
    const ORDEN_TIPOS = Object.keys(TIPOS);

    // Minúsculas y sin acentos: "Protección" y "proteccion" son lo mismo
    function normalizar(s) {
        return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }

    // Una palabra de búsqueda coincide si es el inicio de alguna palabra del lugar.
    // Las de 1 letra ("a" en "edificio a") deben ser la palabra completa, para no coincidir con todo.
    function coincide(palabras, token) {
        return palabras.some((p) => (token.length === 1 ? p === token : p.startsWith(token)));
    }

    // Agrega a cada lugar el texto ya normalizado sobre el que se busca
    function preparar(lugares) {
        return lugares.map((l) => {
            const nombre = normalizar(l.nombre);
            const extra = [l.codigo, l.numero, TIPOS[l.tipo] && TIPOS[l.tipo].sinonimos].filter(Boolean).join(' ');
            const todo = nombre + ' ' + normalizar(extra);
            return Object.assign({}, l, { _nombre: nombre, _palabras: todo.split(/[^a-z0-9]+/).filter(Boolean) });
        });
    }

    // Busca: todas las palabras escritas deben coincidir. Primero los que empiezan con lo escrito.
    function buscar(lugares, consulta, tipo) {
        const tokens = normalizar(consulta).split(/\s+/).filter(Boolean);
        const lista = lugares.filter((l) => (!tipo || l.tipo === tipo) && tokens.every((t) => coincide(l._palabras, t)));
        if (!tokens.length) return lista;
        const q = tokens.join(' ');
        const puntaje = (l) => (l._nombre.startsWith(q) ? 0 : l._nombre.includes(q) ? 1 : 2);
        return lista
            .map((l, i) => ({ l, i, p: puntaje(l) }))
            .sort((a, b) => a.p - b.p || a.i - b.i)
            .map((x) => x.l);
    }

    // Para la lista sin búsqueda: agrupa por tipo en el orden de ORDEN_TIPOS
    function agrupar(lugares) {
        return ORDEN_TIPOS
            .map((tipo) => ({ tipo, items: lugares.filter((l) => l.tipo === tipo) }))
            .filter((g) => g.items.length);
    }

    const api = { TIPOS, ORDEN_TIPOS, normalizar, preparar, buscar, agrupar };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.FMCBusqueda = api;
})(typeof window !== 'undefined' ? window : globalThis);
