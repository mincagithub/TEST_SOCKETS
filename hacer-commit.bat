@echo off
echo Inicializando repositorio Git...
git init
echo.

echo Configurando usuario de Git...
git config user.email "usuario@ejemplo.com"
git config user.name "Usuario"
echo.

echo Agregando archivos al repositorio...
git add .
echo.

echo Realizando commit inicial...
git commit -m "Implementación inicial del proyecto ZeroMQ Bridge Demo con script de prueba"
echo.

echo Proceso completado. Repositorio Git inicializado con commit inicial.
pause
