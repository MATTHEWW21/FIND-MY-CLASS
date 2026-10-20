// mensajes.js - chat uno a uno con amigos. Se actualiza solo cada pocos segundos (sin sockets).
document.addEventListener('DOMContentLoaded', () => {
    if (!requerirSesion()) return;

    const $ = (id) => document.getElementById(id);
    const rol = localStorage.getItem('userRole');
    if (rol !== 'estudiante' && rol !== 'colaborador') { window.location.href = 'mapa.html'; return; }

    const INTERVALO_MS = 4000;     // cada cuanto se pregunta si hay mensajes nuevos
    const LADO_MAX = 1080;         // las fotos se reducen antes de enviarlas

    let amigos = [];               // [{ id, nombre, apellido, sin_leer, ultimo }]
    let actual = null;             // amigo con el chat abierto
    let ultimoId = 0;              // id del ultimo mensaje pintado
    let fotoPendiente = null;      // data URL de la foto por enviar
    let enviando = false;
    let cargandoChat = 0;          // evita mezclar respuestas si se cambia rapido de chat

    // ---------- utilidades ----------
    const iniciales = (a) => ((a.nombre || '?')[0] + ((a.apellido || '')[0] || '')).toUpperCase();
    const nombreCorto = (a) => [a.nombre, (a.apellido || '').split(' ')[0]].filter(Boolean).join(' ');
    const nombreCompleto = (a) => [a.nombre, a.apellido].filter(Boolean).join(' ');
    function colorDe(id) {
        const colores = ['#d96828', '#2b73d9', '#2e8b46', '#7b3294', '#b8512f', '#3d7a8a', '#a8567a'];
        return colores[id % colores.length];
    }
    function avatar(a, clase) {
        const d = document.createElement('div');
        d.className = clase || 'avatar-iniciales';
        d.style.background = colorDe(a.id);
        d.textContent = iniciales(a);
        return d;
    }
    function hora(iso) {
        const f = new Date(iso);
        const hm = f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const hoy = new Date();
        return f.toDateString() === hoy.toDateString() ? hm : `${f.getDate()}/${f.getMonth() + 1} ${hm}`;
    }

    // ---------- carrusel de amigos ----------
    function pintarCarrusel() {
        const filtro = $('buscar-amigos').value.trim().toLowerCase();
        const cont = $('carrusel');
        Array.from(cont.querySelectorAll('.story-item[data-id]')).forEach((n) => n.remove());
        amigos
            .filter((a) => !filtro || nombreCompleto(a).toLowerCase().includes(filtro))
            .forEach((a) => {
                const item = document.createElement('div');
                item.className = 'story-item' + (actual && actual.id === a.id ? ' active' : '');
                item.dataset.id = a.id;
                item.appendChild(avatar(a));
                if (a.sin_leer > 0 && !(actual && actual.id === a.id)) {
                    const b = document.createElement('span');
                    b.className = 'story-badge';
                    b.textContent = a.sin_leer > 9 ? '9+' : String(a.sin_leer);
                    item.appendChild(b);
                }
                const n = document.createElement('span');
                n.className = 'story-name';
                n.textContent = nombreCorto(a);
                item.appendChild(n);
                item.addEventListener('click', () => abrirChat(a));
                cont.appendChild(item);
            });
    }

    async function refrescarLista() {
        try {
            const data = await apiFetch('/mensajes/conversaciones');
            amigos = data.amigos;
            const b = $('badge-solicitudes');
            b.textContent = data.solicitudes_pendientes > 9 ? '9+' : String(data.solicitudes_pendientes);
            b.classList.toggle('hidden', !data.solicitudes_pendientes);
            if (actual) {
                const a = amigos.find((x) => x.id === actual.id);
                if (a) a.sin_leer = 0; // el chat abierto ya se esta leyendo
                else cerrarChat();     // dejaron de ser amigos
            }
            pintarCarrusel();
            const vacio = $('chat-vacio');
            if (!actual && vacio) {
                vacio.textContent = amigos.length
                    ? 'Elige un amigo para empezar a chatear.'
                    : 'Aún no tienes amigos en la app. Toca el + para buscar personas.';
            }
        } catch (err) {
            console.error('No se pudo actualizar la lista de chats:', err);
        }
    }

    // ---------- chat abierto ----------
    function burbuja(m) {
        const b = document.createElement('div');
        b.className = 'message-bubble ' + (m.mio ? 'sent' : 'received');
        b.dataset.id = m.id;
        b.dataset.mio = m.mio ? '1' : '0';
        if (m.foto) {
            const img = document.createElement('img');
            img.className = 'msg-foto';
            img.alt = 'Foto';
            img.loading = 'lazy';
            img.src = '/uploads/mensajes/' + encodeURIComponent(m.foto);
            img.addEventListener('click', () => window.open(img.src, '_blank', 'noopener'));
            b.appendChild(img);
        }
        if (m.texto) {
            const p = document.createElement('p');
            p.textContent = m.texto; // textContent: nunca se interpreta como HTML
            b.appendChild(p);
        }
        const t = document.createElement('span');
        t.className = 'msg-time';
        t.textContent = hora(m.creado_en) + (m.mio ? (m.leido ? ' ✓✓' : ' ✓') : '');
        b.appendChild(t);
        return b;
    }

    function marcarLeidos(hasta) {
        $('chat-messages').querySelectorAll('.message-bubble[data-mio="1"]').forEach((b) => {
            const t = b.querySelector('.msg-time');
            if (Number(b.dataset.id) <= hasta && t && !t.textContent.endsWith('✓✓')) t.textContent = t.textContent.replace(/ ✓$/, '') + ' ✓✓';
        });
    }

    function agregarMensajes(lista, forzarBajar) {
        const area = $('chat-messages');
        const alFinal = area.scrollHeight - area.scrollTop - area.clientHeight < 80;
        lista.forEach((m) => {
            if (m.id <= ultimoId) return;
            area.appendChild(burbuja(m));
            ultimoId = m.id;
        });
        if (lista.length && (forzarBajar || alFinal)) area.scrollTop = area.scrollHeight;
    }

    async function abrirChat(a) {
        actual = a;
        ultimoId = 0;
        const miCarga = ++cargandoChat;
        a.sin_leer = 0;
        $('chat-messages').replaceChildren();
        $('chat-header').classList.remove('hidden');
        $('chat-input-bar').classList.remove('hidden');
        $('chat-nombre').textContent = nombreCompleto(a);
        $('chat-avatar').replaceWith(Object.assign(avatar(a, 'avatar-iniciales'), { id: 'chat-avatar' }));
        pintarCarrusel();
        try {
            const data = await apiFetch('/mensajes/con/' + a.id);
            if (miCarga !== cargandoChat) return;
            if (!data.mensajes.length) {
                const v = document.createElement('p');
                v.className = 'chat-vacio';
                v.id = 'chat-vacio';
                v.textContent = 'Aún no hay mensajes. ¡Saluda a ' + a.nombre + '!';
                $('chat-messages').appendChild(v);
            }
            agregarMensajes(data.mensajes, true);
            marcarLeidos(data.leidos_hasta);
        } catch (err) {
            if (miCarga === cargandoChat) alert(err.message);
        }
    }

    function cerrarChat() {
        actual = null;
        cargandoChat++;
        $('chat-header').classList.add('hidden');
        $('chat-input-bar').classList.add('hidden');
        const area = $('chat-messages');
        area.replaceChildren();
        const v = document.createElement('p');
        v.className = 'chat-vacio';
        v.id = 'chat-vacio';
        v.textContent = 'Elige un amigo para empezar a chatear.';
        area.appendChild(v);
    }

    async function refrescarChat() {
        if (!actual || enviando) return;
        const miCarga = cargandoChat;
        try {
            const data = await apiFetch('/mensajes/con/' + actual.id + '?despues=' + ultimoId);
            if (miCarga !== cargandoChat) return;
            if (data.mensajes.length) {
                const vacio = $('chat-messages').querySelector('.chat-vacio');
                if (vacio) vacio.remove();
            }
            agregarMensajes(data.mensajes, false);
            marcarLeidos(data.leidos_hasta);
        } catch (err) {
            console.error('No se pudo actualizar el chat:', err);
        }
    }

    // ---------- enviar ----------
    function reducir(archivo) {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();
            lector.onerror = () => reject(new Error('No se pudo leer la foto'));
            lector.onload = () => {
                const img = new Image();
                img.onerror = () => reject(new Error('Ese archivo no se pudo abrir como foto'));
                img.onload = () => {
                    const escala = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
                    const c = document.createElement('canvas');
                    c.width = Math.round(img.width * escala); c.height = Math.round(img.height * escala);
                    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                    resolve(c.toDataURL('image/jpeg', 0.8));
                };
                img.src = lector.result;
            };
            lector.readAsDataURL(archivo);
        });
    }

    function quitarFoto() {
        fotoPendiente = null;
        $('foto-previa').classList.add('hidden');
        $('foto-previa-img').removeAttribute('src');
    }

    $('btn-adjuntar').addEventListener('click', () => $('input-foto').click());
    $('foto-quitar').addEventListener('click', quitarFoto);
    $('input-foto').addEventListener('change', async (e) => {
        const archivo = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!archivo) return;
        if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) { alert('Solo se pueden enviar fotos JPG, PNG o WebP.'); return; }
        try {
            fotoPendiente = await reducir(archivo);
            $('foto-previa-img').src = fotoPendiente;
            $('foto-previa').classList.remove('hidden');
        } catch (err) { alert(err.message); }
    });

    async function enviar() {
        if (!actual || enviando) return;
        const campo = $('chat-input-field');
        const texto = campo.value.trim();
        if (!texto && !fotoPendiente) return;
        enviando = true;
        $('btn-send-msg').disabled = true;
        const para = actual;
        try {
            const m = await apiFetch('/mensajes/con/' + para.id, { method: 'POST', body: { texto, foto: fotoPendiente } });
            campo.value = '';
            quitarFoto();
            if (actual && actual.id === para.id) {
                const vacio = $('chat-messages').querySelector('.chat-vacio');
                if (vacio) vacio.remove();
                agregarMensajes([m], true);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            enviando = false;
            $('btn-send-msg').disabled = false;
            campo.focus();
        }
    }
    $('btn-send-msg').addEventListener('click', enviar);
    $('chat-input-field').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
    });
    $('buscar-amigos').addEventListener('input', pintarCarrusel);

    // ---------- hoja de amigos ----------
    const fondo = $('amigos-fondo');
    let temporizadorBusqueda = null;

    function avisarAmigos(texto, esError) {
        const m = $('amigos-mensaje');
        m.textContent = texto || '';
        m.classList.toggle('error', !!esError);
    }
    function fila(persona, botones, textoEstado) {
        const f = document.createElement('div');
        f.className = 'amigo-fila';
        f.appendChild(avatar(persona));
        const n = document.createElement('span');
        n.className = 'nombre';
        n.textContent = nombreCompleto(persona);
        f.appendChild(n);
        if (textoEstado) {
            const e = document.createElement('span');
            e.className = 'estado';
            e.textContent = textoEstado;
            f.appendChild(e);
        }
        botones.forEach(({ texto, clase, accion }) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = texto;
            if (clase) b.className = clase;
            b.addEventListener('click', async () => {
                b.disabled = true;
                avisarAmigos('');
                try { await accion(); } catch (err) { avisarAmigos(err.message, true); b.disabled = false; }
            });
            f.appendChild(b);
        });
        return f;
    }
    function llenar(id, tituloId, filas, vacio) {
        const cont = $(id);
        cont.replaceChildren();
        if (!filas.length) {
            if (vacio) {
                const p = document.createElement('p');
                p.className = 'amigos-vacio';
                p.textContent = vacio;
                cont.appendChild(p);
            } else {
                $(tituloId).classList.add('hidden');
                return;
            }
        }
        if (tituloId) $(tituloId).classList.remove('hidden');
        filas.forEach((f) => cont.appendChild(f));
    }

    async function cargarAmigos() {
        const data = await apiFetch('/amigos');
        const despues = async () => { await cargarAmigos(); await refrescarLista(); };
        llenar('amigos-recibidas', 'titulo-recibidas', data.recibidas.map((p) => fila(p, [
            { texto: 'Aceptar', clase: 'principal', accion: async () => { await apiFetch('/amigos/' + p.amistad_id + '/aceptar', { method: 'POST' }); await despues(); } },
            { texto: 'Rechazar', accion: async () => { await apiFetch('/amigos/' + p.amistad_id, { method: 'DELETE' }); await despues(); } },
        ])));
        llenar('amigos-enviadas', 'titulo-enviadas', data.enviadas.map((p) => fila(p, [
            { texto: 'Cancelar', accion: async () => { await apiFetch('/amigos/' + p.amistad_id, { method: 'DELETE' }); await despues(); } },
        ])));
        llenar('amigos-mis', 'titulo-mis-amigos', data.amigos.map((p) => fila(p, [
            { texto: 'Quitar', clase: 'peligro', accion: async () => {
                    if (!confirm('¿Quitar a ' + nombreCompleto(p) + ' de tus amigos?')) { return; }
                    await apiFetch('/amigos/' + p.amistad_id, { method: 'DELETE' });
                    if (actual && actual.id === p.id) cerrarChat();
                    await despues();
                } },
        ])), 'Todavía no tienes amigos.');
    }

    async function buscarPersonas() {
        const q = $('amigos-buscar').value.trim();
        const cont = $('amigos-resultados');
        if (q.length < 3) { cont.replaceChildren(); return; }
        try {
            const lista = await apiFetch('/amigos/buscar?q=' + encodeURIComponent(q));
            cont.replaceChildren();
            if (!lista.length) {
                const p = document.createElement('p');
                p.className = 'amigos-vacio';
                p.textContent = 'No encontramos a nadie con ese nombre.';
                cont.appendChild(p);
                return;
            }
            lista.forEach((p) => {
                const agregar = { texto: 'Agregar', clase: 'principal', accion: async () => {
                        await apiFetch('/amigos/solicitar', { method: 'POST', body: { usuario_id: p.id } });
                        avisarAmigos('Solicitud enviada');
                        await buscarPersonas(); await cargarAmigos(); await refrescarLista();
                    } };
                if (p.relacion === 'ninguna') cont.appendChild(fila(p, [agregar]));
                else if (p.relacion === 'recibida') cont.appendChild(fila(p, [{ texto: 'Aceptar', clase: 'principal', accion: async () => {
                        await apiFetch('/amigos/' + p.amistad_id + '/aceptar', { method: 'POST' });
                        await buscarPersonas(); await cargarAmigos(); await refrescarLista();
                    } }]));
                else cont.appendChild(fila(p, [], p.relacion === 'amigo' ? 'Ya es tu amigo' : 'Solicitud enviada'));
            });
        } catch (err) { avisarAmigos(err.message, true); }
    }

    async function abrirAmigos() {
        avisarAmigos('');
        fondo.classList.remove('hidden');
        try { await cargarAmigos(); } catch (err) { avisarAmigos(err.message, true); }
    }
    $('btn-amigos').addEventListener('click', abrirAmigos);
    $('nuevo-chat').addEventListener('click', abrirAmigos);
    $('amigos-cerrar').addEventListener('click', () => fondo.classList.add('hidden'));
    fondo.addEventListener('click', (e) => { if (e.target === fondo) fondo.classList.add('hidden'); });
    $('amigos-buscar').addEventListener('input', () => {
        clearTimeout(temporizadorBusqueda);
        temporizadorBusqueda = setTimeout(buscarPersonas, 350);
    });

    // ---------- arranque y actualizacion periodica ----------
    (async () => {
        await refrescarLista();
        const con = Number(new URLSearchParams(location.search).get('con'));
        const a = con && amigos.find((x) => x.id === con);
        if (a) abrirChat(a);
    })();

    setInterval(() => {
        if (document.hidden) return;
        refrescarLista();
        refrescarChat();
    }, INTERVALO_MS);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) { refrescarLista(); refrescarChat(); }
    });
});