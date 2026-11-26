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
