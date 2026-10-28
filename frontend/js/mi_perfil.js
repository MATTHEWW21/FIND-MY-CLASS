document.addEventListener('DOMContentLoaded', async () => {
    if (!requerirSesion()) return;

    const $ = (id) => document.getElementById(id);
    const rol = localStorage.getItem('userRole');

    // El visitante no tiene perfil
    if (rol !== 'estudiante' && rol !== 'colaborador') {
        window.location.href = 'mapa.html';
        return;
    }

    const ACT = FMCActividades.ACTIVIDADES;
    const fondo = $('ajustes-fondo');
    const mensaje = $('ajustes-mensaje');
    const chkAcc = $('ajuste-accesible');
    const chkVista = $('ajuste-vista');
    let usuario = null;

    function avisar(texto, esError) {
        mensaje.textContent = texto || '';
        mensaje.classList.toggle('error', !!esError);
    }

    function pintarUsuario(u) {
        usuario = u;
        const nombre = [u.nombre, u.apellido].filter(Boolean).join(' ');
        $('perfil-nombre').textContent = nombre;
        $('ajustes-nombre').textContent = nombre;
        $('ajustes-correo').textContent = u.correo || '';
        chkAcc.checked = !!u.necesita_rutas_accesibles;
        chkVista.checked = u.vista_preferida === 'simplificada';
        $('contacto-nombre').value = u.contacto_emergencia_nombre || '';
        $('contacto-telefono').value = u.contacto_emergencia_telefono || '';
    }

    // La vista simplificada solo existe para colaboradores
    if (rol !== 'colaborador') $('fila-vista').classList.add('hidden');

    // =================== datos reales del perfil ===================
    const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const fmtDist = (m) => (m < 1000 ? `${m} M` : `${(m / 1000).toFixed(2)} KM`);
    function fmtDia(dia, hoy, ayer) {
        if (dia === hoy) return 'HOY';
        if (dia === ayer) return 'AYER';
        const [y, m, d] = dia.split('-').map(Number);
        return `${d} ${MESES[m - 1]} ${y}`;
    }
    const vacio = (texto) => Object.assign(document.createElement('p'), { className: 'perfil-vacio', textContent: texto });

    let resumen = null, verTodas = false;
    function pintarActividades() {
        const cont = $('lista-actividades');
        cont.replaceChildren();
        const lista = resumen.recientes;
        if (!lista.length) {
            cont.appendChild(vacio('Aún no registras actividades. Ve a INICIAR RUTA para empezar.'));
            $('btn-mas-actividades').classList.add('hidden');
            return;
        }
        (verTodas ? lista : lista.slice(0, 3)).forEach((a) => {
            const fila = document.createElement('div');
            fila.className = 'activity-history-item';
            const izq = document.createElement('div');
            izq.className = 'activity-icon-type';
            const circ = document.createElement('span');
            circ.className = 'act-circulo';
            circ.style.background = (ACT[a.tipo] || ACT.caminata).color;
            circ.innerHTML = FMCActividades.icono(a.tipo, 18);
            const val = document.createElement('span');
            val.className = 'activity-value';
            val.textContent = fmtDist(a.distancia_m);
            izq.append(circ, val);
            const fecha = document.createElement('span');
            fecha.className = 'activity-date';
            fecha.textContent = fmtDia(a.dia, resumen.hoy, resumen.ayer);
            fila.append(izq, fecha);
            cont.appendChild(fila);
        });
        $('btn-mas-actividades').classList.toggle('hidden', lista.length <= 3);
    }
    $('btn-mas-actividades').addEventListener('click', () => { verTodas = !verTodas; pintarActividades(); });

    function pintarPremios() {
        const grid = $('premios-grid');
        grid.replaceChildren();
        resumen.premios.forEach((p) => {
            const card = document.createElement('div');
            card.className = 'milestone-card';
            card.title = p.descripcion;
            const tag = document.createElement('span');
            tag.className = 'milestone-tag';
            tag.textContent = p.nombre.toUpperCase();
            const circ = document.createElement('div');
            circ.className = `badge-circle badge-${p.color}` + (p.obtenido ? '' : ' bloqueado');
            const ico = document.createElement('span');
            ico.className = 'badge-icon';
            ico.textContent = p.icono;
            circ.appendChild(ico);
            card.append(tag, circ);
            if (!p.obtenido) {
                const prog = document.createElement('span');
                prog.className = 'milestone-progreso';
                prog.textContent = p.progreso;
                card.appendChild(prog);
            }
            grid.appendChild(card);
        });
    }

    function pintarMotivacion() {
        const ul = $('motivacion-lista');
        ul.replaceChildren();
        const lineas = ['¿5 MINUTOS? ESO YA CUENTA 🏋️'];
        lineas.push(resumen.dias_activo > 0
            ? `LLEVAS ${resumen.dias_activo} ${resumen.dias_activo === 1 ? 'DÍA' : 'DÍAS'} ACTIVO 🔥 ¡NO ROMPAS TU RACHA!`
            : 'HOY ES UN BUEN DÍA PARA EMPEZAR UNA RACHA 🔥');
        const obtenidos = resumen.premios.filter((p) => p.obtenido);
        lineas.push(obtenidos.length
            ? `TIENES ${obtenidos.length} ${obtenidos.length === 1 ? 'INSIGNIA' : 'INSIGNIAS'} 🎖️ ¡BIEN HECHO!`
            : 'REGISTRA TU PRIMERA ACTIVIDAD Y DESBLOQUEA UNA INSIGNIA 🎖️');
        lineas.push('NO ES SOLO EJERCICIO, ES CUIDAR DE TI Y DEL PLANETA');
        lineas.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    }

    async function cargarResumen() {
        try {
            resumen = await apiFetch('/actividades/resumen');
            $('racha-semanas').textContent = resumen.racha_semanas;
            $('racha-actividades').textContent = resumen.total_actividades;
            pintarActividades(); pintarPremios(); pintarMotivacion();
        } catch (err) {
            console.error('No se pudo cargar el resumen:', err);
            $('lista-actividades').replaceChildren(vacio('No se pudieron cargar tus actividades.'));
        }
    }

    async function cargarAmigos() {
        const cont = $('lista-amigos-perfil');
        try {
            const data = await apiFetch('/amigos');
            cont.replaceChildren();
            const colores = ['#B04E0E', '#2b73d9', '#237a3a', '#7b3294', '#b8512f', '#3d7a8a', '#a8567a'];
            data.amigos.slice(0, 3).forEach((a) => {
                const d = document.createElement('div');
                d.className = 'friend-avatar';
                d.style.background = colores[a.id % colores.length];
                d.textContent = ((a.nombre || '?')[0] + ((a.apellido || '')[0] || '')).toUpperCase();
                d.title = [a.nombre, a.apellido].filter(Boolean).join(' ');
                cont.appendChild(d);
            });
            if (!data.amigos.length) {
                cont.appendChild(Object.assign(document.createElement('span'), { className: 'friend-mas', textContent: 'Agrega amigos' }));
            } else if (data.amigos.length > 3) {
                cont.appendChild(Object.assign(document.createElement('span'), { className: 'friend-mas', textContent: `+${data.amigos.length - 3} más` }));
            }
        } catch (err) { console.error('No se pudieron cargar los amigos:', err); }
    }

    // =================== usuario, ajustes ===================
    try {
        const data = await apiFetch('/auth/me');
        guardarSesion(localStorage.getItem('token'), data.usuario);
        pintarUsuario(data.usuario);
    } catch (err) {
        console.error('No se pudo cargar el perfil:', err);
    }
    cargarResumen();
    if (rol === 'estudiante' || usuario && usuario.vista_preferida !== 'simplificada') cargarAmigos();
    else $('amigos-perfil').classList.add('hidden');

    // ----- abrir / cerrar -----
    // ----- personas bloqueadas y silenciadas (para poder deshacerlo) -----
    async function cargarModeracion() {
        const caja = $('ajustes-moderacion');
        try {
            const data = await apiFetch('/moderacion/lista');
            const ul = $('lista-moderacion');
            ul.replaceChildren();
            const filas = [
                ...data.bloqueados.map((p) => ({ p, tipo: 'bloqueado' })),
                ...data.silenciados.map((p) => ({ p, tipo: 'silenciado' })),
            ];
            $('moderacion-vacio').classList.toggle('hidden', filas.length > 0);
            filas.forEach(({ p, tipo }) => {
                const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ');
                const li = document.createElement('li');
                const txt = document.createElement('span');
                txt.textContent = nombre;
                const etiqueta = document.createElement('small');
                etiqueta.textContent = tipo === 'bloqueado' ? 'Bloqueada' : 'Silenciada';
                txt.appendChild(etiqueta);
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = tipo === 'bloqueado' ? 'Desbloquear' : 'Dejar de silenciar';
                b.setAttribute('aria-label', (tipo === 'bloqueado' ? 'Desbloquear a ' : 'Dejar de silenciar a ') + nombre);
                b.addEventListener('click', async () => {
                    b.disabled = true;
                    try {
                        await apiFetch('/moderacion/' + (tipo === 'bloqueado' ? 'bloquear/' : 'silenciar/') + p.id, { method: 'DELETE' });
                        avisar(tipo === 'bloqueado' ? 'Desbloqueaste a ' + nombre : 'Ya verás de nuevo a ' + nombre);
                        cargarModeracion();
                    } catch (err) { b.disabled = false; avisar(err.message, true); }
                });
                li.append(txt, b);
                ul.appendChild(li);
            });
            caja.classList.remove('hidden');
        } catch (err) {
            caja.classList.add('hidden');    // vista sin amigos/feed: no aplica
        }
    }

    $('btn-ajustes').addEventListener('click', () => { avisar(''); fondo.classList.remove('hidden'); cargarModeracion(); });
    $('ajustes-cerrar').addEventListener('click', () => fondo.classList.add('hidden'));
    fondo.addEventListener('click', (e) => { if (e.target === fondo) fondo.classList.add('hidden'); });

    // ----- rutas accesibles y vista: se guardan al instante -----
    async function guardarAjuste(cambio, input, anterior) {
        avisar('');
        input.disabled = true;
        try {
            const data = await apiFetch('/auth/me', { method: 'PATCH', body: cambio });
            guardarSesion(localStorage.getItem('token'), data.usuario);
            pintarUsuario(data.usuario);
            avisar('Guardado');
        } catch (err) {
            input.checked = anterior;
            avisar(err.message, true);
        } finally {
            input.disabled = false;
        }
    }
    chkAcc.addEventListener('change', () =>
        guardarAjuste({ necesita_rutas_accesibles: chkAcc.checked }, chkAcc, !chkAcc.checked));
    chkVista.addEventListener('change', () =>
        guardarAjuste({ vista_preferida: chkVista.checked ? 'simplificada' : 'completa' }, chkVista, !chkVista.checked));

    // ----- contacto de emergencia (botón SOS) -----
    $('btn-guardar-contacto').addEventListener('click', async () => {
        avisar('');
        const btn = $('btn-guardar-contacto');
        btn.disabled = true;
        try {
            const body = { contacto_emergencia_nombre: $('contacto-nombre').value.trim(), contacto_emergencia_telefono: $('contacto-telefono').value.trim() };
            const data = await apiFetch('/auth/me', { method: 'PATCH', body });
            guardarSesion(localStorage.getItem('token'), data.usuario);
            pintarUsuario(data.usuario);
            avisar(data.usuario.contacto_emergencia_telefono ? 'Contacto guardado' : 'Contacto eliminado');
        } catch (err) { avisar(err.message, true); }
        finally { btn.disabled = false; }
    });

    // ----- cambiar contraseña -----
    const form = $('form-password');
    $('btn-abrir-password').addEventListener('click', () => { form.classList.toggle('hidden'); avisar(''); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        avisar('');
        const actual = $('pw-actual').value, nueva = $('pw-nueva').value, confirma = $('pw-confirma').value;
        if (nueva !== confirma) { avisar('Las contraseñas nuevas no coinciden', true); return; }
        const btn = $('btn-guardar-password');
        btn.disabled = true;
        try {
            await apiFetch('/auth/me/password', { method: 'POST', body: { actual, nueva } });
            form.reset();
            form.classList.add('hidden');
            avisar('Contraseña actualizada');
        } catch (err) {
            avisar(err.message, true);
        } finally {
            btn.disabled = false;
        }
    });

    // ----- cerrar sesión -----
    $('btn-cerrar-sesion').addEventListener('click', async () => {
        if (await FMCAviso.confirmar('¿Cerrar sesión?', { si: 'Cerrar sesión', no: 'Quedarme' })) cerrarSesion();
    });
});