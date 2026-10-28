# restaurar.ps1 - Restaura un respaldo de la base de datos.
#
# Por defecto restaura en una base de PRUEBA (findmyclass_prueba) para comprobar que el respaldo sirve,
# sin tocar tu base real:                    .\scripts\restaurar.ps1
# Con un archivo concreto:                   .\scripts\restaurar.ps1 -Archivo .\respaldos\db_2026-10-28_1400.dump
# Para reemplazar la base REAL (peligroso):  .\scripts\restaurar.ps1 -Produccion
param(
    [string]$Archivo    = "",      # si se omite, usa el respaldo mas reciente
    [string]$Contenedor = "naviu_postgres",
    [string]$Backend    = "naviu_backend",
    [string]$Usuario    = "uag_admin",
    [string]$Base       = "findmyclass_db",
    [string]$BasePrueba = "findmyclass_prueba",
    [switch]$Produccion
)

$ErrorActionPreference = "Continue"   # los errores se revisan con $LASTEXITCODE (con "Stop", PowerShell 5 se cae si docker escribe cualquier aviso)
$raiz = Split-Path -Parent $PSScriptRoot
$carpeta = Join-Path $raiz "respaldos"

if (-not $Archivo) {
    $ultimo = Get-ChildItem -Path $carpeta -Filter "db_*.dump" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $ultimo) { Write-Host "No hay respaldos en $carpeta. Corre primero .\scripts\respaldo.ps1" -ForegroundColor Red; exit 1 }
    $Archivo = $ultimo.FullName
}
if (-not (Test-Path $Archivo)) { Write-Host "No existe el archivo: $Archivo" -ForegroundColor Red; exit 1 }
$Archivo = (Resolve-Path $Archivo).Path
Write-Host "Respaldo: $Archivo"

$corre = (docker inspect -f "{{.State.Running}}" $Contenedor 2>$null)
if ($corre -ne "true") { Write-Host "El contenedor $Contenedor no esta corriendo (docker start $Contenedor)" -ForegroundColor Red; exit 1 }

$tmp = "/tmp/restaurar.dump"
docker cp $Archivo ("{0}:{1}" -f $Contenedor, $tmp)
if ($LASTEXITCODE -ne 0) { Write-Host "No se pudo copiar el respaldo al contenedor" -ForegroundColor Red; exit 1 }

function Sql([string]$base, [string]$consulta) {
    docker exec $Contenedor psql -U $Usuario -d $base -t -A -c $consulta
}

if ($Produccion) {
    Write-Host ""
    Write-Host "ATENCION: esto BORRA los datos actuales de '$Base' y pone los del respaldo." -ForegroundColor Red
    $r = Read-Host "Escribe RESTAURAR para continuar"
    if ($r -ne "RESTAURAR") { Write-Host "Cancelado. No se cambio nada."; exit 0 }

    Write-Host "Deteniendo el backend..."
    docker stop $Backend | Out-Null
    # Cierra conexiones abiertas a la base y restaura encima
    Sql "postgres" "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$Base' AND pid <> pg_backend_pid();" | Out-Null
    docker exec $Contenedor pg_restore -U $Usuario -d $Base --clean --if-exists --no-owner $tmp
    $codigo = $LASTEXITCODE
    docker exec $Contenedor rm -f $tmp | Out-Null
    Write-Host "Arrancando el backend..."
    docker start $Backend | Out-Null
    if ($codigo -ne 0) { Write-Host "pg_restore termino con avisos (codigo $codigo). Revisa los mensajes de arriba; los de 'does not exist' suelen ser normales." -ForegroundColor Yellow }
    Write-Host "Listo: base '$Base' restaurada." -ForegroundColor Green
} else {
    # Base de prueba: se crea limpia, se restaura y se muestran conteos para comprobar que el respaldo tiene datos
    Sql "postgres" "DROP DATABASE IF EXISTS $BasePrueba;" | Out-Null
    Sql "postgres" "CREATE DATABASE $BasePrueba;" | Out-Null
    docker exec $Contenedor pg_restore -U $Usuario -d $BasePrueba --no-owner $tmp
    $codigo = $LASTEXITCODE
    docker exec $Contenedor rm -f $tmp | Out-Null
    if ($codigo -ne 0) { Write-Host "pg_restore fallo (codigo $codigo)" -ForegroundColor Red; exit 1 }

    Write-Host ""
    Write-Host "Contenido del respaldo (base de prueba '$BasePrueba'):"
    foreach ($tabla in @("usuarios", "publicaciones", "amistades", "mensajes", "actividades", "edificios", "puntos", "rutas")) {
        $n = Sql $BasePrueba "SELECT count(*) FROM $tabla;" 2>$null
        if ($LASTEXITCODE -eq 0) { Write-Host ("  {0,-15} {1}" -f $tabla, $n) }
    }
    Write-Host ""
    Write-Host "El respaldo SIRVE si los numeros se parecen a los de tu app. Tu base real no se toco." -ForegroundColor Green
    Write-Host "Para borrar la base de prueba:  docker exec $Contenedor psql -U $Usuario -d postgres -c `"DROP DATABASE $BasePrueba;`""
}
