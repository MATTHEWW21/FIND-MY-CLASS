// api.js - utilidades compartidas para hablar con el backend.
// Cárgalo ANTES del script de cada pantalla: <script src="js/api.js"></script>

const API_BASE = '/api';

const CLAVES_SESION = [
    'token', 'userLoggedIn', 'userRole', 'userEmail', 'userName', 'userVista',
    'accessibleRoutes', 'pendingEmail', 'visitaAsunto',
];

function limpiarSesion() {
    CLAVES_SESION.forEach((k) => localStorage.removeItem(k));
}

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
        // Sesión vencida o inválida: se limpia y se manda a iniciar sesión
        // (el login fallido también responde 401, por eso se excluye).
        if (res.status === 401 && token && !path.startsWith('/auth/login')) {
            limpiarSesion();
            alert('Tu sesión expiró. Inicia sesión de nuevo.');
            window.location.href = 'login.html';
        }
        const err = new Error(data.error || 'Ocurrió un error inesperado');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

// Guarda la sesión. Conserva las claves que ya usaban otras pantallas
// (userLoggedIn, userEmail, accessibleRoutes) para no romper feed, mapa, perfil, etc.
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

function cerrarSesion() {
    limpiarSesion();
    window.location.href = 'index.html';
}

// Para pantallas que exigen haber iniciado sesión. Úsalo al inicio del script:
//   if (!requerirSesion()) return;
function requerirSesion() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// A dónde manda el login según el usuario. Ajusta aquí cuando cambie el flujo.
function rutaInicio(usuario) {
    if (usuario.rol !== 'visitante' && !usuario.onboarding_completado) return 'onboarding.html';
    return homePara(usuario.rol, usuario.vista_preferida);
}

// Pantalla principal según rol y vista: el visitante y el colaborador con vista
// simplificada entran directo al mapa; los demás, al feed.
function homePara(rol, vista) {
    if (rol === 'visitante' || (rol === 'colaborador' && vista === 'simplificada')) return 'mapa.html';
    return 'feed.html';
}

// Lo mismo, leyendo la sesión guardada en el teléfono (para la pantalla de carga)
function rutaHome() {
    return homePara(localStorage.getItem('userRole'), localStorage.getItem('userVista'));
}


// Guarda una actividad terminada en la cuenta (perfil, racha y premios). Los visitantes no tienen cuenta: no se guarda.
// datos: { tipo, distancia_m, duracion_s, origen?, destino? }. Devuelve la actividad guardada o null si no se pudo.
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