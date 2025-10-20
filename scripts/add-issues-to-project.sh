#!/bin/bash

# Script para agregar issues al GitHub Project
# Ejecutar: chmod +x scripts/add-issues-to-project.sh && ./scripts/add-issues-to-project.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Agregando Issues al GitHub Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REPO="diazpolanco13/apidevs-react"
PROJECT_NUMBER="3"
OWNER="diazpolanco13"

# Verificar permisos
echo "🔐 Verificando permisos..."
gh auth status 2>&1 | grep -q "project" || {
    echo "⚠️  Faltan permisos de 'project'"
    echo ""
    echo "Ejecuta primero:"
    echo "  gh auth refresh -s project -h github.com"
    echo ""
    echo "Esto abrirá el navegador para autorizar permisos adicionales."
    echo ""
    exit 1
}

echo "✅ Permisos verificados"
echo ""

# ============================================
# Agregar issues al proyecto
# ============================================
echo "📍 Agregando issues al proyecto #$PROJECT_NUMBER..."
echo ""

# Issue #2 - CRÍTICO
echo "Agregando Issue #2 (🔴 Persistencia Conversaciones)..."
gh project item-add $PROJECT_NUMBER --owner $OWNER --url https://github.com/$REPO/issues/2 2>/dev/null && echo "✅ Issue #2 agregado" || echo "⚠️  Issue #2 ya existe o error"

# Issue #3 - CRÍTICO
echo "Agregando Issue #3 (🔴 Tab Conversaciones Admin)..."
gh project item-add $PROJECT_NUMBER --owner $OWNER --url https://github.com/$REPO/issues/3 2>/dev/null && echo "✅ Issue #3 agregado" || echo "⚠️  Issue #3 ya existe o error"

# Issue #4 - ALTO
echo "Agregando Issue #4 (🟠 Tools Modificación)..."
gh project item-add $PROJECT_NUMBER --owner $OWNER --url https://github.com/$REPO/issues/4 2>/dev/null && echo "✅ Issue #4 agregado" || echo "⚠️  Issue #4 ya existe o error"

# Issue #5 - ALTO
echo "Agregando Issue #5 (🟠 Analytics Reales)..."
gh project item-add $PROJECT_NUMBER --owner $OWNER --url https://github.com/$REPO/issues/5 2>/dev/null && echo "✅ Issue #5 agregado" || echo "⚠️  Issue #5 ya existe o error"

# Issue #6 - MEDIO
echo "Agregando Issue #6 (🟡 Context Memory)..."
gh project item-add $PROJECT_NUMBER --owner $OWNER --url https://github.com/$REPO/issues/6 2>/dev/null && echo "✅ Issue #6 agregado" || echo "⚠️  Issue #6 ya existe o error"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ¡Issues agregados al proyecto!"
echo ""
echo "📊 Ver proyecto: https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 PRÓXIMOS PASOS:"
echo ""
echo "1. Configurar VIEWS del proyecto:"
echo "   • Board (Kanban) → Todo, In Progress, Done"
echo "   • Table → Sort by Priority"
echo "   • Roadmap → Timeline visual"
echo ""
echo "2. Agregar CUSTOM FIELDS:"
echo "   • Priority (Single select): Critical, High, Medium, Low"
echo "   • Area (Single select): IA Asistente, Admin Panel, etc."
echo "   • Estimate (Number): Horas estimadas"
echo ""
echo "3. Mover Issue #2 a 'In Progress' y empezar a trabajar!"
echo ""

