@echo off
echo ========================================
echo CPS Verify - Custom Domain Setup
echo ========================================
echo.
echo This will add cpsverify.local to your hosts file
echo so you can access the verification portal at:
echo http://cpsverify.local:3000
echo.
echo Press any key to continue...
pause >nul

echo.
echo Adding entries to hosts file...
echo 10.164.102.196   cpsverify.local >> C:\Windows\System32\drivers\etc\hosts
echo 10.164.102.196   cpsverify >> C:\Windows\System32\drivers\etc\hosts

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now access the portal at:
echo http://cpsverify.local:3000
echo or
echo http://cpsverify:3000
echo.
echo Press any key to exit...
pause >nul
