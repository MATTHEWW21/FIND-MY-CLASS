// mapa-busqueda.js - lógica pura del buscador del mapa (sin Leaflet ni DOM, para poder probarla sola).
// Se carga ANTES de mapa.js:  <script src="js/mapa-busqueda.js"></script>
(function (root) {
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
        encuentro:       { emoji: '🆘', etiqueta: 'Puntos de encuentro', sing: 'Punto de encuentro', sinonimos: 'emergencia sismo temblor evacuacion reunion seguridad' },
        descanso:        { emoji: '🌳', etiqueta: 'Descanso',           sing: 'Descanso',     sinonimos: 'socializar relajarme descansar sentarme sillas areas verdes aire libre' },
        entrada_accesible: { emoji: '♿', etiqueta: 'Entradas accesibles', sing: 'Entrada accesible', sinonimos: 'silla de ruedas rampa discapacidad accesibilidad entrada' },
    };
    const ORDEN_TIPOS = Object.keys(TIPOS);

    function normalizar(s) {
        return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }

    function coincide(palabras, token) {
        return palabras.some((p) => (token.length === 1 ? p === token : p.startsWith(token)));
    }

    function preparar(lugares) {
        return lugares.map((l) => {
            const nombre = normalizar(l.nombre);
            const extra = [l.codigo, l.numero, TIPOS[l.tipo] && TIPOS[l.tipo].sinonimos].filter(Boolean).join(' ');
            const todo = nombre + ' ' + normalizar(extra);
            return Object.assign({}, l, { _nombre: nombre, _palabras: todo.split(/[^a-z0-9]+/).filter(Boolean) });
        });
    }

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

    function agrupar(lugares) {
        return ORDEN_TIPOS
            .map((tipo) => ({ tipo, items: lugares.filter((l) => l.tipo === tipo) }))
            .filter((g) => g.items.length);
    }

    const api = { TIPOS, ORDEN_TIPOS, normalizar, preparar, buscar, agrupar };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.FMCBusqueda = api;
})(typeof window !== 'undefined' ? window : globalThis);
