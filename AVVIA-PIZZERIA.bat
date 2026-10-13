@echo off
title PIZZERIA SMART PRO - GESTIONALE REAL-TIME
color 0E

echo ======================================================================
echo           🍕 AVVIO PIZZERIA SMART PRO (REAL-TIME E OFFLINE)
echo ======================================================================
echo.

cd /d "C:\Users\danie\Desktop\APP"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo [*] Verifica ambiente Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRORE] Node.js non trovato in PATH.
    pause
    exit /b
)

echo [*] Compilazione automatica interfaccia all'ultima versione...
call npm run build

echo.
echo [*] Avvio Server Gestionale sulla porta 3001...
echo.
echo ======================================================================
echo  1. DA QUESTO COMPUTER (PC):
echo     👉 http://localhost:3001
echo.
echo  2. DA SMARTPHONE / TABLET SENZA WI-FI (Ovunque con Tailscale):
echo     👉 http://100.91.190.109:3001
echo.
echo  3. DA SMARTPHONE / TABLET SOTTO STESSO WI-FI:
echo     👉 http://10.173.129.234:3001
echo.
echo  4. FUNZIONAMENTO OFFLINE:
echo     Apri l'app una volta dal browser del telefono e seleziona
echo     "Aggiungi a Schermata Home": funzionera' anche senza internet!
echo ======================================================================
echo.

start http://localhost:3001

npx tsx server/index.ts
pause
