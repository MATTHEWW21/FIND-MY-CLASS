// registro.js - INICIAR RUTA: tracker con GPS real, guardado en la cuenta y SOS.
document.addEventListener('DOMContentLoaded', () => {
    if (!requerirSesion()) return;

    const $ = (id) => document.getElementById(id);
    const rol = localStorage.getItem('userRole');
    const puedeGuardar = rol === 'estudiante' || rol === 'colaborador';
    const ACT = FMCActividades.ACTIVIDADES;

    // ---------- constantes ----------
    const PESO_KG = 70;                                                      // el mismo peso de referencia que usa el servidor
    const MET = { caminata: 3.5, carrera: 9, ciclismo: 6.8, inclusivo: 3, scooter: 4 };
    const VEL_EST = { caminata: 1.25, carrera: 2.8, ciclismo: 4.5, inclusivo: 1.1, scooter: 3.5 };   // m/s, solo si no hay GPS
    const VEL_MAX = { caminata: 4, carrera: 9, ciclismo: 20, inclusivo: 5, scooter: 12 };            // m/s: mas rapido que esto es un salto del GPS
    const PRECISION_MAX = 40;        // metros: lecturas peores que esto se ignoran
    const ESPERA_GPS_MS = 12000;     // si no hay señal en este tiempo, se estima la distancia por tiempo
    const MIN_GUARDAR_S = 30;        // menos de esto no se guarda
    const CLAVE = 'trackerActivo';

    // ---------- estado ----------
    const e = {
        tipo: 'caminata', iniciado: false, corriendo: false,
        acumuladoMs: 0, inicioTramo: 0, distanciaM: 0,
        modo: 'esperando',           // esperando | gps | estimado
    };
    let ticker = null, ultimoTick = 0, vigilante = null, esperaGps = null, ultimaPos = null, saltos = 0, bloqueoPantalla = null;
    let ultimoResumen = null;

    // ---------- utilidades ----------
    const ms = () => e.acumuladoMs + (e.corriendo ? Date.now() - e.inicioTramo : 0);
    const calorias = () => Math.round(MET[e.tipo] * PESO_KG * (ms() / 3600000));
    function hms(seg) {
        const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = Math.floor(seg % 60);
        return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
    }
    function metros(a, b) {   // distancia entre dos coordenadas (haversine)
        const R = 6371000, rad = Math.PI / 180;
        const dLat = (b.latitude - a.latitude) * rad, dLng = (b.longitude - a.longitude) * rad;
        const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(x));
    }
    function estadoGps(texto, clase) {
        const el = $('gps-estado');
        el.textContent = texto;
        el.className = 'gps-estado' + (clase ? ' ' + clase : '');
    }

    // ---------- selector de actividad ----------
    const selector = $('selector');
    Object.keys(ACT).forEach((clave) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'selector-btn' + (clave === e.tipo ? ' active' : '');
        b.dataset.mode = clave;
        b.title = ACT[clave].nombre;
        selector.appendChild(b);
    });
    function pintarSelector() {
        selector.querySelectorAll('.selector-btn').forEach((b) => {
            const activo = b.dataset.mode === e.tipo;
            b.classList.toggle('active', activo);
            b.disabled = e.iniciado;
            b.innerHTML = FMCActividades.icono(b.dataset.mode, 22, activo ? '#ffffff' : '#333333');
        });
        const icono = $('activity-main-icon');
        icono.style.backgroundColor = ACT[e.tipo].color;
        icono.innerHTML = FMCActividades.icono(e.tipo, 30);
        $('selected-activity-text').textContent = ACT[e.tipo].nombre.toUpperCase();
    }
    selector.addEventListener('click', (ev) => {
        const b = ev.target.closest('.selector-btn');
        if (!b || e.iniciado) return;
        e.tipo = b.dataset.mode;
        pintarSelector();
    });

    // ---------- pantalla ----------
    function pintar() {
        const seg = ms() / 1000;
        $('timer').textContent = hms(seg);
        $('distancia').textContent = (e.distanciaM / 1000).toFixed(2);
        $('calorias').textContent = calorias();
        $('velocidad').textContent = seg > 5 ? (e.distanciaM / seg * 3.6).toFixed(1) : '0.0';
        const titulo = document.querySelector('#btn-comenzar .start-title');
        titulo.textContent = e.corriendo ? 'PAUSAR' : e.iniciado ? 'REANUDAR' : 'COMENZAR';
        $('btn-comenzar').style.backgroundColor = e.corriendo ? '#cc6324' : '#1a1a1a';
        $('start-flecha').textContent = e.corriendo ? '❚❚' : '▶';
        $('btn-terminar').classList.toggle('hidden', !e.iniciado);
    }

    function guardarLocal() {
        try {
            if (!e.iniciado) { localStorage.removeItem(CLAVE); return; }
            localStorage.setItem(CLAVE, JSON.stringify({
                tipo: e.tipo, acumuladoMs: ms(), distanciaM: e.distanciaM, modo: e.modo, ts: Date.now(),
            }));
        } catch (err) {}
    }

    // ---------- GPS ----------
    function pasarAEstimado(texto) {
        if (e.modo === 'gps') return;
        e.modo = 'estimado';
        estadoGps(texto, 'aviso');
    }
    function alPosicion(p) {
        if (!e.corriendo) return;
        const c = p.coords;
        if (c.accuracy > PRECISION_MAX) {
            if (e.modo === 'esperando') estadoGps('Buscando señal GPS más precisa…');
            return;
        }
        if (e.modo !== 'gps') {
            e.modo = 'gps';
            clearTimeout(esperaGps);
            estadoGps('GPS activo', 'ok');
        }
        const t = p.timestamp || Date.now();
        if (!ultimaPos) { ultimaPos = { latitude: c.latitude, longitude: c.longitude, t }; return; }
        const d = metros(ultimaPos, c);
        const dt = (t - ultimaPos.t) / 1000;
        if (dt <= 0) return;
        if (d / dt > VEL_MAX[e.tipo]) {                      // salto raro del GPS: se ignora (tras 3 seguidos se acepta el nuevo punto)
            if (++saltos >= 3) { ultimaPos = { latitude: c.latitude, longitude: c.longitude, t }; saltos = 0; }
            return;
        }
        saltos = 0;
        if (d < Math.max(2, c.accuracy * 0.4)) return;       // ruido del GPS estando quieto
        e.distanciaM += d;
        ultimaPos = { latitude: c.latitude, longitude: c.longitude, t };
        pintar();
    }
    function alErrorGps(err) {
        if (e.modo === 'gps') return;                        // un fallo suelto con GPS ya activo no importa
        const motivo = err && err.code === 1 ? 'Sin permiso de ubicación' : 'Sin señal GPS';
        pasarAEstimado(`${motivo}: la distancia se estima por tiempo.`);
    }
    function iniciarGps() {
        ultimaPos = null; saltos = 0;
        e.modo = 'esperando';
        estadoGps('Buscando señal GPS…');
        if (!navigator.geolocation || !window.isSecureContext && location.hostname !== 'localhost') {
            pasarAEstimado('Este navegador no permite GPS en esta conexión: la distancia se estima por tiempo.');
            return;
        }
        vigilante = navigator.geolocation.watchPosition(alPosicion, alErrorGps, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
        esperaGps = setTimeout(() => { if (e.modo === 'esperando') pasarAEstimado('Sin señal GPS todavía: la distancia se estima por tiempo.'); }, ESPERA_GPS_MS);
    }
    function detenerGps() {
        if (vigilante !== null) navigator.geolocation.clearWatch(vigilante);
        vigilante = null;
        clearTimeout(esperaGps);
    }

    async function pedirPantalla() {
        try { if (navigator.wakeLock) bloqueoPantalla = await navigator.wakeLock.request('screen'); } catch (err) {}
    }
    function soltarPantalla() {
        try { if (bloqueoPantalla) bloqueoPantalla.release(); } catch (err) {}
        bloqueoPantalla = null;
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && e.corriendo) pedirPantalla(); });

    // ---------- comenzar / pausar / reanudar ----------
    function tick() {
        const ahora = Date.now();
        if (e.modo === 'estimado') e.distanciaM += ((ahora - ultimoTick) / 1000) * VEL_EST[e.tipo];
        ultimoTick = ahora;
        pintar();
        if (Math.round(ms() / 1000) % 5 === 0) guardarLocal();
    }
    function arrancar() {
        e.iniciado = true;
        e.corriendo = true;
        e.inicioTramo = Date.now();
        ultimoTick = e.inicioTramo;
        iniciarGps();
        pedirPantalla();
        ticker = setInterval(tick, 1000);
        pintarSelector(); pintar(); guardarLocal();
    }
    function pausar() {
        e.acumuladoMs = ms();
        e.corriendo = false;
        clearInterval(ticker);
        detenerGps();
        soltarPantalla();
        estadoGps('En pausa');
        pintar(); guardarLocal();
    }
    $('btn-comenzar').addEventListener('click', () => (e.corriendo ? pausar() : arrancar()));

    // ---------- terminar ----------
    function reiniciar() {
        clearInterval(ticker); detenerGps(); soltarPantalla();
        Object.assign(e, { iniciado: false, corriendo: false, acumuladoMs: 0, inicioTramo: 0, distanciaM: 0, modo: 'esperando' });
        try { localStorage.removeItem(CLAVE); } catch (err) {}
        estadoGps('Elige tu actividad y pulsa COMENZAR');
        pintarSelector(); pintar();
    }

    async function guardarActividad() {
        const estado = $('resumen-estado');
        const boton = $('btn-reintentar');
        if (!puedeGuardar) {
            estado.className = 'resumen-estado';
            estado.textContent = 'Como visitante tu actividad no se guarda en ninguna cuenta.';
            return;
        }
        estado.className = 'resumen-estado';
        estado.textContent = 'Guardando…';
        boton.classList.add('hidden');
        const guardada = await registrarActividad({
            tipo: ultimoResumen.tipo, origen: 'tracker',
            distancia_m: ultimoResumen.distancia_m, duracion_s: ultimoResumen.duracion_s,
        });
        if (guardada) {
            estado.textContent = '✓ Guardada en tu perfil';
        } else {
            estado.className = 'resumen-estado error';
            estado.textContent = 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.';
            boton.classList.remove('hidden');
        }
    }

    $('btn-terminar').addEventListener('click', async () => {
        if (e.corriendo) pausar();
        const seg = Math.round(ms() / 1000);
        if (seg < MIN_GUARDAR_S) {
            if (await FMCAviso.confirmar('La actividad dura menos de 30 segundos y no se guardará. ¿Descartarla?', { si: 'Descartar', no: 'Seguir', peligro: true })) reiniciar();
            return;
        }
        ultimoResumen = { tipo: e.tipo, distancia_m: Math.round(e.distanciaM), duracion_s: seg, calorias: calorias() };
        // Para publicar en el feed (Nueva publicación lee esto)
        try {
            localStorage.setItem('ultimaRuta', JSON.stringify({
                distancia_m: ultimoResumen.distancia_m, duracion_s: seg, destino: '', actividad: e.tipo, ts: Date.now(),
            }));
        } catch (err) {}

        $('resumen-icono').style.backgroundColor = ACT[e.tipo].color;
        $('resumen-icono').innerHTML = FMCActividades.icono(e.tipo, 30);
        $('resumen-titulo').textContent = '¡' + ACT[e.tipo].nombre + ' terminada!';
        $('res-distancia').textContent = (ultimoResumen.distancia_m / 1000).toFixed(2);
        $('res-tiempo').textContent = hms(seg);
        $('res-calorias').textContent = ultimoResumen.calorias;
        const vista = localStorage.getItem('userVista');
        const puedePublicar = rol === 'estudiante' || (rol === 'colaborador' && vista !== 'simplificada');
        $('btn-publicar').classList.toggle('hidden', !puedePublicar || ultimoResumen.distancia_m <= 0);
        $('resumen-overlay').classList.remove('hidden');
        guardarActividad();
    });
    $('btn-reintentar').addEventListener('click', guardarActividad);
    $('btn-publicar').addEventListener('click', () => { window.location.href = 'nueva-publicacion.html'; });
    $('btn-resumen-listo').addEventListener('click', () => {
        $('resumen-overlay').classList.add('hidden');
        reiniciar();
    });

    // ---------- recuperar una actividad que se quedó a medias ----------
    try {
        const g = JSON.parse(localStorage.getItem(CLAVE) || 'null');
        if (g && ACT[g.tipo] && Date.now() - g.ts < 12 * 3600 * 1000) {
            e.tipo = g.tipo; e.iniciado = true; e.acumuladoMs = g.acumuladoMs; e.distanciaM = g.distanciaM;
            estadoGps('Actividad en pausa: pulsa REANUDAR para continuar', 'aviso');
        } else localStorage.removeItem(CLAVE);
    } catch (err) {}
    // Si hay una ruta en curso en el mapa, se avisa y se propone la misma forma de moverse (solo si aun no empiezas)
    try {
        const r = JSON.parse(localStorage.getItem('rutaMapa') || 'null');
        if (r && Date.now() - r.ts < 4 * 3600 * 1000 && r.nombre) {
            $('ruta-mapa-texto').textContent = `Tienes una ruta ${r.empezo ? 'en curso' : 'preparada'} hacia ${r.nombre}.`;
            $('ruta-mapa-aviso').classList.remove('hidden');
            if (!e.iniciado && ACT[r.modo]) e.tipo = r.modo;
        }
    } catch (err) {}
    pintarSelector();
    pintar();

    // =====================================================================
    // SOS
    // =====================================================================
    const sosOverlay = $('sos-overlay');
    const sosAviso = $('sos-aviso');
    const sosChips = document.querySelectorAll('.sos-chip');
    const sosTimerNum = $('sos-timer');
    const btnLlamar = $('btn-sos-call');
    const btnContacto = $('btn-sos-contact');
    const medicalOverlay = $('medical-overlay');
    const ESPERA_SOS = 25;

    let sosInterval = null, sosRestante = ESPERA_SOS, sosPos = null, sosEnCurso = false;
    let telefonoSeguridad;      // undefined = aun no se consulta, null = no configurado

    function avisoSos(html) {
        sosAviso.replaceChildren();
        if (!html) { sosAviso.classList.add('hidden'); return; }
        html.forEach((n) => sosAviso.appendChild(typeof n === 'string' ? document.createTextNode(n) : n));
        sosAviso.classList.remove('hidden');
    }
    function tipoSos() {
        const chip = document.querySelector('.sos-chip.active');
        return chip ? chip.dataset.type : 'lesion';
    }
    sosChips.forEach((c) => c.addEventListener('click', () => {
        sosChips.forEach((x) => x.classList.remove('active'));
        c.classList.add('active');
    }));

    function leerPosicion() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) return resolve(null);
            navigator.geolocation.getCurrentPosition(
                (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
                () => resolve(null),
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
            );
        });
    }
    async function cargarTelefono() {
        if (telefonoSeguridad !== undefined) return telefonoSeguridad;
        try { telefonoSeguridad = (await apiFetch('/sos/config')).telefono; } catch (err) { telefonoSeguridad = null; }
        return telefonoSeguridad;
    }
    function cerrarSos() {
        sosOverlay.classList.add('hidden');
        clearInterval(sosInterval);
        avisoSos(null);
        btnLlamar.disabled = false; btnContacto.disabled = false;
        sosEnCurso = false;
    }
    async function registrarAlerta() {
        try { await apiFetch('/sos', { method: 'POST', body: { tipo: tipoSos(), lat: sosPos && sosPos.lat, lng: sosPos && sosPos.lng } }); }
        catch (err) { console.error('No se pudo registrar la alerta SOS:', err); }
    }

    async function llamarSeguridad() {
        if (sosEnCurso) return;
        sosEnCurso = true;
        clearInterval(sosInterval);
        btnLlamar.disabled = true; btnContacto.disabled = true;
        await registrarAlerta();
        const tel = await cargarTelefono();
        if (!tel) {
            avisoSos(['La alerta quedó registrada, pero el número de seguridad del campus aún no está configurado. Si es urgente, llama al 911.']);
            btnContacto.disabled = false; sosEnCurso = false;
            return;
        }
        window.location.href = 'tel:' + tel;
        setTimeout(cerrarSos, 800);
    }

    async function avisarContacto() {
        if (sosEnCurso) return;
        sosEnCurso = true;
        clearInterval(sosInterval);
        btnLlamar.disabled = true; btnContacto.disabled = true;
        await registrarAlerta();

        let contacto = null;
        if (puedeGuardar) {
            try { contacto = (await apiFetch('/auth/me')).usuario; } catch (err) {}
        }
        if (contacto && contacto.contacto_emergencia_telefono) {
            const lugar = sosPos ? ` Mi ubicación: https://maps.google.com/?q=${sosPos.lat.toFixed(6)},${sosPos.lng.toFixed(6)}` : '';
            const nombre = [contacto.nombre, contacto.apellido].filter(Boolean).join(' ');
            const texto = `🚨 Necesito ayuda. Soy ${nombre} y estoy en el campus de la UAG (Find My Class).${lugar}`;
            window.location.href = `sms:${contacto.contacto_emergencia_telefono}?&body=${encodeURIComponent(texto)}`;
        }
        const sinContacto = !(contacto && contacto.contacto_emergencia_telefono);
        cerrarSos();
        abrirAyudaCercana(sinContacto);
    }

    async function abrirSos() {
        sosOverlay.classList.remove('hidden');
        avisoSos(null);
        btnLlamar.disabled = false; btnContacto.disabled = false;
        sosRestante = ESPERA_SOS;
        sosTimerNum.textContent = '0:' + String(sosRestante).padStart(2, '0');
        clearInterval(sosInterval);
        sosInterval = setInterval(() => {
            sosRestante--;
            sosTimerNum.textContent = '0:' + String(Math.max(0, sosRestante)).padStart(2, '0');
            if (sosRestante <= 0) { clearInterval(sosInterval); llamarSeguridad(); }   // sin respuesta: llamada automática
        }, 1000);
        sosPos = null;
        leerPosicion().then((p) => { sosPos = p; });
    }

    $('btn-sos').addEventListener('click', abrirSos);
    $('btn-sos-cancel').addEventListener('click', cerrarSos);
    btnLlamar.addEventListener('click', llamarSeguridad);
    btnContacto.addEventListener('click', avisarContacto);

    // ---------- ayuda cercana: consultorio más cercano con ruta real ----------
    let mapaMedico = null, capaMedica = null, lugaresSalud = null, grafoMedico = null;

    async function abrirAyudaCercana(sinContacto) {
        medicalOverlay.classList.remove('hidden');
        $('medical-eta').textContent = '…';
        $('medical-nota').textContent = '';
        if (!mapaMedico) {
            mapaMedico = L.map('medical-map', { zoomControl: false }).setView([20.6925, -103.4195], 17);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(mapaMedico);
            capaMedica = L.layerGroup().addTo(mapaMedico);
        }
        setTimeout(() => mapaMedico.invalidateSize(), 150);
        capaMedica.clearLayers();

        try {
            if (!lugaresSalud) {
                const todos = await apiFetch('/mapa/lugares');
                lugaresSalud = todos.filter((l) => l.tipo === 'salud');
            }
            if (!grafoMedico) grafoMedico = await apiFetch('/mapa/grafo');
        } catch (err) {
            $('medical-eta').textContent = '--';
            $('medical-nota').textContent = 'No se pudieron cargar los consultorios. Si es urgente, llama a seguridad del campus o al 911.';
            return;
        }

        const pin = (l, resaltado) => L.marker([l.lat, l.lng], {
            icon: L.divIcon({ className: '', html: `<div style="font-size:${resaltado ? 28 : 22}px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">🏥</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
        }).bindTooltip(l.nombre).addTo(capaMedica);
        lugaresSalud.forEach((l) => pin(l, false));

        const pos = sosPos || await leerPosicion();
        let nota = sinContacto && puedeGuardar ? 'No tienes contacto de emergencia: agrégalo en Perfil → ⚙️ para avisarle la próxima vez. ' : '';
        if (!pos) {
            $('medical-eta').textContent = '--';
            $('medical-nota').textContent = nota + 'No pudimos ubicarte. Estos son los lugares de atención médica del campus.';
            if (lugaresSalud.length) mapaMedico.fitBounds(lugaresSalud.map((l) => [l.lat, l.lng]), { padding: [40, 40] });
            return;
        }
        L.circleMarker([pos.lat, pos.lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#2b73d9', fillOpacity: 1 }).bindTooltip('Tú').addTo(capaMedica);
        const candidatos = lugaresSalud.filter((l) => /consultorio/i.test(l.nombre));
        const lista = candidatos.length ? candidatos : lugaresSalud;
        if (!lista.length) { $('medical-eta').textContent = '--'; return; }
        const R = window.FMCRutas;
        const accesible = localStorage.getItem('accessibleRoutes') === 'true';
        let mejor = null;
        lista.forEach((l) => {
            const ruta = R ? R.calcular(grafoMedico, { lat: pos.lat, lng: pos.lng }, l, { soloAccesible: accesible }) : null;
            const m = ruta ? ruta.metros : R.distancia(pos, l) * 1.3;
            if (!mejor || m < mejor.m) mejor = { l, m, camino: ruta ? ruta.camino : [{ lat: pos.lat, lng: pos.lng }, { lat: l.lat, lng: l.lng }] };
        });
        pin(mejor.l, true).openTooltip();
        L.polyline(mejor.camino.map((p) => [p.lat, p.lng]), { color: '#2b95bc', weight: 5, opacity: .9, dashArray: '2 9', lineCap: 'round' }).addTo(capaMedica);
        mapaMedico.fitBounds(mejor.camino.map((p) => [p.lat, p.lng]), { padding: [50, 50] });
        const min = Math.max(1, Math.ceil(mejor.m / 80));
        $('medical-titulo').textContent = mejor.l.nombre.toUpperCase();
        $('medical-eta').textContent = `${min} min a pie`;
        $('medical-nota').textContent = nota + `Está a unos ${Math.round(mejor.m)} m. Si es grave, no te muevas: llama a seguridad o al 911.`;
    }
    $('btn-close-medical').addEventListener('click', () => medicalOverlay.classList.add('hidden'));
});