// api.js - utilidades compartidas para hablar con el backend.
// Cárgalo ANTES del script de cada pantalla: <script src="js/api.js"></script>

const API_BASE = '/api';

// Llama a la API. Lanza un Error con .message legible si algo sale mal.
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
        const err = new Error(data.error || 'Ocurrió un error inesperado');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

// Guarda la sesión. Conserva las claves que ya usaban otras pantallas
// (userLoggedIn, userEmail) para no romper feed, perfil, etc.
function guardarSesion(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', usuario.rol || '');
    if (usuario.correo) localStorage.setItem('userEmail', usuario.correo);
    else localStorage.removeItem('userEmail');
    if (usuario.nombre) localStorage.setItem('userName', usuario.nombre);
    else localStorage.removeItem('userName');
    localStorage.setItem('userVista', usuario.vista_preferida || 'completa');
}

function cerrarSesion() {
    ['token', 'userLoggedIn', 'userRole', 'userEmail', 'userName', 'userVista', 'pendingEmail']
        .forEach((k) => localStorage.removeItem(k));
    window.location.href = 'index.html';
}

// A dónde manda el login según el usuario. Ajusta aquí cuando cambie el flujo.
function rutaInicio(usuario) {
    if (usuario.rol === 'visitante') return 'mapa.html';
    if (!usuario.onboarding_completado) return 'onboarding.html';
    if (usuario.rol === 'colaborador' && usuario.vista_preferida === 'simplificada') return 'mapa.html';
    return 'feed.html';
}
