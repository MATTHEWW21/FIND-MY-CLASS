# respaldo.ps1 - Copia de seguridad de la base de datos (PostgreSQL en Docker) y de las fotos de usuarios.
# Uso (desde la carpeta del repo):   .\scripts\respaldo.ps1
# Los respaldos quedan en .\respaldos (esa carpeta NUNCA se sube a Git: contiene datos personales).
param(
    [string]$Contenedor = "naviu_postgres",
    [string]$Usuario    = "uag_admin",
    [string]$Base       = "findmyclass_db",
    [string]$Destino    = "",
    [int]$Conservar     = 14      # cuantos respaldos viejos se guardan (los demas se borran)
)

$ErrorActionPreference = "Continue"   # los errores se revisan con $LASTEXITCODE (con "Stop", PowerShell 5 se cae si docker escribe cualquier aviso)
$raiz = Split-Path -Parent $PSScriptRoot
if (-not $Destino) { $Destino = Join-Path $raiz "respaldos" }
New-Item -ItemType Directory -Force -Path $Destino | Out-Null

# Seguro extra: un .gitignore dentro de la carpeta que ignora todo, aunque se te olvide el del repo
$gi = Join-Path $Destino ".gitignore"
if (-not (Test-Path $gi)) { Set-Content -Path $gi -Value "*" -Encoding ASCII }

$log = Join-Path $Destino "respaldos.log"
function Registrar([string]$mensaje) {
    $linea = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $mensaje
    Add-Content -Path $log -Value $linea
    Write-Host $linea
}

try {
    $corre = (docker inspect -f "{{.State.Running}}" $Contenedor 2>$null)
    if ($corre -ne "true") {
        throw "El contenedor $Contenedor no esta corriendo. Abre Docker Desktop y ejecuta: docker start $Contenedor"
    }

    $sello    = Get-Date -Format "yyyy-MM-dd_HHmm"
    $archivo  = Join-Path $Destino ("db_{0}.dump" -f $sello)
    $tmp      = "/tmp/respaldo_$sello.dump"

    # 1) Volcado dentro del contenedor (formato comprimido de PostgreSQL)
    docker exec $Contenedor pg_dump -U $Usuario -d $Base -Fc -f $tmp
    if ($LASTEXITCODE -ne 0) { throw "pg_dump fallo (revisa usuario y nombre de la base)" }

    # 2) Comprobar que el archivo se puede leer antes de copiarlo
    docker exec $Contenedor sh -c "pg_restore --list $tmp > /dev/null"
    if ($LASTEXITCODE -ne 0) { throw "El volcado salio danado, no se guardo" }

    # 3) Sacarlo del contenedor (docker cp no altera los bytes, a diferencia de redirigir con > en PowerShell)
    docker cp ("{0}:{1}" -f $Contenedor, $tmp) $archivo
    if ($LASTEXITCODE -ne 0) { throw "No se pudo copiar el respaldo fuera del contenedor" }
    docker exec $Contenedor rm -f $tmp | Out-Null

    $kb = [math]::Round((Get-Item $archivo).Length / 1KB)
    if ($kb -lt 1) { throw "El respaldo quedo vacio" }
    Registrar "OK base de datos: $archivo ($kb KB)"

    # 4) Fotos de usuarios (publicaciones y mensajes)
    $fotos = Join-Path $raiz "backend\uploads"
    if ((Test-Path $fotos) -and (Get-ChildItem $fotos -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1)) {
        $zip = Join-Path $Destino ("fotos_{0}.zip" -f $sello)
        Compress-Archive -Path (Join-Path $fotos "*") -DestinationPath $zip -Force -ErrorAction Stop
        Registrar ("OK fotos: {0} ({1} KB)" -f $zip, [math]::Round((Get-Item $zip).Length / 1KB))
    } else {
        Registrar "Sin fotos que respaldar (backend\uploads vacio o no existe)"
    }

    # 5) Borrar los mas viejos
    foreach ($patron in @("db_*.dump", "fotos_*.zip")) {
        Get-ChildItem -Path $Destino -Filter $patron | Sort-Object LastWriteTime -Descending |
            Select-Object -Skip $Conservar | ForEach-Object { Remove-Item $_.FullName -Force; Registrar "Borrado respaldo viejo: $($_.Name)" }
    }
    Write-Host ""
    Write-Host "Listo. Recuerda copiar la carpeta 'respaldos' a OTRO lugar (USB o disco externo): si se dana esta laptop, tambien se pierden." -ForegroundColor Yellow
}
catch {
    Registrar "ERROR: $($_.Exception.Message)"
    exit 1
}
