// mapa-rutas.js - calculo del camino mas corto sobre la red de puntos y tramos (sin Leaflet ni DOM, para poder probarlo solo).
// Se carga ANTES de mapa.js:  <script src="js/mapa-rutas.js"></script>
(function (root) {
    // Distancia en metros entre dos coordenadas (haversine)
    function distancia(a, b) {
        const R = 6371000, rad = Math.PI / 180;
        const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
        const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(x));
    }

    // grafo = { puntos:[{id,lat,lng,es_accesible}], rutas:[{origen,destino,metros,es_accesible}] }  ->  lista de vecinos
    function construir(grafo, soloAccesible) {
        const nodos = new Map();
        (grafo.puntos || []).forEach((p) => {
            if (soloAccesible && p.es_accesible === false) return;
            nodos.set(p.id, { id: p.id, lat: p.lat, lng: p.lng, vecinos: [] });
        });
        (grafo.rutas || []).forEach((r) => {
            if (soloAccesible && r.es_accesible === false) return;
            const a = nodos.get(r.origen), b = nodos.get(r.destino);
            if (!a || !b || a === b) return;
            const m = r.metros > 0 ? r.metros : distancia(a, b);
            const k = [r.origen, r.destino].sort().join('|');
            a.vecinos.push({ a: b, m, tipo: r.tipo, k });
            b.vecinos.push({ a, m, tipo: r.tipo, k });
        });
        return nodos;
    }

    // Dijkstra desde un nodo: devuelve distancia y nodo anterior para todos los alcanzables.
    // (la red tiene decenas de nodos, asi que un recorrido simple es suficiente)
    // penalizar (opcional): conjunto de tramos ya usados; cuestan mas, para que salga un camino distinto
    function dijkstra(nodos, inicio, penalizar) {
        const dist = new Map(), prev = new Map(), hecho = new Set();
        nodos.forEach((n) => dist.set(n.id, Infinity));
        dist.set(inicio.id, 0);
        for (;;) {
            let u = null, mejor = Infinity;
            dist.forEach((d, id) => { if (!hecho.has(id) && d < mejor) { mejor = d; u = id; } });
            if (u === null) break;
            hecho.add(u);
            nodos.get(u).vecinos.forEach(({ a, m, k }) => {
                const c = penalizar && penalizar.has(k) ? m * FACTOR_REPETIDO : m;
                if (mejor + c < dist.get(a.id)) { dist.set(a.id, mejor + c); prev.set(a.id, u); }
            });
        }
        return { dist, prev };
    }

    const FACTOR_REPETIDO = 3;   // un tramo ya usado por otra ruta "cuesta" el triple al buscar una alternativa

    // Los puntos de la red mas cercanos a un lugar. Solo cuentan los que estan a menos de 100 m
    // (si ninguno, el mas cercano), para que la ruta no "salte" en linea recta por encima de edificios.
    function cercanos(nodos, punto, cuantos) {
        const todos = Array.from(nodos.values())
            .map((n) => ({ n, d: distancia(punto, n) }))
            .sort((x, y) => x.d - y.d);
        const cerca = todos.filter((x) => x.d <= 100).slice(0, cuantos);
        return cerca.length ? cerca : todos.slice(0, 1);
    }

    const PESO_TRAMO_LIBRE = 1.5; // caminar en linea recta fuera de la red "cuesta" mas que ir por los andadores

    // Ruta de origen a destino ({lat,lng} los dos). Prueba los 3 puntos mas cercanos de cada lado y se queda con el total mas corto.
    // Devuelve { metros, camino:[{lat,lng}...] } o null si la red no llega hasta ahi.
    function calcular(grafo, origen, destino, opciones) {
        const nodos = construir(grafo, !!(opciones && opciones.soloAccesible));
        if (!nodos.size) return null;
        const ini = cercanos(nodos, origen, 3), fin = cercanos(nodos, destino, 3);
        let mejor = null;
        ini.forEach((i) => {
            const { dist, prev } = dijkstra(nodos, i.n, opciones && opciones.penalizar);
            fin.forEach((f) => {
                const d = dist.get(f.n.id);
                if (d === Infinity) return;
                const costo = (i.d + f.d) * PESO_TRAMO_LIBRE + d;
                if (!mejor || costo < mejor.costo) mejor = { costo, i, f, prev };
            });
        });
        if (!mejor) return null;
        const ids = [mejor.f.n.id];
        while (mejor.prev.has(ids[0])) ids.unshift(mejor.prev.get(ids[0]));
        // Metros reales del camino (sin los recargos de las alternativas)
        let porRed = 0;
        const claves = [];
        for (let k = 0; k + 1 < ids.length; k++) {
            const v = nodos.get(ids[k]).vecinos.find((x) => x.a.id === ids[k + 1]);
            porRed += v ? v.m : 0;
            if (v) claves.push({ k: v.k, m: v.m });
        }
        mejor.metros = mejor.i.d + porRed + mejor.f.d;
        const camino = [{ lat: origen.lat, lng: origen.lng }]
            .concat(ids.map((id) => ({ lat: nodos.get(id).lat, lng: nodos.get(id).lng })))
            .concat([{ lat: destino.lat, lng: destino.lng }]);
        // Cuantos tramos del camino son rampas (para avisarlo y marcarlos en el mapa)
        const rampas = [];
        for (let k = 0; k + 1 < ids.length; k++) {
            const v = nodos.get(ids[k]).vecinos.find((x) => x.a.id === ids[k + 1] && x.tipo === 'rampa');
            if (v) rampas.push({ lat: (nodos.get(ids[k]).lat + nodos.get(ids[k + 1]).lat) / 2, lng: (nodos.get(ids[k]).lng + nodos.get(ids[k + 1]).lng) / 2 });
        }
        // Tramo por tramo (con su tipo y metros): es lo que usa la guia por voz para decir "gira a la derecha", "hay escaleras"...
        // El primero (origen -> red) y el ultimo (red -> destino) van en linea recta, por eso su tipo es 'libre'.
        const tramos = [];
        for (let k = 0; k + 1 < camino.length; k++) {
            const a = camino[k], b = camino[k + 1];
            let tipo = 'libre', metros = distancia(a, b);
            if (k > 0 && k < camino.length - 2) {
                const v = nodos.get(ids[k - 1]).vecinos.find((x) => x.a.id === ids[k]);
                tipo = (v && v.tipo) || 'normal';
                metros = v && v.m > 0 ? v.m : metros;
            }
            tramos.push({ a, b, metros, tipo });
        }
        return { metros: mejor.metros, camino, rampas, tramos, claves };
    }

    // Hasta `max` caminos distintos de origen a destino, del mas corto al mas largo. El primero es el mismo que da calcular().
    // Una alternativa solo cuenta si de verdad va por otro lado (comparte menos del 70% con otra) y no es una locura de larga.
    function alternativas(grafo, origen, destino, opciones, max) {
        const tope = max || 3;
        const primera = calcular(grafo, origen, destino, opciones);
        if (!primera) return [];
        const lista = [primera];
        const usados = new Set(primera.claves.map((c) => c.k));
        const compartido = (x, y) => {
            const ky = new Set(y.claves.map((c) => c.k));
            const m = x.claves.reduce((s, c) => s + (ky.has(c.k) ? c.m : 0), 0);
            return x.metros > 0 ? m / x.metros : 1;
        };
        for (let intento = 0; intento < 8 && lista.length < tope; intento++) {
            const alt = calcular(grafo, origen, destino, Object.assign({}, opciones, { penalizar: usados }));
            if (!alt) break;
            const nuevo = alt.claves.filter((c) => !usados.has(c.k));
            alt.claves.forEach((c) => usados.add(c.k));
            if (!nuevo.length) break;                                          // ya no hay por donde variar
            if (lista.some((r) => compartido(alt, r) > 0.7)) continue;         // casi igual a una que ya hay
            if (alt.metros > primera.metros * 1.6 + 60) continue;              // da demasiada vuelta
            lista.push(alt);
        }
        // la primera (la de siempre) se queda de primera; las demas van de la mas corta a la mas larga
        return [primera].concat(lista.slice(1).sort((x, y) => x.metros - y.metros));
    }

    const api = { distancia, construir, calcular, alternativas };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.FMCRutas = api;
})(typeof window !== 'undefined' ? window : globalThis);
