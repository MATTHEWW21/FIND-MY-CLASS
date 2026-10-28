# Respaldos de UAGPS

Guardan **la base de datos** (usuarios, publicaciones, mensajes, mapa...) y **las fotos** (`backend/uploads`).
Todo queda en `respaldos/`, que **no se sube a Git** (tiene datos personales).

## Hacer un respaldo ahora
```powershell
.\scripts\respaldo.ps1
```
Genera `respaldos\db_AAAA-MM-DD_HHMM.dump` y `respaldos\fotos_AAAA-MM-DD_HHMM.zip`. Conserva los ultimos 14.

## Que se haga solo todos los dias
```powershell
.\scripts\programar-respaldo.ps1            # 14:00 por defecto
.\scripts\programar-respaldo.ps1 -Hora "21:30"
.\scripts\programar-respaldo.ps1 -Quitar
```

## Comprobar que un respaldo sirve (sin tocar tu base real)
```powershell
.\scripts\restaurar.ps1
```
Lo restaura en una base de prueba y muestra cuantos usuarios, publicaciones, etc. trae. Hazlo una vez al mes.

## Recuperar la base real (si algo se perdio)
```powershell
.\scripts\restaurar.ps1 -Produccion
```
Pide escribir `RESTAURAR`, detiene el backend, reemplaza los datos y lo vuelve a arrancar.
Las fotos: descomprime `fotos_....zip` dentro de `backend\uploads`.

## Importante
- Copia `respaldos\` a **otro lugar** (USB, disco externo) cada semana. Una copia en la misma laptop no protege si se danya.
- Los respaldos tienen datos personales de estudiantes: no los subas a Git, a correo ni a nubes publicas.
- Nunca ejecutes `docker compose down -v` (borra el volumen de la base).
