    const SALIDAS = ['07:15', '08:15', '09:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    const aMin = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
    function pintar() {
        const ahora = new Date();
        const min = ahora.getHours() * 60 + ahora.getMinutes();
        const dia = ahora.getDay();
        const sig = SALIDAS.findIndex((h) => aMin(h) > min);
        document.getElementById('lista').innerHTML = SALIDAS.map((h, i) =>
            `<li class="${sig === -1 || i < sig ? 'paso' : i === sig ? 'sig' : ''}"${i === sig ? ' aria-label="próxima salida"' : ''}>${h}</li>`).join('');
        const hora = document.getElementById('p-hora'), falta = document.getElementById('p-falta'), luego = document.getElementById('p-luego');
        if (sig === -1) {
            hora.textContent = 'Ya no hay más hoy';
            hora.style.fontSize = '1.5rem';
            falta.textContent = 'La última salida de CU fue a las ' + SALIDAS[SALIDAS.length - 1] + '. Mañana empieza a las ' + SALIDAS[0] + '.';
            luego.textContent = '';
        } else {
            hora.style.fontSize = '';
            hora.textContent = SALIDAS[sig];
            const f = aMin(SALIDAS[sig]) - min;
            falta.textContent = f < 60 ? `Sale en ${f} min` : `Sale en ${Math.floor(f / 60)} h ${f % 60} min`;
            luego.textContent = SALIDAS[sig + 1] ? 'Después: ' + SALIDAS[sig + 1] : 'Es la última de hoy.';
        }
        document.getElementById('aviso').textContent = (dia === 0 || dia === 6) ? 'Ojo: el letrero no dice si la ruta opera en fin de semana. Confirma antes de ir.' : '';
        document.getElementById('aviso').className = 'nota nota-aviso';
    }
    pintar();
    setInterval(pintar, 30000);
