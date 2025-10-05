#!/bin/bash

# 🚀 Script para iniciar la documentación de APIDevs
# Uso: ./scripts/start-docs.sh

echo "📚 Iniciando documentación de APIDevs Trading Platform..."
echo "🌐 URL: http://localhost:4001"
echo ""

cd docs-site

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar servidor en puerto 4001
echo "🚀 Iniciando servidor de desarrollo..."
npm start
