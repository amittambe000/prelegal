$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
Write-Host "Stopping Prelegal..."
docker-compose down
Write-Host "Prelegal stopped."
