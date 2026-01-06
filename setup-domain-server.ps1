# CPS Verify - Custom Domain Setup
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CPS Verify - Server Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current IP
$yourIP = "10.164.102.196"  # Change this to your actual IP
Write-Host "Setting up custom domain for IP: $yourIP" -ForegroundColor Yellow
Write-Host ""

# Add to hosts file
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$entries = @"

# CPS Verify Local Domain
$yourIP   cpsverify.local
$yourIP   cpsverify
"@

try {
    Add-Content -Path $hostsPath -Value $entries -ErrorAction Stop
    Write-Host "✅ Added cpsverify.local to hosts file" -ForegroundColor Green
} catch {
    Write-Host "❌ Error adding to hosts file. Run as Administrator!" -ForegroundColor Red
    exit 1
}

# Allow firewall
try {
    New-NetFirewallRule -DisplayName "CPS Verify Web" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
    Write-Host "✅ Firewall rule added for port 3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Firewall rule may already exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: pnpm run start:network" -ForegroundColor White
Write-Host "2. Share 'setup-domain-users.bat' with users" -ForegroundColor White
Write-Host "3. Users visit: http://cpsverify.local:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
