# Serialize Content Script for Global Payments
# This script serializes content items from Sitecore to YAML files

param(
    [switch]$Push,
    [switch]$Pull,
    [switch]$Status
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Success "Global Payments Content Serialization"
Write-Host "=================================="
Write-Host ""

# Get the repository root
$RepoRoot = Resolve-Path "$PSScriptRoot\..\.."
Set-Location $RepoRoot

# Check if dotnet is available
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "Error: dotnet CLI is not installed or not in PATH"
    exit 1
}

# Check if Sitecore CLI is available
try {
    $null = dotnet sitecore --version 2>&1
} catch {
    Write-Error "Error: Sitecore CLI is not installed"
    Write-Host "Install it with: dotnet tool install -g Sitecore.CLI"
    exit 1
}

# Determine action
if ($Status) {
    Write-Warning "Checking serialization status..."
    dotnet sitecore ser status --include global-payments
    exit 0
}

if ($Push) {
    Write-Warning "Pushing Global Payments content to Sitecore..."
    Write-Host "This will push all serialized content items to Sitecore"
    Write-Host ""
    
    if (dotnet sitecore ser push --include global-payments) {
        Write-Success "✓ Content push completed successfully!"
        Write-Host ""
        Write-Host "Content has been pushed to Sitecore from:"
        Write-Host "  authoring/items/global-payments/items/"
    } else {
        Write-Error "✗ Content push failed"
        exit 1
    }
    exit 0
}

# Default action: Pull
Write-Warning "Checking Sitecore connection..."
try {
    $null = dotnet sitecore login --help 2>&1
} catch {
    Write-Error "Error: Not connected to Sitecore"
    Write-Host ""
    Write-Host "To connect to Sitecore, run:"
    Write-Host "  dotnet sitecore login"
    Write-Host ""
    Write-Host "For XM Cloud, use:"
    Write-Host "  dotnet sitecore cloud login"
    exit 1
}

Write-Success "Connected to Sitecore"
Write-Host ""

# Serialize global-payments module
Write-Warning "Serializing Global Payments content..."
Write-Host "This will pull all content items defined in global-payments.module.json"
Write-Host ""

if (dotnet sitecore ser pull --include global-payments) {
    Write-Host ""
    Write-Success "✓ Content serialization completed successfully!"
    Write-Host ""
    Write-Host "Serialized content is located at:"
    Write-Host "  authoring/items/global-payments/items/"
    Write-Host ""
    Write-Host "To push content back to Sitecore, run:"
    Write-Host "  .\scripts\serialize-content.ps1 -Push"
} else {
    Write-Host ""
    Write-Error "✗ Content serialization failed"
    exit 1
}
