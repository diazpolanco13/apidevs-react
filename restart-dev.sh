#!/bin/bash

# Script para forzar detención del puerto 3000 y reiniciar el servidor de desarrollo
# Uso: ./restart-dev.sh

echo "🔍 Buscando procesos en el puerto 3000..."

# Método 1: Usar fuser (más confiable en Linux/WSL)
if command -v fuser &> /dev/null; then
    echo "📌 Usando fuser para matar proceso en puerto 3000..."
    fuser -k 3000/tcp 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Proceso detenido con fuser"
    fi
fi

# Método 2: Usar lsof como respaldo
PID=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "⚠️  Deteniendo proceso con lsof (PID: $PID)..."
    kill -9 $PID 2>/dev/null
    echo "✅ Proceso detenido con lsof"
fi

# Método 3: Buscar y matar procesos de Node.js en este directorio
echo "🔎 Buscando procesos de next-server..."
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null

# Verificar si el puerto está libre
sleep 1
if lsof -ti:3000 >/dev/null 2>&1 || fuser 3000/tcp >/dev/null 2>&1; then
    echo "❌ ADVERTENCIA: El puerto 3000 todavía está ocupado"
    echo "   El servidor se iniciará en otro puerto (probablemente 3001)"
else
    echo "✅ Puerto 3000 libre"
fi

# Esperar un momento adicional para asegurar
echo "⏳ Esperando 2 segundos..."
sleep 2

# Reiniciar el servidor de desarrollo
echo "🚀 Iniciando npm run dev..."
npm run dev

