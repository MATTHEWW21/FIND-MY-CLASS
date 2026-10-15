document.addEventListener('DOMContentLoaded', async () => {
    if (!requerirSesion()) return;

    const rol = localStorage.getItem('userRole');

    // El visitante no tiene preferencias guardadas
    if (rol !== 'estudiante' && rol !== 'colaborador') {
        window.location.href = 'mapa.html';
        return;
    }
    const esEstudiante = rol === 'estudiante';

    // Cada perfil ve sus propias preguntas
    document.getElementById('student-fields').style.display = esEstudiante ? '' : 'none';
    document.getElementById('worker-fields').style.display = esEstudiante ? 'none' : '';

    const btnYes = document.getElementById('btn-accessible-yes');
    const btnNo = document.getElementById('btn-accessible-no');
    const btnSave = document.getElementById('btn-save');
    const stayGroup = document.getElementById('stay-group');

    let needsAccessibility = null; // Inicia sin selección

    // 1. Botones Sí / No
    btnYes.addEventListener('click', () => {
        needsAccessibility = true;
        btnYes.classList.add('active');
        btnNo.classList.remove('active');
    });
    btnNo.addEventListener('click', () => {
        needsAccessibility = false;
        btnNo.classList.add('active');
        btnYes.classList.remove('active');
    });

    // 2. Desplegables: al elegir, el texto visible se actualiza
    function crearDropdown(selectId, triggerId, prefijo) {
        const select = document.getElementById(selectId);
        const label = document.getElementById(triggerId).querySelector('.select-label');

        select.addEventListener('change', () => {
            label.textContent = `${prefijo}: ${select.options[select.selectedIndex].text}`;
        });

        return {
            select,
            // Quita las opciones cargadas (deja el texto de ejemplo) y vuelve a la etiqueta inicial
            vaciar() {
                while (select.options.length > 1) select.remove(1);
                select.value = '';
                label.textContent = prefijo;
            },
            llenar(items, campoTexto) {
                items.forEach((item) => {
                    const opt = document.createElement('option');
                    opt.value = item.id;
                    opt.textContent = item[campoTexto];
                    select.appendChild(opt);
                });
            },
        };
    }

    const ddEdificio = crearDropdown('select-building', 'select-building-trigger', '• Edificio Habitual');
    const ddCarrera = crearDropdown('select-career', 'select-career-trigger', '• ¿Que estudias?');
    const ddEspacio = crearDropdown('select-space', 'select-space-trigger', '• Selecciona tu espacio principal de trabajo');
    const ddEstancia = crearDropdown('select-stay', 'select-stay-trigger', '• Seleccione su estancia');
    const ddVista = crearDropdown('select-view', 'select-view-trigger', '• Detalle de la interfaz de usuario');

    // 3a. Estudiante: edificios y carreras salen de la base de datos
    if (esEstudiante) {
        try {
            const [edificios, carreras] = await Promise.all([
                apiFetch('/catalogos/edificios'),
                apiFetch('/catalogos/carreras'),
            ]);
            ddEdificio.llenar(edificios, 'nombre');
            ddCarrera.llenar(carreras, 'nombre');
        } catch (err) {
            alert('No se pudieron cargar las opciones: ' + err.message);
        }
    }

    // 3b. Colaborador: las estancias dependen del espacio de trabajo elegido
    let cargaActual = 0;
    ddEspacio.select.addEventListener('change', async () => {
        const tipo = ddEspacio.select.value;
        const miCarga = ++cargaActual;

        ddEstancia.vaciar();
        if (tipo === 'no_aplica') {
            stayGroup.style.display = 'none';
            return;
        }
        stayGroup.style.display = '';

        try {
            const estancias = await apiFetch('/catalogos/estancias?tipo=' + encodeURIComponent(tipo));
            if (miCarga !== cargaActual) return; // eligió otro espacio mientras cargaba
            ddEstancia.llenar(estancias, 'etiqueta');
        } catch (err) {
            alert('No se pudieron cargar las estancias: ' + err.message);
        }
    });

    // 4. Guardar y continuar
    btnSave.addEventListener('click', async () => {
        if (needsAccessibility === null) {
            alert('Indica si necesitas rutas accesibles.');
            return;
        }

        const body = { necesita_rutas_accesibles: needsAccessibility };

        if (esEstudiante) {
            if (!ddEdificio.select.value) {
                alert('Selecciona tu edificio habitual.');
                return;
            }
            if (!ddCarrera.select.value) {
                alert('Selecciona tu carrera.');
                return;
            }
            body.edificio_habitual_id = Number(ddEdificio.select.value);
            body.carrera_id = Number(ddCarrera.select.value);
        } else {
            const espacio = ddEspacio.select.value;
            if (!espacio) {
                alert('Selecciona tu espacio principal de trabajo.');
                return;
            }
            if (espacio !== 'no_aplica' && !ddEstancia.select.value) {
                alert('Selecciona tu estancia.');
                return;
            }
            if (!ddVista.select.value) {
                alert('Selecciona el detalle de la interfaz de usuario.');
                return;
            }
            body.espacio_trabajo = espacio;
            body.estancia_id = espacio === 'no_aplica' ? null : Number(ddEstancia.select.value);
            body.vista_preferida = ddVista.select.value;
        }

        btnSave.disabled = true;
        try {
            const data = await apiFetch('/auth/me/preferencias', { method: 'PUT', body });
            // Se conservan las claves que ya usaba el resto de la app
            localStorage.setItem('accessibleRoutes', String(data.usuario.necesita_rutas_accesibles));
            localStorage.setItem('userVista', data.usuario.vista_preferida);
            window.location.href = 'loading.html';
        } catch (err) {
            alert(err.message);
            btnSave.disabled = false;
        }
    });
});
