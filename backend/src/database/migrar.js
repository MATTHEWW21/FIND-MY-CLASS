const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const CARPETA = path.join(__dirname, 'migrations');
const SCHEMA = path.join(__dirname, 'schema.sql');
const args = process.argv.slice(2);
const soloEstado = args.includes('--estado');
const marcarExistentes = args.includes('--marcar-existentes');

const archivos = () => fs.readdirSync(CARPETA).filter((f) => /^\d+.*\.sql$/.test(f)).sort();

async function existe(client, tabla) {
    const r = await client.query('SELECT to_regclass($1) AS t', ['public.' + tabla]);
    return r.rows[0].t !== null;
}

async function aplicadas(client) {
    const r = await client.query('SELECT nombre FROM migraciones_aplicadas');
    return new Set(r.rows.map((x) => x.nombre));
}

async function crearRegistro(client) {
    await client.query('CREATE TABLE IF NOT EXISTS migraciones_aplicadas (nombre TEXT PRIMARY KEY, aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now())');
}

async function correr(client, archivo, ruta) {
    const sql = fs.readFileSync(ruta, 'utf8');
    await client.query(sql);
    if (archivo) await client.query('INSERT INTO migraciones_aplicadas (nombre) VALUES ($1) ON CONFLICT DO NOTHING', [archivo]);
}

async function main() {
    const client = await pool.connect();
    try {
        const hayRegistro = await existe(client, 'migraciones_aplicadas');
        const hayDatos = await existe(client, 'usuarios');

        if (soloEstado) {
            if (!hayRegistro) {
                console.log(hayDatos
                    ? 'Esta base ya tiene datos pero no tiene registro de migraciones. Corre una vez: node src/database/migrar.js --marcar-existentes'
                    : 'Base vacia: se aplicara schema.sql y todas las migraciones.');
                return;
            }
            const hechas = await aplicadas(client);
            archivos().forEach((f) => console.log((hechas.has(f) ? '[aplicada]  ' : '[pendiente] ') + f));
            return;
        }

        if (!hayRegistro && hayDatos) {
            if (!marcarExistentes) {
                console.error('Esta base ya tiene datos y no hay registro de migraciones.');
                console.error('No se ejecuto nada (algunas migraciones, como la 014, no se deben repetir).');
                console.error('Si TODAS las migraciones actuales ya estan aplicadas en tu base, corre una sola vez:');
                console.error('  node src/database/migrar.js --marcar-existentes');
                process.exitCode = 1;
                return;
            }
            await crearRegistro(client);
            for (const f of archivos()) {
                await client.query('INSERT INTO migraciones_aplicadas (nombre) VALUES ($1) ON CONFLICT DO NOTHING', [f]);
            }
            console.log('Marcadas como aplicadas: ' + archivos().length + ' migraciones. Desde ahora solo se corren las nuevas.');
            return;
        }

        if (!hayRegistro) {
            console.log('Base vacia: aplicando schema.sql');
            await crearRegistro(client);
            if (fs.existsSync(SCHEMA)) await correr(client, null, SCHEMA);
        }

        const hechas = await aplicadas(client);
        const pendientes = archivos().filter((f) => !hechas.has(f));
        if (pendientes.length === 0) {
            console.log('Todo al dia: no hay migraciones pendientes.');
            return;
        }
        for (const f of pendientes) {
            try {
                await correr(client, f, path.join(CARPETA, f));
                console.log('OK  ' + f);
            } catch (e) {
                console.error('FALLO ' + f + ': ' + e.message);
                console.error('Se detuvo aqui. Las anteriores quedaron aplicadas; esta no se registro.');
                process.exitCode = 1;
                return;
            }
        }
        console.log('Listo: ' + pendientes.length + ' migracion(es) aplicada(s).');
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((e) => {
    console.error('Error: ' + e.message);
    process.exit(1);
});
