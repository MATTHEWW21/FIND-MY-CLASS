# UAGPS en produccion

Guia para pasar de la laptop (desarrollo + tunel) a un servidor de la UAG o a la nube.

## 1. Variables del `.env` en produccion
| Variable | Valor | Por que |
|---|---|---|
| `NODE_ENV` | `production` | Cierra CORS y apaga el modo de desarrollo |
| `DEV_MOSTRAR_CODIGO` | `false` | Si es `true`, la API regresa el codigo de verificacion en la respuesta |
| `JWT_SECRET` | nuevo, 96 caracteres | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_API_KEY` | nueva, 16+ caracteres | Igual que el JWT |
| `DB_PASSWORD` | nueva y larga | No uses la de desarrollo |
| `SEGURIDAD_UAG_TELEFONO` | telefono real con lada, por ejemplo `+523312345678` | Lo usa el boton SOS |
| `DOMINIO_INSTITUCIONAL` | `edu.uag.mx` | Solo se registran correos de ese dominio |
| `TRUST_PROXY` | `1` si hay tunel, nginx o balanceador delante | Para que los limites de intentos cuenten por persona |
| `CORS_ORIGIN` | el dominio de la app, por ejemplo `https://uagps.uag.mx` | Con `NODE_ENV=production` sin esto, CORS queda cerrado |

Cambia `JWT_SECRET`, `ADMIN_API_KEY` y `DB_PASSWORD` antes de produccion si alguna vez los compartiste en un chat, un zip o una captura.

## 2. Levantar en produccion
```powershell
docker compose -f docker-compose.prod.yml up -d --build
docker exec naviu_backend node src/database/migrar.js
```
`docker-compose.prod.yml` no monta el codigo, usa `node` en vez de `nodemon`, reinicia solo si se cae y revisa `/api/health`.
Para desarrollo sigue usandose `docker compose up -d` (el de siempre).

## 3. Migraciones
`backend/src/database/migrar.js` aplica solo las migraciones pendientes y las anota en la tabla `migraciones_aplicadas`.
```powershell
docker exec naviu_backend node src/database/migrar.js --estado
docker exec naviu_backend node src/database/migrar.js
```
- En una base que ya tiene datos y nunca uso el script, corre UNA vez `--marcar-existentes` (marca como hechas las 32 actuales sin ejecutarlas; la 014 no se debe repetir).
- En una base vacia aplica `schema.sql` y todas las migraciones.
- Si una migracion falla, se detiene, no la anota y avisa cual fue.

## 4. Seguridad: `npm audit`
Desde `backend`: `npm audit fix` (sin `--force`). Quita las vulnerabilidades critica y alta de `body-parser`, `proxy-addr` y `qs`, solo actualiza el `package-lock.json`.
Quedan 2 avisos moderados de herramientas de desarrollo (nodemon); no entran en la imagen de produccion.

## 5. Respaldos
Ver `RESPALDOS.md`. Los respaldos quedan en la misma computadora: copia la carpeta `respaldos` a un disco externo o a otro servidor.
Prueba restaurar en la base de prueba (`.\scripts\restaurar.ps1`) antes de depender de ellos.

## 6. Lista antes de abrir a usuarios
- [ ] `.env` de produccion con los valores de la tabla
- [ ] HTTPS (certificado en el servidor o el tunel/proxy de la UAG)
- [ ] Correo real para los codigos de verificacion (ahora no se envian: con `DEV_MOSTRAR_CODIGO=false` nadie puede registrarse hasta que exista)
- [ ] Telefono de seguridad configurado y probado con la alerta SOS
- [ ] Respaldo diario programado (`programar-respaldo.ps1`) y una copia fuera de la maquina
- [ ] `npm audit fix` aplicado
- [ ] Aviso de privacidad visible en el registro
- [ ] Prueba piloto con 4 personas por perfil y la hoja de prueba
