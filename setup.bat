@echo off
echo ========================================
echo OrbitX Setup Script
echo ========================================

cd /d "%~dp0"

echo.
echo Step 1: Installing dependencies...
echo This may take a few minutes...
npm install --legacy-peer-deps

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Step 2: Generating Prisma Client...
npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo Failed to generate Prisma client!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup complete! Starting server...
echo ========================================
echo.
echo Open your browser to: http://localhost:3000
echo.
echo Admin login: admin@cryptovault.io / supersecretadmin
echo User login: user1@example.com / password123
echo.

npm run dev

pause