@echo off
title Aplicaciones Interactivas - Grupo 1

echo ========================================
echo  Iniciando proyecto completo
echo ========================================
echo.

start "Backend - Spring Boot" cmd /k "cd /d %~dp0backend && C:\Users\kilul\Documents\apache-maven-3.9.16\bin\mvn.cmd spring-boot:run"

echo [Backend] Iniciando en puerto 8080...
echo Esperando 15 segundos para que el backend levante...
timeout /t 15 /nobreak >nul

start "Frontend - React Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [Frontend] Iniciando en puerto 5173...
echo.
echo ========================================
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:5173
echo  H2 Console: http://localhost:8080/h2-console
echo ========================================
echo.
echo Cerra las ventanas de comandos para detener los servicios.
pause
