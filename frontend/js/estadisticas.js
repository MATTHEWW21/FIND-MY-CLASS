// Panel de estadísticas (solo administrador). Pide /api/estadisticas con la llave en x-admin-key.
(function () {
    const $ = (id) => document.getElementById(id);
    const CLAVE = 'statsKey';
    let temporizador = null;

    // sessionStorage puede fallar (ventana privada): se usa una variable de respaldo
    let respaldo = '';
    const leerLlave = () => { try { return sessionStorage.getItem(CLAVE) || respaldo; } catch (e) { return respaldo; } };
    const guardarLlave = (v) => { respaldo = v; try { v ? sessionStorage.setItem(CLAVE, v) : sessionStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ } };

    const ETIQUETAS = {
        estudiante: 'Estudiantes', colaborador: 'Colaboradores', visitante: 'Visitantes',
        caminata: 'Caminata', carrera: 'Carrera', ciclismo: 'Bicicleta', scooter: 'Scooter', inclusivo: 'Inclusiva',
        tracker: 'Rastreador', mapa: 'Desde el mapa',
        camino: 'Camino', bache: 'Bache', escalera: 'Escalera', iluminacion: 'Iluminación', mobiliario: 'Mobiliario', limpieza: 'Limpieza', otro: 'Otro',
        lesion: 'Lesión', mareo: 'Mareo', desorientacion: 'Desorientación', medica: 'Médica', seguridad: 'Seguridad', vehicular: 'Vehicular', ansiedad: 'Ansiedad',
    };
    const etiqueta = (k) => ETIQUETAS[k] || k;
    const fmt = (n) => Number(n || 0).toLocaleString('es-MX');

    function el(tag, props, hijos) {
        const e = document.createElement(tag);
        Object.assign(e, props || {});
        (hijos || []).forEach((h) => e.appendChild(typeof h === 'string' ? document.createTextNode(h) : h));
        return e;
    }

    function barras(contenedor, filas) {
        contenedor.textContent = '';
        if (!filas || !filas.length) { contenedor.appendChild(el('p', { className: 'vacio', textContent: 'Todavía no hay datos.' })); return; }
        const max = Math.max(...filas.map((f) => f.n), 1);
        filas.forEach((f) => {
            const relleno = el('div', { className: 'relleno' });
            relleno.style.width = Math.max(f.n ? 3 : 0, Math.round((f.n / max) * 100)) + '%';
            contenedor.appendChild(el('div', { className: 'barra' }, [
                el('span', { textContent: f.etiqueta || etiqueta(f.nombre) }),
                el('div', { className: 'pista' }, [relleno]),
                el('span', { className: 'n', textContent: fmt(f.n) }),
            ]));
        });
    }

    // Gráfica de columnas de 30 días en SVG (sin librerías)
    function serie(contenedor, datos) {
        contenedor.textContent = '';
        const total = datos.reduce((s, d) => s + d.n, 0);
        const max = Math.max(...datos.map((d) => d.n), 1);
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'serie');
        svg.setAttribute('viewBox', '0 0 300 120');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `${fmt(total)} en los últimos 30 días`);
        const ancho = 300 / datos.length;
        datos.forEach((d, i) => {
            const h = d.n ? Math.max(3, (d.n / max) * 108) : 1;
            const r = document.createElementNS(NS, 'rect');
            r.setAttribute('x', String(i * ancho + 1));
            r.setAttribute('y', String(116 - h));
            r.setAttribute('width', String(ancho - 2));
            r.setAttribute('height', String(h));
            r.setAttribute('rx', '1.5');
            r.setAttribute('fill', d.n ? '#ED7F3C' : '#eadfd4');
            const t = document.createElementNS(NS, 'title');
            t.textContent = `${d.dia}: ${d.n}`;
            r.appendChild(t);
            svg.appendChild(r);
        });
        contenedor.appendChild(svg);
        contenedor.appendChild(el('p', { className: 'vacio', textContent: `Total en 30 días: ${fmt(total)} · día más alto: ${fmt(max === 1 && !total ? 0 : max)}` }));
    }

    function kpi(valor, texto, destacado) {
        return el('div', { className: 'kpi' + (destacado ? ' destacado' : '') }, [el('b', { textContent: valor }), el('span', { textContent: texto })]);
    }

    function pintar(d) {
        const k = $('kpis');
        k.textContent = '';
        [
            kpi(fmt(d.usuarios.total), 'personas registradas', true),
            kpi(fmt(d.usuarios.nuevos_7d), 'registros en 7 días'),
            kpi(fmt(d.usuarios.vista_simplificada), 'usan la vista simplificada'),
            kpi(fmt(d.actividades.total), 'actividades registradas', true),
            kpi(fmt(d.actividades.km), 'km recorridos en total'),
            kpi(fmt(d.actividades.personas), 'personas con actividad'),
            kpi(fmt(d.comunidad.publicaciones), 'publicaciones en el feed'),
            kpi(fmt(d.comunidad.likes + d.comunidad.comentarios), 'me gusta y comentarios'),
            kpi(fmt(d.incidencias.total), 'problemas reportados'),
            kpi(d.calificaciones.promedio === null ? '—' : d.calificaciones.promedio.toFixed(1) + ' ★', `calificación promedio (${fmt(d.calificaciones.total)})`),
            kpi(fmt(d.sos.total), 'alertas SOS'),
            kpi(fmt(d.mapa.edificios), 'edificios en el mapa'),
        ].forEach((x) => k.appendChild(x));

        serie($('serie-usuarios'), d.usuarios.por_dia);
        serie($('serie-actividades'), d.actividades.por_dia);
        barras($('b-roles'), d.usuarios.por_rol);
        barras($('b-tipos'), d.actividades.por_tipo);
        barras($('b-origen'), d.actividades.por_origen);
        barras($('b-incidencias'), d.incidencias.por_categoria);
        barras($('b-sos'), d.sos.por_tipo);
        barras($('b-mapa'), [
            { etiqueta: 'Puntos', n: d.mapa.puntos },
            { etiqueta: 'Tramos', n: d.mapa.tramos },
            { etiqueta: 'Escaleras', n: d.mapa.escaleras },
            { etiqueta: 'Rampas', n: d.mapa.rampas },
            { etiqueta: 'Aulas', n: d.mapa.aulas },
        ]);
        $('pie').textContent = 'Actualizado: ' + new Date(d.generado_en).toLocaleString('es-MX') + ' · Las gráficas son cifras agregadas; solo la lista de reportes muestra nombres.';
    }

    const MOTIVOS = { acoso: 'Acoso o conducta ofensiva', spam: 'Spam', suplantacion: 'Suplantación', inapropiado: 'Contenido inapropiado', otro: 'Otro' };

    function pintarReportes(lista) {
        const ul = $('lista-reportes');
        ul.textContent = '';
        $('reportes-vacio').hidden = lista.length > 0;
        $('reportes-vacio').textContent = 'No hay reportes de personas.';
        lista.forEach((r) => {
            const abierto = r.estado === 'abierto';
            const li = el('li', {}, [
                el('span', { className: 'quien', textContent: `${r.reportado.nombre} (id ${r.reportado.id}) · ${r.reportado.reportes_en_total} reporte(s) en total` }),
                el('span', {}, [
                    el('span', { className: 'estado' + (abierto ? '' : ' ok'), textContent: abierto ? 'Abierto' : 'Revisado' }),
                    ' ' + (MOTIVOS[r.motivo] || r.motivo),
                ]),
                el('span', { textContent: r.comentario ? '“' + r.comentario + '”' : 'Sin comentario' }),
                el('span', { className: 'meta', textContent: `Lo reportó ${r.reportante.nombre} · ${new Date(r.creado_en).toLocaleString('es-MX')}` }),
            ]);
            if (abierto) {
                const b = el('button', { type: 'button', className: 'sec', textContent: 'Marcar como revisado' });
                b.setAttribute('aria-label', 'Marcar como revisado el reporte contra ' + r.reportado.nombre);
                b.addEventListener('click', async () => {
                    b.disabled = true;
                    try {
                        const x = await fetch('/api/estadisticas/reportes/' + r.id + '/revisado', { method: 'POST', headers: { 'x-admin-key': leerLlave() } });
                        if (!x.ok) throw new Error();
                        cargarReportes();
                    } catch (e) { b.disabled = false; $('error').textContent = 'No se pudo marcar el reporte.'; }
                });
                li.appendChild(b);
            }
            ul.appendChild(li);
        });
    }
    async function cargarReportes() {
        try {
            const r = await fetch('/api/estadisticas/reportes', { headers: { 'x-admin-key': leerLlave() } });
            if (!r.ok) throw new Error();
            pintarReportes(await r.json());
        } catch (e) { $('reportes-vacio').hidden = false; $('reportes-vacio').textContent = 'No se pudieron cargar los reportes (¿falta correr la migración 018?).'; }
    }

    function salir() {
        guardarLlave('');
        clearInterval(temporizador); temporizador = null;
        $('auto').checked = false;
        $('panel').hidden = true; $('acciones').hidden = true; $('acceso').hidden = false;
    }

    async function cargar() {
        const llave = leerLlave();
        if (!llave) return salir();
        let r;
        try {
            r = await fetch('/api/estadisticas', { headers: { 'x-admin-key': llave } });
        } catch (e) {
            $('error').textContent = 'No se pudo conectar con el servidor.';
            return;
        }
        if (r.status === 403) { salir(); $('error').textContent = 'Llave incorrecta.'; return; }
        if (r.status === 429) { $('error').textContent = 'Demasiados intentos, espera unos minutos.'; return; }
        if (!r.ok) { $('error').textContent = 'El servidor respondió con un error (' + r.status + ').'; return; }
        const datos = await r.json();
        $('error').textContent = '';
        $('acceso').hidden = true; $('panel').hidden = false; $('acciones').hidden = false;
        pintar(datos);
        cargarReportes();
    }

    $('form-acceso').addEventListener('submit', (e) => {
        e.preventDefault();
        guardarLlave($('llave').value.trim());
        $('llave').value = '';
        cargar();
    });
    $('btn-actualizar').addEventListener('click', cargar);
    $('btn-salir').addEventListener('click', salir);
    $('auto').addEventListener('change', (e) => {
        clearInterval(temporizador); temporizador = null;
        if (e.target.checked) temporizador = setInterval(cargar, 30000);
    });

    if (leerLlave()) cargar();
})();
