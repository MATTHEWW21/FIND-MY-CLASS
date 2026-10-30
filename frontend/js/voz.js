// voz.js - asistente de voz del mapa: escucha el destino, lo entiende y guia hablando (pensado para personas con discapacidad visual).
// Usa lo que ya trae el navegador (reconocimiento de voz + voz sintetica), asi que no necesita claves ni servicios de pago.
// Se carga DESPUES de mapa.js:  <script src="js/voz-guia.js"></script> <script src="js/voz.js"></script>
// Modo demo para pruebas en laptop (sin GPS): abre mapa.html?demo=1  (el recorrido se simula; ?demo=1&vel=6 cambia la velocidad en m/s)
(function () {
    const G = window.FMCGuia;
    const B = window.FMCBusqueda;
    if (!G || !B) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis || null;
    const params = new URLSearchParams(location.search);
    const DEMO = params.get('demo') === '1';
    const VEL_DEMO = Math.max(1, Math.min(15, Number(params.get('vel')) || 4));

    const RADIO_FIN = 9;          // m: se considera terminado el paso
    const RADIO_PREVIO = 20;      // m: se avisa lo que viene
    const RADIO_LLEGADA = 12;     // m: se considera que llegaste
    const FUERA_RUTA = 40;        // m: a esta distancia de la ruta se recalcula
    const GPS_MAX_ERROR = 60;     // m: lecturas peores que esto se ignoran

    let ruta = null;              // ultimo detalle de 'fmc:ruta'
    let ocupado = false;          // hay un dialogo de voz en curso
    let modoVoz = false;          // el destino se eligio por voz: la guia habla sola
    let ignorarEmpezar = false;
    let guia = null;              // estado de la guia activa
    let reconocimiento = null;

    // Preferencia: que la guia hable aunque el destino no se haya pedido por voz
    function prefVoz() { try { return localStorage.getItem('fmcVozGuia') === '1'; } catch (e) { return false; } }
    function guardarPrefVoz(v) { try { localStorage.setItem('fmcVozGuia', v ? '1' : '0'); } catch (e) {} }
    const debeHablarGuia = () => modoVoz || prefVoz();

    const el = (tag, clase, texto) => { const e = document.createElement(tag); if (clase) e.className = clase; if (texto != null) e.textContent = texto; return e; };
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
    const vibrar = (patron) => { try { if (navigator.vibrate) navigator.vibrate(patron); } catch (e) {} };

    // ---------- Voz que habla ----------
    let vozES = null;
    function elegirVoz() {
        if (!synth) return;
        const vs = synth.getVoices();
        vozES = vs.find((v) => /^es[-_]MX/i.test(v.lang)) || vs.find((v) => /^es[-_]US/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null;
    }
    if (synth) { elegirVoz(); synth.addEventListener && synth.addEventListener('voiceschanged', elegirVoz); }

    let _utt = null;   // se guarda para que el navegador no la borre antes de terminar de hablar
    // Habla y devuelve una promesa que se cumple al terminar. Tambien lo muestra escrito (personas sordas o con ruido alrededor).
    function hablar(texto, opciones) {
        const o = opciones || {};
        mostrarTexto(texto);
        if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return Promise.resolve();
        return new Promise((resolve) => {
            try {
                if (o.interrumpir !== false) synth.cancel();
                const u = new SpeechSynthesisUtterance(texto);
                u.lang = (vozES && vozES.lang) || 'es-MX';
                if (vozES) u.voice = vozES;
                u.rate = o.velocidad || 0.95;
                let fin = false;
                const listo = () => { if (!fin) { fin = true; clearTimeout(seguro); resolve(); } };
                u.onend = listo; u.onerror = listo;
                const seguro = setTimeout(listo, Math.min(30000, 2500 + texto.length * 85));
                _utt = u;
                synth.speak(u);
            } catch (e) { resolve(); }
        });
    }
    function callar() { try { if (synth) synth.cancel(); } catch (e) {} }

    // ---------- Panel de texto y botones ----------
    let panel, lblEstado, lblTexto, filaCtl, btnFab, btnMute;

    function crearUI() {
        // Boton grande de micrófono, siempre a la mano
        btnFab = el('button', 'voz-fab');
        btnFab.type = 'button'; btnFab.id = 'btn-voz';
        btnFab.setAttribute('aria-label', 'Hablar con el asistente de voz. Puedes decir, por ejemplo: llévame al consultorio');
        btnFab.textContent = '🎙️';
        btnFab.addEventListener('click', alTocarMicrofono);
        // Dentro del marco del celular (la app es una columna de 430 px centrada), no pegado al borde de la ventana
        const host = document.querySelector('.map-screen-container') || document.body;
        host.appendChild(btnFab);

        panel = el('div', 'voz-panel');
        panel.id = 'voz-panel';
        panel.setAttribute('role', 'status');
        panel.setAttribute('aria-live', 'polite');
        lblEstado = el('strong', 'voz-estado', '');
        lblTexto = el('p', 'voz-texto', '');
        filaCtl = el('div', 'voz-controles');
        const b = (txt, etiqueta, fn) => { const x = el('button', 'voz-ctl', txt); x.type = 'button'; x.setAttribute('aria-label', etiqueta); x.addEventListener('click', fn); return x; };
        filaCtl.appendChild(b('🔁 Repetir', 'Repetir la última indicación', () => decirPasoActual()));
        filaCtl.appendChild(b('⏭ Siguiente', 'Pasar a la siguiente indicación', () => avanzar(true)));
        btnMute = b('', 'Activar o apagar la voz de la guía', alternarVoz);
        filaCtl.appendChild(btnMute);
        filaCtl.appendChild(b('✖ Detener', 'Detener la guía por voz', () => detenerGuia('Guía detenida.')));
        panel.appendChild(lblEstado); panel.appendChild(lblTexto); panel.appendChild(filaCtl);
        host.appendChild(panel);
        pintarMute();
        panel.hidden = true;

        // Micrófono de la barra de búsqueda (el que ya traía el diseño)
        const micBarra = document.getElementById('btn-voz-busqueda');
        if (micBarra) micBarra.addEventListener('click', (e) => { e.stopPropagation(); alTocarMicrofono(); });

        // Botones dentro del panel de ruta + lista de pasos escritos
        const cont = document.querySelector('#route-panel .instructions-text');
        if (cont && !document.getElementById('route-steps')) {
            const acciones = el('div', 'voz-acciones-ruta');
            const guiar = el('button', 'voz-ruta-btn', '🔊 Guiarme con voz'); guiar.type = 'button'; guiar.id = 'btn-voz-guiar';
            guiar.addEventListener('click', () => { modoVoz = true; iniciarGuia(); });
            const leer = el('button', 'voz-ruta-btn', '📢 Leer ruta'); leer.type = 'button'; leer.id = 'btn-voz-leer';
            leer.addEventListener('click', leerRutaCompleta);
            acciones.appendChild(guiar); acciones.appendChild(leer);
            const det = el('details', 'route-steps-box');
            det.appendChild(el('summary', '', 'Ver indicaciones paso a paso'));
            const ol = el('ol', 'route-steps'); ol.id = 'route-steps';
            det.appendChild(ol);
            cont.appendChild(acciones); cont.appendChild(det);
        }
    }

    function pintarMute() { if (btnMute) btnMute.textContent = debeHablarGuia() ? '🔊 Voz: sí' : '🔇 Voz: no'; }
    function alternarVoz() {
        const nuevo = !debeHablarGuia();
        modoVoz = nuevo; guardarPrefVoz(nuevo);
        if (!nuevo) callar();
        pintarMute();
        mostrarTexto(nuevo ? 'La guía hablará las indicaciones.' : 'La guía quedó en silencio (puedes leer las indicaciones en pantalla).');
    }

    let ocultar = null;
    function mostrarTexto(texto, estado) {
        if (!panel) return;
        panel.hidden = false;
        // Si la app ya habla el texto, el lector de pantalla no debe repetirlo encima (se oirían dos voces a la vez)
        panel.setAttribute('aria-live', (synth && debeHablarGuia()) ? 'off' : 'polite');
        if (estado !== undefined) lblEstado.textContent = estado || '';
        lblTexto.textContent = texto || '';
        filaCtl.hidden = !(guia && guia.activa);
        clearTimeout(ocultar);
        if (!(guia && guia.activa)) ocultar = setTimeout(() => { if (!ocupado && !(guia && guia.activa)) panel.hidden = true; }, 14000);
    }
    function setEstado(texto) {
        if (!panel) return;
        panel.hidden = false;
        lblEstado.textContent = texto || '';
        btnFab.classList.toggle('escuchando', /escuchando/i.test(texto || ''));
    }

    function pintarPasos() {
        const ol = document.getElementById('route-steps');
        if (!ol) return;
        ol.innerHTML = '';
        if (!ruta || !ruta.pasos.length) { ol.appendChild(el('li', '', 'Elige un destino para ver las indicaciones.')); return; }
        ruta.pasos.forEach((p, i) => {
            const li = el('li', '', p.texto);
            if (guia && guia.activa && i === guia.idx) { li.className = 'actual'; li.setAttribute('aria-current', 'step'); }
            ol.appendChild(li);
        });
    }

    // ---------- Micrófono ----------
    // Devuelve { texto, alternativas } o { error }
    function escuchar(ms) {
        return new Promise((resolve) => {
            if (!SR) return resolve({ error: 'no-soportado' });
            if (!window.isSecureContext) return resolve({ error: 'sin-https' });
            let r, hecho = false, t;
            const fin = (v) => {
                if (hecho) return; hecho = true; clearTimeout(t);
                try { r.stop(); } catch (e) {}
                reconocimiento = null; setEstado('');
                resolve(v);
            };
            try {
                r = new SR();
                r.lang = 'es-MX'; r.interimResults = false; r.maxAlternatives = 3; r.continuous = false;
                r.onresult = (e) => {
                    const alts = [];
                    for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
                    fin({ texto: alts[0], alternativas: alts });
                };
                r.onerror = (e) => fin({ error: e.error || 'error' });
                r.onend = () => fin({ error: 'no-speech' });
                t = setTimeout(() => fin({ error: 'no-speech' }), ms || 9000);
                reconocimiento = r;
                vibrar(40);
                r.start();
                setEstado('🎙️ Escuchando…');
            } catch (e) { fin({ error: 'no-iniciado' }); }
        });
    }

    function mensajeError(err) {
        switch (err) {
            case 'no-soportado': return 'Este navegador no permite reconocer la voz. Usa Chrome en Android o en computadora. Mientras tanto puedes escribir el destino en el buscador.';
            case 'sin-https': return 'Para usar el micrófono la página debe abrirse con conexión segura. Por ahora escribe el destino en el buscador.';
            case 'not-allowed': case 'service-not-allowed': return 'No tengo permiso para usar el micrófono. Actívalo en la configuración del navegador.';
            case 'network': return 'No pude reconocer la voz porque no hay internet.';
            case 'audio-capture': return 'No encuentro un micrófono.';
            case 'no-speech': return 'No te escuché.';
            default: return 'No pude escuchar. Intenta de nuevo.';
        }
    }
    const errorGrave = (err) => ['no-soportado', 'sin-https', 'not-allowed', 'service-not-allowed', 'audio-capture'].includes(err);

    // ---------- Dialogo: ¿a dónde quieres ir? ----------
    function alTocarMicrofono() {
        if (reconocimiento) { try { reconocimiento.stop(); } catch (e) {} return; }
        if (ocupado) { callar(); return; }
        if (guia && guia.activa) { escucharComandoGuia(); return; }
        dialogoDestino();
    }

    async function dialogoDestino() {
        if (ocupado) return;
        ocupado = true;
        const M = window.FMCMapa;
        try {
            if (!M) { await hablar('El mapa todavía está cargando.'); return; }
            if (!SR || !window.isSecureContext) {
                const m = mensajeError(!SR ? 'no-soportado' : 'sin-https');
                await hablar(m);
                if (M.abrirBusqueda) M.abrirBusqueda();
                return;
            }
            const origenP = M.obtenerOrigen().catch(() => null);
            await hablar('¿A dónde quieres ir? Puedes decir, por ejemplo, el consultorio, el edificio A o dónde hay un bebedero.');
            for (let intento = 0; intento < 3; intento++) {
                const r = await escuchar(9000);
                if (r.error) {
                    if (errorGrave(r.error)) { await hablar(mensajeError(r.error)); return; }
                    if (intento < 2) { await hablar(mensajeError(r.error) + ' Dime a dónde quieres ir.'); continue; }
                    await hablar('No logré escucharte. Toca el botón del micrófono cuando quieras intentar de nuevo.');
                    return;
                }
                mostrarTexto('Dijiste: “' + r.texto + '”', '');
                const origen = await origenP;
                const lugares = M.lugares();
                let res = { tipo: 'nada' };
                for (const alt of r.alternativas || [r.texto]) {   // prueba lo que el micrófono cree haber oído, de más a menos probable
                    res = G.interpretar(alt, lugares, origen);
                    if (res.tipo === 'destino' || res.tipo === 'varios') break;
                }
                if (res.tipo === 'varios') {
                    const lugar = await preguntarCual(res.candidatos);
                    if (lugar) { await irA(lugar, res.motivo); return; }
                    continue;
                }
                if (res.tipo === 'destino') { await irA(res.lugar, res.motivo); return; }
                if (/edificio/.test(G.limpiarDicho(r.texto))) { await hablar('Escuché edificio, pero no entendí la letra. Di por ejemplo: edificio be, edificio ce o edificio i.'); continue; }
                if (intento < 2) await hablar('No encontré ese lugar. Prueba con el nombre de un edificio, un servicio, o algo como “tengo sed”.');
                else await hablar('No encontré ese lugar. Puedes escribirlo en el buscador.');
            }
        } finally {
            ocupado = false; setEstado('');
        }
    }

    async function preguntarCual(cands) {
        const nombres = cands.map((c) => c.nombre);
        const lista = nombres.length === 2 ? nombres.join(' o ') : nombres.slice(0, -1).join(', ') + ' o ' + nombres[nombres.length - 1];
        await hablar('Encontré varios lugares: ' + lista + '. ¿Cuál quieres?');
        const r = await escuchar(8000);
        if (r.error) { await hablar(mensajeError(r.error)); return null; }
        mostrarTexto('Dijiste: “' + r.texto + '”', '');
        for (const alt of r.alternativas || [r.texto]) {
            const l = G.elegirEntre(alt, cands);
            if (l) return l;
        }
        await hablar('No entendí cuál. Intentemos de nuevo.');
        return null;
    }

    // Elige el destino, calcula la ruta y pregunta si empezamos
    async function irA(lugar, motivo) {
        modoVoz = true; pintarMute();
        const intro = motivo === 'cercano' ? 'El más cercano es ' + lugar.nombre + '.' : motivo === 'necesidad' ? 'Te llevo a ' + lugar.nombre + '.' : 'Muy bien, ' + lugar.nombre + '.';
        await hablar(intro + ' Calculando la ruta.', { interrumpir: true });
        const antes = ruta;
        await window.FMCMapa.seleccionarDestino(lugar);
        if (!ruta || ruta === antes || ruta.destino !== lugar) { await hablar('No pude calcular la ruta. Intenta de nuevo.'); return; }
        await hablar(ruta.resumen + ' Di “empezar” para comenzar, “repetir” para volver a escuchar, o “cancelar”.');
        for (let i = 0; i < 2; i++) {
            const r = await escuchar(8000);
            if (r.error) { if (errorGrave(r.error)) return; await hablar('Di “empezar” para comenzar o “cancelar”.'); continue; }
            mostrarTexto('Dijiste: “' + r.texto + '”', '');
            let c = null;
            for (const alt of r.alternativas || [r.texto]) { c = G.comando(alt); if (c) break; }
            if (c === 'empezar') { await iniciarGuia(); return; }
            if (c === 'repetir') { await hablar(ruta.resumen + ' Di “empezar” para comenzar.'); continue; }
            if (c === 'cancelar') { await hablar('Listo, cancelado. Toca el micrófono cuando necesites otra ruta.'); return; }
            await hablar('No entendí. Di “empezar” para comenzar o “cancelar”.');
        }
        await hablar('Cuando estés listo, toca el micrófono y di “empezar”, o usa el botón Guiarme con voz.');
    }

    function leerRutaCompleta() {
        if (!ruta) { hablar('Primero elige un destino.'); return; }
        const todo = ruta.resumen + ' ' + ruta.pasos.map((p, i) => 'Paso ' + (i + 1) + '. ' + p.texto).join(' ');
        hablar(todo);
    }

    // ---------- Guia durante el recorrido ----------
    function puntoASegmentoM(p, a, b) {
        // distancia aproximada (plano local) de un punto a un segmento, en metros
        const k = Math.cos(p.lat * Math.PI / 180) * 111320, kl = 110540;
        const px = (p.lng - a.lng) * k, py = (p.lat - a.lat) * kl;
        const bx = (b.lng - a.lng) * k, by = (b.lat - a.lat) * kl;
        const len2 = bx * bx + by * by;
        const t = len2 ? Math.max(0, Math.min(1, (px * bx + py * by) / len2)) : 0;
        return Math.hypot(px - t * bx, py - t * by);
    }
    function distanciaARuta(p) {
        return Math.min.apply(null, ruta.tramos.map((t) => puntoASegmentoM(p, t.a, t.b)));
    }

    function decirPasoActual() {
        if (!guia || !guia.activa) { if (ruta) hablar(ruta.resumen); return; }
        hablar(G.textoPaso(ruta.pasos[guia.idx], guia && guia.rumboReal));
    }

    function metrosRestantes(pos) {
        if (!guia || !guia.activa) return ruta ? ruta.metros : 0;
        const paso = ruta.pasos[guia.idx];
        let resto = pos ? G.distanciaM(pos, paso.fin) : paso.metros;
        for (let i = guia.idx + 1; i < ruta.pasos.length; i++) resto += ruta.pasos[i].metros;
        return resto;
    }

    async function iniciarGuia() {
        if (!ruta || !ruta.pasos.length) { await hablar('Primero elige un destino.'); return; }
        detenerGuia(null, true);
        guia = { activa: true, idx: 0, previoDicho: false, watchId: null, simId: null, manual: false, fuera: 0, ultRecalculo: 0, ultPos: null, avisoGPS: false, hablando: Promise.resolve() };
        // Marca "EMPEZAR" en el panel de ruta (sin que ese clic vuelva a iniciar la guía)
        if (window.FMCMapa && !window.FMCMapa.enNavegacion()) { ignorarEmpezar = true; window.FMCMapa.empezar(); ignorarEmpezar = false; }
        pintarPasos(); pintarMute();
        mostrarTexto(ruta.pasos[0].texto, '🧭 Guiando');
        if (debeHablarGuia()) await hablar('Empezamos. ' + ruta.pasos[0].texto);
        // Escaleras y rampas cerca del camino (pines de accesibilidad)
        const accTxt = window.FMCAcc ? window.FMCAcc.resumen() : '';
        if (accTxt && debeHablarGuia()) hablar(accTxt, { interrumpir: false });
        vibrar(120);

        if (DEMO) { simular(); return; }
        if (!navigator.geolocation) { pasarAManual('Este dispositivo no tiene ubicación.'); return; }
        guia.watchId = navigator.geolocation.watchPosition(
            (pos) => alRecibirPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
            (err) => { if (!guia || guia.manual) return; pasarAManual(err.code === 1 ? 'No tengo permiso para ver tu ubicación.' : 'No pude obtener tu ubicación.'); },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
        );
    }

    function pasarAManual(motivo) {
        if (!guia) return;
        if (guia.watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(guia.watchId);
        guia.watchId = null; guia.manual = true;
        const m = motivo + ' Te iré leyendo las indicaciones paso a paso: toca “Siguiente” o di “siguiente” cuando termines cada una.';
        if (debeHablarGuia()) hablar(m, { interrumpir: false }); else mostrarTexto(m, '🧭 Guiando (manual)');
    }

    function alRecibirPosicion(p) {
        if (!guia || !guia.activa || guia.manual) return;
        if (p.acc != null && p.acc > GPS_MAX_ERROR) {
            if (!guia.avisoGPS) { guia.avisoGPS = true; if (debeHablarGuia()) hablar('La señal de ubicación es débil. Si puedes, avanza a un lugar abierto.', { interrumpir: false }); }
            return;
        }
        // Fuera del campus: no tiene sentido seguirte con el GPS
        if (!DEMO && guia.ultPos === null && window.FMCMapa && !window.FMCMapa.dentroDelCampus(p.lat, p.lng)) {
            pasarAManual('No detecto tu ubicación dentro del campus.');
            return;
        }
        guia.ultPos = p;
        // Hacia donde camina de verdad la persona (por los ultimos puntos del GPS): sirve para decir izquierda/derecha bien
        guia.hist = (guia.hist || []).concat([p]).slice(-8);
        guia.rumboReal = null;
        for (let k = 0; k < guia.hist.length - 1; k++) {
            if (G.distanciaM(guia.hist[k], p) >= 8) { guia.rumboReal = G.rumbo(guia.hist[k], p); break; }
        }
        if (window.FMCMapa) window.FMCMapa.mostrarPosicion(p.lat, p.lng);
        const avisoAcc = window.FMCAcc ? window.FMCAcc.avisoCerca(p) : null;   // 'Adelante: escalera...' (una vez por elemento)
        if (avisoAcc && debeHablarGuia()) hablar(avisoAcc, { interrumpir: false });

        const ult = ruta.pasos.length - 1;
        const final = ruta.pasos[ult].fin;
        if (G.distanciaM(p, final) <= RADIO_LLEGADA) { llegar(); return; }

        // ¿Ya llegaste al final de este paso o de uno de los dos siguientes?
        for (let k = guia.idx; k <= Math.min(ult, guia.idx + 2); k++) {
            if (G.distanciaM(p, ruta.pasos[k].fin) <= RADIO_FIN) {
                if (k === ult) { llegar(); return; }
                guia.idx = k; avanzar(false); return;
            }
        }
        const paso = ruta.pasos[guia.idx];
        if (!guia.previoDicho && paso.metros >= 35 && G.distanciaM(p, paso.fin) <= RADIO_PREVIO) {   // en pasos cortos no hace falta avisar antes
            guia.previoDicho = true;
            const previo = G.textoPrevio(paso, guia.rumboReal);
            if (debeHablarGuia()) hablar(previo, { interrumpir: false });
            mostrarTexto(previo, '🧭 Guiando');
        }
        // ¿Te saliste del camino?
        if (distanciaARuta(p) > FUERA_RUTA) guia.fuera++; else guia.fuera = 0;
        if (guia.fuera >= 3 && Date.now() - guia.ultRecalculo > 25000) recalcular(p);
    }

    async function recalcular(p) {
        guia.ultRecalculo = Date.now(); guia.fuera = 0;
        if (debeHablarGuia()) hablar('Parece que te saliste de la ruta. Recalculando.');
        else mostrarTexto('Parece que te saliste de la ruta. Recalculando.', '🧭 Guiando');
        const g = guia;
        await window.FMCMapa.recalcular();
        if (guia !== g || !guia.activa) return;
        guia.idx = 0; guia.previoDicho = false;
        pintarPasos();
        if (debeHablarGuia()) await hablar(ruta.pasos[0].texto);
    }

    // Pasa al siguiente paso. manual = true cuando lo pidió la persona (botón o voz)
    function avanzar(manual) {
        if (!guia || !guia.activa) return;
        guia.idx++;
        guia.previoDicho = false;
        if (guia.idx >= ruta.pasos.length) { llegar(); return; }
        pintarPasos();
        const texto = G.textoPaso(ruta.pasos[guia.idx], guia.rumboReal);
        mostrarTexto(texto, '🧭 Guiando');
        if (debeHablarGuia()) hablar(texto);
        vibrar(150);
    }

    function llegar() {
        if (!guia || !guia.activa) return;
        const nombre = ruta && ruta.destino ? ruta.destino.nombre : 'tu destino';
        vibrar([300, 120, 300]);
        const aviso = 'Has llegado a ' + nombre + '.';
        detenerGuia(null, true);
        mostrarTexto(aviso, '✅ Llegaste');
        // Habla siempre al llegar si la guía era por voz
        const dicho = (modoVoz || prefVoz()) ? hablar(aviso) : Promise.resolve();
        dicho.then(() => { if (window.FMCMapa) window.FMCMapa.finalizar(); });
    }

    function detenerGuia(mensaje, silencioso) {
        if (guia) {
            if (guia.watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(guia.watchId);
            if (guia.simId) clearInterval(guia.simId);
            guia.activa = false;
        }
        guia = null;
        if (window.FMCMapa) window.FMCMapa.quitarPosicion();
        if (!silencioso) {
            callar();
            pintarPasos();
            if (filaCtl) filaCtl.hidden = true;
            if (mensaje) mostrarTexto(mensaje, '');
        }
    }

    async function escucharComandoGuia() {
        if (ocupado) return;
        ocupado = true;
        try {
            callar();
            const r = await escuchar(6000);
            if (r.error) { await hablar(mensajeError(r.error) + ' Puedes decir repetir, cuánto falta, siguiente o cancelar.'); return; }
            mostrarTexto('Dijiste: “' + r.texto + '”', '');
            let c = null;
            for (const alt of r.alternativas || [r.texto]) { c = G.comando(alt); if (c) break; }
            if (c === 'repetir') decirPasoActual();
            else if (c === 'faltante') { const m = Math.round(metrosRestantes(guia && guia.ultPos) / 5) * 5; await hablar('Faltan unos ' + Math.max(5, m) + ' metros.'); }
            else if (c === 'siguiente') avanzar(true);
            else if (c === 'cancelar') { detenerGuia(null, true); await hablar('Guía detenida.'); if (filaCtl) filaCtl.hidden = true; pintarPasos(); }
            else await hablar('No te entendí. Puedes decir repetir, cuánto falta, siguiente o cancelar.');
        } finally { ocupado = false; setEstado(''); }
    }

    // ---------- Modo demo: recorre la ruta solo, para probar sin salir a caminar ----------
    function simular() {
        const puntos = [ruta.tramos[0].a].concat(ruta.tramos.map((t) => t.b));
        let seg = 0, recorrido = 0;     // seg: tramo actual, recorrido: metros dentro del tramo
        const g = guia;
        g.simId = setInterval(() => {
            if (guia !== g || !g.activa) return clearInterval(g.simId);
            let avance = VEL_DEMO * 0.4;   // intervalo de 400 ms
            while (avance > 0 && seg < puntos.length - 1) {
                const a = puntos[seg], b = puntos[seg + 1];
                const largo = G.distanciaM(a, b) || 0.001;
                const falta = largo - recorrido;
                if (avance >= falta) { avance -= falta; seg++; recorrido = 0; } else { recorrido += avance; avance = 0; }
            }
            let pos;
            if (seg >= puntos.length - 1) pos = puntos[puntos.length - 1];
            else {
                const a = puntos[seg], b = puntos[seg + 1], f = recorrido / (G.distanciaM(a, b) || 0.001);
                pos = { lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f };
            }
            alRecibirPosicion({ lat: pos.lat, lng: pos.lng, acc: 5 });
        }, 400);
    }

    // ---------- Eventos del mapa ----------
    document.addEventListener('fmc:ruta', (e) => {
        ruta = e.detail;
        pintarPasos();
        // Si el destino cambia a mitad de camino (recalculo), no se detiene la guía
        // y el resumen se muestra escrito solo cuando la persona usa la voz (los demás ya ven el panel de ruta)
        if (!(guia && guia.activa) && !ocupado && debeHablarGuia()) mostrarTexto(ruta.resumen, '');
    });
    // Cambio de ruta a mitad de camino (boton OTRA RUTA): la guia sigue, pero con las indicaciones nuevas desde el principio
    document.addEventListener('fmc:rutacambiada', () => {
        if (!(guia && guia.activa)) return;
        guia.idx = 0; guia.previoDicho = false; guia.fuera = 0;
        pintarPasos();
        const t = ruta.pasos[0].texto;
        mostrarTexto(t, '🧭 Guiando');
        if (debeHablarGuia()) hablar('Nueva ruta. ' + t);
    });
    document.addEventListener('fmc:empezar', () => {
        if (ignorarEmpezar || (guia && guia.activa)) return;
        if (debeHablarGuia() && ruta) iniciarGuia();
    });
    document.addEventListener('fmc:finalizar', () => { if (guia && guia.activa) detenerGuia(null, true); if (filaCtl) filaCtl.hidden = true; });
    document.addEventListener('fmc:limpiar', () => {
        ruta = null; modoVoz = false; pintarMute();
        if (guia && guia.activa) detenerGuia(null, true);
        pintarPasos();
        if (panel && !ocupado) panel.hidden = true;
    });

    // Atajo de teclado en computadora: la tecla "v" abre el micrófono (si no se está escribiendo)
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test((e.target.tagName || ''))) {
            alTocarMicrofono();
        }
    });

    crearUI();
    pintarPasos();

    // Para pruebas desde la consola / las pruebas automáticas
    window.FMCVoz = { hablar, escuchar, iniciarGuia, detenerGuia, alRecibirPosicion, avanzar, _estado: () => ({ ruta, guia, modoVoz }) };
})();
