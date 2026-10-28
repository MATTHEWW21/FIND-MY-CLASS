# programar-respaldo.ps1 - Crea una tarea de Windows que hace el respaldo todos los dias.
# Uso:   .\scripts\programar-respaldo.ps1                (todos los dias a las 14:00)
#        .\scripts\programar-respaldo.ps1 -Hora "21:30"
#        .\scripts\programar-respaldo.ps1 -Quitar        (borra la tarea)
# Si la laptop esta apagada a esa hora, el respaldo se hace en cuanto se prenda. Docker Desktop debe estar abierto.
param(
    [string]$Hora = "14:00",
    [switch]$Quitar
)
$nombre = "UAGPS respaldo diario"
if ($Quitar) {
    Unregister-ScheduledTask -TaskName $nombre -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Tarea '$nombre' eliminada."
    exit 0
}
$script = Join-Path $PSScriptRoot "respaldo.ps1"
$accion = New-ScheduledTaskAction -Execute "powershell.exe" -Argument ("-NoProfile -ExecutionPolicy Bypass -File `"{0}`"" -f $script)
$disparador = New-ScheduledTaskTrigger -Daily -At $Hora
$ajustes = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $nombre -Action $accion -Trigger $disparador -Settings $ajustes -Description "Respaldo de la base de datos y fotos de UAGPS" -Force | Out-Null
Write-Host "Listo: '$nombre' todos los dias a las $Hora. Para probarla ya:  Start-ScheduledTask -TaskName '$nombre'"
