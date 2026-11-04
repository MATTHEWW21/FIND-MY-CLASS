const API_BASE = '/api';

const CLAVES_SESION = [
    'token', 'userLoggedIn', 'userRole', 'userEmail', 'userName', 'userVista',
    'accessibleRoutes', 'pendingEmail', 'visitaAsunto', 'rutaMapa', 'modoMovilidad',
];

function limpiarSesion() {
    CLAVES_SESION.forEach((k) => localStorage.removeItem(k));
}

async function apiFetch(path, { method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(API_BASE + path, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (e) {
        throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        if (res.status === 401 && token && !path.startsWith('/auth/login')) {
            limpiarSesion();
            await FMCAviso.alerta('Tu sesión expiró. Inicia sesión de nuevo.', 'info');
            window.location.href = 'login.html';
        }
        const err = new Error(data.error || 'Ocurrió un error inesperado');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

function guardarSesion(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', usuario.rol || '');
    if (usuario.correo) localStorage.setItem('userEmail', usuario.correo);
    else localStorage.removeItem('userEmail');
    if (usuario.nombre) localStorage.setItem('userName', usuario.nombre);
    else localStorage.removeItem('userName');
    localStorage.setItem('userVista', usuario.vista_preferida || 'completa');
    // En un dispositivo nuevo el valor viene de la cuenta, no del teléfono
    if (typeof usuario.necesita_rutas_accesibles === 'boolean') {
        localStorage.setItem('accessibleRoutes', String(usuario.necesita_rutas_accesibles));
    }
}

async function cerrarSesion() {
    const token = localStorage.getItem('token');
    if (token && localStorage.getItem('userRole') !== 'visitante') {
        try {
            await Promise.race([
                fetch(API_BASE + '/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
                new Promise((r) => setTimeout(r, 2500)),
            ]);
        } catch (e) { /* igual se cierra en este dispositivo */ }
    }
    limpiarSesion();
    window.location.href = 'index.html';
}

const _fotosPedidas = new Map();
function urlFoto(src) {
    if (!src || !src.startsWith('/api/')) return Promise.resolve(src);
    if (!_fotosPedidas.has(src)) {
        const p = fetch(src, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
            .then((r) => { if (!r.ok) throw new Error('foto'); return r.blob(); })
            .then((b) => URL.createObjectURL(b));
        p.catch(() => _fotosPedidas.delete(src));
        _fotosPedidas.set(src, p);
    }
    return _fotosPedidas.get(src);
}
function cargarFoto(img, src) {
    urlFoto(src).then((u) => { img.src = u; })
        .catch(() => { img.alt = (img.alt || 'Foto') + ' (no disponible)'; img.classList.add('foto-error'); });
}

function requerirSesion() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function rutaInicio(usuario) {
    if (usuario.rol !== 'visitante' && !usuario.onboarding_completado) return 'onboarding.html';
    return homePara(usuario.rol, usuario.vista_preferida);
}

function homePara(rol, vista) {
    if (rol === 'visitante' || (rol === 'colaborador' && vista === 'simplificada')) return 'mapa.html';
    return 'feed.html';
}

function rutaHome() {
    return homePara(localStorage.getItem('userRole'), localStorage.getItem('userVista'));
}


async function registrarActividad(datos) {
    const rol = localStorage.getItem('userRole');
    if (rol !== 'estudiante' && rol !== 'colaborador') return null;
    try {
        return await apiFetch('/actividades', { method: 'POST', body: datos });
    } catch (err) {
        console.error('No se pudo guardar la actividad:', err);
        return null;
    }
}