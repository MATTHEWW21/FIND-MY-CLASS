(function (root) {
    const B = (typeof module !== 'undefined' && module.exports) ? require('./mapa-busqueda.js') : root.FMCBusqueda;


    const RAD = Math.PI / 180;

    function rumbo(a, b) {
        const dLng = (b.lng - a.lng) * RAD;
        const y = Math.sin(dLng) * Math.cos(b.lat * RAD);
        const x = Math.cos(a.lat * RAD) * Math.sin(b.lat * RAD) - Math.sin(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos(dLng);
        return (Math.atan2(y, x) / RAD + 360) % 360;
    }

    const PUNTOS = ['el norte', 'el noreste', 'el este', 'el sureste', 'el sur', 'el suroeste', 'el oeste', 'el noroeste'];
    function cardinal(grados) { return PUNTOS[Math.round(grados / 45) % 8]; }

    function delta(de, a) {
        let d = ((a - de) % 360 + 360) % 360;
        if (d > 180) d -= 360;
        return d;
    }

    function textoGiro(d) {
        const lado = d > 0 ? 'derecha' : 'izquierda';
        const abs = Math.abs(d);
        if (abs < 25) return null;
        if (abs < 60) return `Gira ligeramente a la ${lado}`;
        if (abs < 130) return `Gira a la ${lado}`;
        return `Da una vuelta casi completa a la ${lado}`;
    }

    function metrosHablados(m) {
        const r = Math.max(5, Math.round(m / 5) * 5);
        return r + ' metros';
    }

    function minutosCaminando(metros, velocidad) {
        return Math.max(1, Math.round(metros / (velocidad || 80)));
    }

    function generarPasos(tramos, destinoNombre, opciones) {
        const aprox = !!(opciones && opciones.aproximada);
        const lista = (tramos || []).filter((t) => t && t.a && t.b);
        const limpios = [];
        lista.forEach((t) => {
            const claseT = t.tipo === 'libre' ? 'normal' : t.tipo;
            const prev = limpios[limpios.length - 1];
            if (prev && t.metros < 3 && (prev.clase === claseT)) {
                prev.metros += t.metros; prev.b = t.b;
            } else {
                limpios.push({ a: t.a, b: t.b, metros: t.metros, tipo: t.tipo, clase: claseT, rumbo: rumbo(t.a, t.b) });
            }
        });
        if (!limpios.length) return [];

        const grupos = [];
        limpios.forEach((t) => {
            const g = grupos[grupos.length - 1];
            if (g && g.clase === t.clase && Math.abs(delta(g.rumboFin, t.rumbo)) < 25) {
                g.metros += t.metros; g.fin = t.b; g.rumboFin = t.rumbo;
            } else {
                grupos.push({ clase: t.clase, metros: t.metros, ini: t.a, fin: t.b, rumboIni: t.rumbo, rumboFin: t.rumbo });
            }
        });

        for (let i = 0; i < grupos.length && grupos.length > 1;) {
            const g = grupos[i];
            if (g.clase === 'normal' && g.metros < 12) {
                const sig = grupos[i + 1], ant = grupos[i - 1];
                if (sig && sig.clase === 'normal') {
                    sig.metros += g.metros; sig.ini = g.ini;
                    grupos.splice(i, 1); continue;
                }
                if (!sig && ant && ant.clase === 'normal') {
                    ant.metros += g.metros; ant.fin = g.fin; ant.rumboFin = g.rumboFin;
                    grupos.splice(i, 1); continue;
                }
            }
            i++;
        }

        const pasos = grupos.map((g, i) => {
            const prev = grupos[i - 1];
            return { clase: g.clase, primero: !prev, rumboIni: g.rumboIni, rumboPrev: prev ? prev.rumboFin : null, dist: metrosHablados(g.metros),
                texto: '', previo: '', metros: g.metros, tipo: g.clase, fin: g.fin, sufijo: '', destinoNombre };
        });
        pasos.forEach((p, i) => {
            const sig = pasos[i + 1];
            p.sigClase = sig ? sig.clase : null;
            p.sigRumbo = sig ? sig.rumboIni : null;
            p.rumboFinPaso = grupos[i].rumboFin;
        });
        if (aprox && pasos.length) pasos[0].sufijo += ' Ese camino no está trazado en el mapa, así que es una guía aproximada en línea recta.';
        const ultimo = pasos[pasos.length - 1];
        if (destinoNombre) ultimo.sufijo += ` Al final llegarás a ${destinoNombre}.`;
        pasos.forEach((p) => { p.texto = textoPaso(p, null); p.previo = textoPrevio(p, null); });
        return pasos;
    }

    function textoPaso(p, rumboReal) {
        const ref = rumboReal != null && !p.primero ? rumboReal : p.rumboPrev;
        const giro = !p.primero && ref != null ? textoGiro(delta(ref, p.rumboIni)) : null;
        let texto;
        if (p.clase === 'escaleras') texto = `${giro ? giro + '. ' : ''}Hay escaleras: avanza ${p.dist} con cuidado.`;
        else if (p.clase === 'rampa') texto = `${giro ? giro + ' y toma' : 'Toma'} la rampa: avanza ${p.dist}.`;
        else if (p.primero) texto = `Camina hacia ${cardinal(p.rumboIni)} unos ${p.dist}.`;
        else if (giro) texto = `${giro} y avanza ${p.dist}.`;
        else texto = `Continúa recto ${p.dist}.`;
        return texto + (p.sufijo || '');
    }
    function textoPrevio(p, rumboReal) {
        if (!p.sigClase) return `Estás por llegar${p.destinoNombre ? ' a ' + p.destinoNombre : ''}.`;
        if (p.sigClase === 'escaleras') return 'Más adelante hay escaleras. Avanza con cuidado.';
        if (p.sigClase === 'rampa') return 'Más adelante hay una rampa.';
        const ref = rumboReal != null ? rumboReal : p.rumboFinPaso;
        const giro = textoGiro(delta(ref, p.sigRumbo));
        return giro ? 'Más adelante, ' + giro.charAt(0).toLowerCase() + giro.slice(1) + '.' : 'Sigue recto.';
    }

    function resumen(destinoNombre, metros, tramos, opciones) {
        const aprox = !!(opciones && opciones.aproximada);
        const accesible = !!(opciones && opciones.accesible);
        const min = minutosCaminando(metros, opciones && opciones.velocidad);
        let t = `Ruta a ${destinoNombre}: ${metrosHablados(metros)}, unos ${min} ${min === 1 ? 'minuto' : 'minutos'} ${accesible ? 'de recorrido' : 'caminando'}.`;
        const rampas = (tramos || []).filter((x) => x.tipo === 'rampa').length;
        const escaleras = (tramos || []).filter((x) => x.tipo === 'escaleras').length;
        if (accesible && !escaleras) t += ' Es un camino accesible.';
        if (rampas) t += ` Pasa por ${rampas === 1 ? 'una rampa' : rampas + ' rampas'}.`;
        if (escaleras) t += ` Ojo: incluye ${escaleras === 1 ? 'un tramo con escaleras' : escaleras + ' tramos con escaleras'}.`;
        if (aprox) t += ' Esta ruta es aproximada.';
        return t;
    }

    const NUMEROS = { uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6', siete: '7', ocho: '8', nueve: '9', diez: '10' };
    const LETRAS = { a: 'a', ah: 'a', be: 'b', bi: 'b', b: 'b', ve: 'b', v: 'b', ce: 'c', se: 'c', si: 'c', c: 'c', ci: 'c', de: 'd', d: 'd', e: 'e', ee: 'e', efe: 'f', f: 'f', ge: 'g', g: 'g', je: 'g', hache: 'h', ache: 'h', h: 'h', i: 'i', y: 'i', hi: 'i', ii: 'i', ie: 'i', jota: 'j', j: 'j', jotas: 'j', ka: 'k', ele: 'l', eme: 'm', ene: 'n', n: 'n', o: 'o', pe: 'p', cu: 'q', erre: 'r', r: 'r', ere: 'r', ese: 's', te: 't', u: 'u', uve: 'v', equis: 'x', zeta: 'z' };
    const COLA_LETRA = new Set(['larga', 'latina', 'griega', 'chica', 'grande', 'mayuscula', 'minuscula']);

    const RELLENO = new Set(('a al el la los las de del un una unos unas por favor porfa quiero quisiera necesito necesitaria ir ire voy vamos llevame lleva llevarme lleves llevar ' +
        'donde esta estan queda quedan hay cerca cercano cercana mas ruta rutas hacia para me puedes puede podrias como llego llegar que en mi mis dime busca buscar encuentra encuentrame ' +
        'muestrame mostrar quiero ver lugar lo le se y o pues oye hola gracias camino ubicacion ubicar ' +
        'tengo ando tomar tomarme comprar sacar hacer hago llevame ahi alli aqui esto eso').split(/\s+/));

    const FRASES_NECESIDAD = [
        [/\b(sed|agua|tomar agua|beber)\b/, 'bebedero'],
        [/\b(hambre|comer|comida|almorzar|desayunar|cafe|cafeteria)\b/, 'alimentos'],
        [/\b(botana|botanas|frituras|snack|snacks|galletas)\b/, 'snacks'],
        [/\b(doctor|doctora|medico|medica|enfermeria|enfermero|consultorio|me siento mal|me duele|duele|lastime|lastimado|enferma|enfermo|mareo|mareado|accidente)\b/, 'salud'],
        [/\b(estacionar|estacionamiento|parking|mi carro|mi coche|mi auto)\b/, 'estacionamiento'],
        [/\b(banco|pagar|colegiatura|caja|tramite|tramites|inscripcion|recursos humanos|asistencia social|solutions)\b/, null],
        [/\b(cancha|gimnasio|alberca|deporte|deportes|estadio|entrenar|ejercicio)\b/, 'deportes'],
        [/\b(auditorio|conferencia|evento)\b/, 'auditorio'],
        [/\b(salida|salir|irme|me voy)\b/, 'puerta'],
        [/\b(emergencia|sismo|temblor|evacuar|evacuacion|incendio|punto de encuentro|punto de reunion)\b/, 'encuentro'],
        [/\b(descansar|descanso|relajarme|relajar|socializar|sentarme)\b/, 'descanso'],
        [/\b(silla de ruedas|entrada accesible|entrada para silla)\b/, 'entrada_accesible'],
    ];

    function limpiarDicho(texto) {
        return B.normalizar(texto).replace(/[¿?¡!.,;:"“”]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function comando(texto) {
        const t = ' ' + limpiarDicho(texto) + ' ';
        if (/ (repite|repetir|repiteme|otra vez|de nuevo|que dijiste|no te escuche|no entendi) /.test(t)) return 'repetir';
        if (/ (cuanto falta|cuanto me falta|ya casi|que tanto falta|falta mucho) /.test(t)) return 'faltante';
        if (/ (siguiente|sigue|continua|continuar|adelante) /.test(t)) return 'siguiente';
        if (/ (cancela|cancelar|cancelalo|detener|detente|detenla|parar|para|termina|terminar|salir|olvidalo|ya no|no gracias|apagar|apaga) /.test(t)) return 'cancelar';
        if (/ (empezar|empieza|empecemos|inicia|iniciar|comienza|comenzar|vamos|dale|va|si|ok|okay|claro|listo|arranca|adelante|andale|afirmativo) /.test(t)) return 'empezar';
        return null;
    }

    function arreglarTokens(tokens) {
        const out = [];
        for (let i = 0; i < tokens.length; i++) {
            const tk = tokens[i], prev = tokens[i - 1];
            if (prev === 'edificio' && LETRAS[tk] && !(tk === 'de' && tokens.length > i + 1 && tokens[i + 1].length > 2 && !COLA_LETRA.has(tokens[i + 1]))) {
                const letra = LETRAS[tk];
                out.push(letra);
                if (COLA_LETRA.has(tokens[i + 1])) i += 1;
                else if (tokens[i + 1] === 'de' && tokens[i + 2] && tokens[i + 2][0] === letra) i += 2;
            } else if (NUMEROS[tk] && (prev === 'puerta' || prev === 'edificio' || prev === 'estacionamiento' || prev === 'piso' || prev === 'numero')) out.push(NUMEROS[tk]);
            else out.push(tk);
        }
        return out;
    }

    function distanciaM(a, b) {
        const Rt = 6371000;
        const dLat = (b.lat - a.lat) * RAD, dLng = (b.lng - a.lng) * RAD;
        const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) ** 2;
        return 2 * Rt * Math.asin(Math.sqrt(x));
    }

    function masCercanos(lista, origen) {
        if (!origen) return lista.slice();
        return lista.slice().sort((x, y) => distanciaM(origen, x) - distanciaM(origen, y));
    }

    function interpretar(texto, lugares, origen) {
        const dicho = limpiarDicho(texto);
        if (!dicho) return { tipo: 'vacio' };

        const todos = arreglarTokens(dicho.split(' ').filter(Boolean));
        const tokens = todos.filter((t, i) => {
            if (/^\d+$/.test(t)) return true;
            if (t.length === 1) return todos[i - 1] === 'edificio';
            return !RELLENO.has(t);
        });
        if (tokens.length) {
            let res = B.buscar(lugares, tokens.join(' '));
            const frase = tokens.join(' ');
            const porNombre = res.filter((l) => l._nombre.includes(frase));
            if (porNombre.length && porNombre.length < res.length) res = porNombre;
            const tipoDicho = Object.keys(B.TIPOS).find((k) => B.normalizar(B.TIPOS[k].sing) === tokens[0]);
            if (tipoDicho) {
                const delTipo = res.filter((l) => l.tipo === tipoDicho);
                if (delTipo.length && delTipo.length < res.length) res = delTipo;
            }
            if (res.length === 1) return { tipo: 'destino', lugar: res[0] };
            if (res.length > 1) {
                const mismoTipo = res.every((l) => l.tipo === res[0].tipo);
                const exacto = res.filter((l) => l._nombre === tokens.join(' '));
                if (exacto.length === 1) return { tipo: 'destino', lugar: exacto[0] };
                if (mismoTipo && origen && ['snacks', 'bebedero', 'estacionamiento', 'puerta', 'alimentos', 'encuentro', 'descanso', 'entrada_accesible'].includes(res[0].tipo)) {
                    return { tipo: 'destino', lugar: masCercanos(res, origen)[0], motivo: 'cercano' };
                }
                return { tipo: 'varios', candidatos: masCercanos(res, origen).slice(0, 3) };
            }
        }

        const t = ' ' + dicho + ' ';
        for (const [re, tipoLugar] of FRASES_NECESIDAD) {
            if (!re.test(t)) continue;
            let cand = tipoLugar ? lugares.filter((l) => l.tipo === tipoLugar) : [];
            if (!tipoLugar) {
                const m = dicho.match(re);
                const pal = m ? m[1] : '';
                const mapa = { pagar: 'banco', colegiatura: 'banco', caja: 'banco', tramite: 'solutions', tramites: 'solutions', inscripcion: 'solutions' };
                const clave = mapa[pal] || pal;
                cand = lugares.filter((l) => l._nombre.includes(clave));
            }
            if (cand.length === 1) return { tipo: 'destino', lugar: cand[0], motivo: 'necesidad' };
            if (cand.length > 1) {
                const ord = masCercanos(cand, origen);
                if (origen) return { tipo: 'destino', lugar: ord[0], motivo: 'cercano' };
                return { tipo: 'varios', candidatos: ord.slice(0, 3) };
            }
        }

        if (tokens.length) {
            const puntos = lugares.map((l) => ({ l, n: tokens.filter((tk) => l._palabras.some((p) => p.startsWith(tk) && tk.length > 2)).length })).filter((x) => x.n > 0);
            if (puntos.length) {
                const max = Math.max.apply(null, puntos.map((x) => x.n));
                const mejores = puntos.filter((x) => x.n === max).map((x) => x.l);
                if (mejores.length === 1) return { tipo: 'destino', lugar: mejores[0] };
                return { tipo: 'varios', candidatos: masCercanos(mejores, origen).slice(0, 3) };
            }
        }
        return { tipo: 'nada' };
    }

    function elegirEntre(texto, candidatos) {
        const t = limpiarDicho(texto);
        if (!t || !candidatos || !candidatos.length) return null;
        const ord = [[/\b(primero|primera|uno|1)\b/, 0], [/\b(segundo|segunda|dos|2)\b/, 1], [/\b(tercero|tercera|tres|3)\b/, 2]];
        for (const [re, i] of ord) if (re.test(t) && candidatos[i]) return candidatos[i];
        const todos = arreglarTokens(t.split(' ').filter(Boolean));
        const tokens = todos.filter((x, i) => /^\d+$/.test(x) || (x.length === 1 ? todos[i - 1] === 'edificio' : !RELLENO.has(x)));
        if (!tokens.length) return null;
        const res = B.buscar(candidatos, tokens.join(' '));
        return res.length === 1 ? res[0] : null;
    }

    const api = { rumbo, cardinal, delta, textoGiro, metrosHablados, minutosCaminando, generarPasos, resumen, comando, interpretar, elegirEntre, distanciaM, limpiarDicho, textoPaso, textoPrevio };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.FMCGuia = api;
})(typeof window !== 'undefined' ? window : globalThis);
