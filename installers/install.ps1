# ==============================================================================
# HeartLink Vencord Plugin Automated Installer (PowerShell)
# Website: https://heartlink.ahti.lol/ | Portfolio: https://ahti.lol/
# ==============================================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "        💖 HeartLink - Vencord Plugin Automated Installer  " -ForegroundColor White
Write-Host "             Developed by Ahti for his wife Kiki 💕        " -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

$ErrorActionPreference = "Stop"

# 1. Locate Vencord installation paths
$AppData = [System.Environment]::GetFolderPath('ApplicationData')
$LocalAppData = [System.Environment]::GetFolderPath('LocalApplicationData')

$PossibleVencordPaths = @(
    "$AppData\Vencord",
    "$LocalAppData\Vencord",
    "$env:USERPROFILE\Vencord",
    "$env:USERPROFILE\OneDrive\Documents\Vencord",
    "$PWD"
)

$VencordDistPath = "$AppData\Vencord\dist"
$VencordSourcePath = "$env:USERPROFILE\Vencord"

# 2. Check if running inside git repo or standalone
$PluginSource = "$PSScriptRoot\src\userplugins\HeartLink"
if (-not (Test-Path $PluginSource)) {
    $PluginSource = "$PSScriptRoot"
}

Write-Host "[1/4] Detecting Discord & Vencord installations..." -ForegroundColor Cyan

# Locate Discord clients
$DiscordPaths = @()
$Clients = @("Discord", "DiscordPTB", "DiscordCanary", "DiscordDevelopment")
foreach ($client in $Clients) {
    $basePath = "$LocalAppData\$client"
    if (Test-Path $basePath) {
        $appDirs = Get-ChildItem -Path $basePath -Directory -Filter "app-*" -ErrorAction SilentlyContinue | Sort-Object Name -Descending
        if ($appDirs.Count -gt 0) {
            $latestApp = $appDirs[0].FullName
            $asarPath = "$latestApp\resources\app.asar"
            if (Test-Path $asarPath) {
                $DiscordPaths += [PSCustomObject]@{
                    Name = $client
                    Path = $asarPath
                    Dir  = $latestApp
                }
                Write-Host "  -> Found $client at $latestApp" -ForegroundColor Green
            }
        }
    }
}

if ($DiscordPaths.Count -eq 0) {
    Write-Host "[!] No active Discord client installation found in standard directories." -ForegroundColor Yellow
}

# 3. Installing HeartLink userplugin into Vencord
Write-Host ""
Write-Host "[2/4] Installing HeartLink plugin files..." -ForegroundColor Cyan

$TargetUserplugins = "$VencordSourcePath\src\userplugins\HeartLink"
$TargetBuiltin = "$VencordSourcePath\src\plugins\heartlink"

if (Test-Path "$VencordSourcePath\src") {
    if (-not (Test-Path $TargetBuiltin)) {
        New-Item -ItemType Directory -Path $TargetBuiltin -Force | Out-Null
    }
    Copy-Item -Path "$PluginSource\*" -Destination $TargetBuiltin -Recurse -Force
    Write-Host "  -> Copied to $TargetBuiltin" -ForegroundColor Green

    if (-not (Test-Path $TargetUserplugins)) {
        New-Item -ItemType Directory -Path $TargetUserplugins -Force | Out-Null
    }
    Copy-Item -Path "$PluginSource\*" -Destination $TargetUserplugins -Recurse -Force
    Write-Host "  -> Copied to $TargetUserplugins" -ForegroundColor Green
} else {
    Write-Host "  -> Vencord source directory not found at default path, preparing dist sync..." -ForegroundColor Yellow
}

# 4. Building or Syncing with Dist
Write-Host ""
Write-Host "[3/4] Compiling & Syncing Vencord build..." -ForegroundColor Cyan

if (Test-Path "$VencordSourcePath\package.json") {
    Push-Location $VencordSourcePath
    try {
        if (Get-Command pnpm -ErrorAction SilentlyContinue) {
            Write-Host "  -> Running pnpm build..." -ForegroundColor Gray
            pnpm build | Out-Null
        } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
            Write-Host "  -> Running npm run build..." -ForegroundColor Gray
            npm run build | Out-Null
        }
        Write-Host "  -> Vencord build completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "  [!] Build step skipped: $($_.Exception.Message)" -ForegroundColor Yellow
    } finally {
        Pop-Location
    }
}

# 5. Patch & Restart Discord
Write-Host ""
Write-Host "[4/4] Finalizing installation & refreshing Discord..." -ForegroundColor Cyan

# Unlock and sync dist if needed
if (Test-Path "$VencordSourcePath\dist") {
    if (-not (Test-Path $VencordDistPath)) {
        New-Item -ItemType Directory -Path $VencordDistPath -Force | Out-Null
    }
    attrib -R "$VencordDistPath\*" /S /D 2>$null
    Copy-Item -Path "$VencordSourcePath\dist\*" -Destination $VencordDistPath -Recurse -Force
    attrib +R "$VencordDistPath\*" /S /D 2>$null
    Write-Host "  -> Synced and protected AppData Vencord dist files" -ForegroundColor Green
}

# Offer to restart Discord
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ✨ HeartLink plugin has been installed successfully!     " -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Restarting Discord PTB/Client to apply changes..." -ForegroundColor Cyan

Stop-Process -Name Discord, DiscordPTB, DiscordCanary -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

foreach ($disc in $DiscordPaths) {
    $exeName = "$($disc.Name).exe"
    $updateExe = "$LocalAppData\$($disc.Name)\Update.exe"
    if (Test-Path $updateExe) {
        Start-Process $updateExe -ArgumentList "--processStart", $exeName
        Write-Host "  -> Started $($disc.Name)" -ForegroundColor Green
        break
    }
}

Write-Host ""
Write-Host "Enjoy HeartLink! Visit https://heartlink.ahti.lol/ or https://github.com/ahtilol/heartlink for updates." -ForegroundColor Magenta
Write-Host ""
