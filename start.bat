@echo off
echo ================================================
echo  Starting OrbitX Trading Platform
echo ================================================

cd /d "%~dp0"

echo Starting server...
start "OrbitX Server" cmd /k "npx tsx server.ts"
timeout /t 5 /nobreak > nul

echo Opening browser...
start http://localhost:3000

echo.
echo ================================================
echo Platform ready at http://localhost:3000
echo.
echo Admin: admin@cryptovault.io / supersecretadmin
echo User:  user1@example.com / password123
echo ================================================
pause