#!/bin/bash

# Script para crear labels en GitHub para el proyecto APIDevs
# Ejecutar: chmod +x scripts/setup-github-labels.sh && ./scripts/setup-github-labels.sh

echo "🏷️  Configurando labels de GitHub para APIDevs..."
echo ""

REPO="diazpolanco13/apidevs-react"

# ============================================
# PRIORIDADES
# ============================================
echo "Creando labels de PRIORIDAD..."

gh label create "priority:critical" --color "d73a4a" --description "🔴 Prioridad crítica - Requiere atención inmediata" --repo $REPO --force
gh label create "priority:high" --color "ff6b35" --description "🟠 Prioridad alta - Importante, próximas 2 semanas" --repo $REPO --force
gh label create "priority:medium" --color "fbca04" --description "🟡 Prioridad media - Útil, próximo mes" --repo $REPO --force
gh label create "priority:low" --color "0e8a16" --description "🟢 Prioridad baja - Nice to have, futuro" --repo $REPO --force

echo "✅ Labels de prioridad creados"
echo ""

# ============================================
# ÁREAS
# ============================================
echo "Creando labels de ÁREA..."

gh label create "area:ia-asistente" --color "8b5cf6" --description "🤖 Área: IA Asistente / Chatbot" --repo $REPO --force
gh label create "area:content-creator" --color "06b6d4" --description "✍️ Área: Content Creator IA" --repo $REPO --force
gh label create "area:admin-panel" --color "8b5cf6" --description "📊 Área: Panel de Administración" --repo $REPO --force
gh label create "area:frontend" --color "3b82f6" --description "🎨 Área: Frontend / UI" --repo $REPO --force
gh label create "area:backend" --color "10b981" --description "⚙️ Área: Backend / API" --repo $REPO --force
gh label create "area:docs" --color "6b7280" --description "📚 Área: Documentación" --repo $REPO --force
gh label create "area:blog" --color "f59e0b" --description "📝 Área: Blog Sanity" --repo $REPO --force
gh label create "area:tradingview" --color "22c55e" --description "📈 Área: Integración TradingView" --repo $REPO --force

echo "✅ Labels de área creados"
echo ""

# ============================================
# TIPOS
# ============================================
echo "Creando labels de TIPO..."

gh label create "type:bug" --color "d73a4a" --description "🐛 Tipo: Bug / Error" --repo $REPO --force
gh label create "type:feature" --color "a371f7" --description "✨ Tipo: Nueva funcionalidad" --repo $REPO --force
gh label create "type:improvement" --color "0075ca" --description "🔧 Tipo: Mejora de existente" --repo $REPO --force
gh label create "type:docs" --color "0075ca" --description "📝 Tipo: Documentación" --repo $REPO --force
gh label create "type:testing" --color "fbca04" --description "🧪 Tipo: Testing" --repo $REPO --force
gh label create "type:refactor" --color "ededed" --description "♻️ Tipo: Refactorización" --repo $REPO --force

echo "✅ Labels de tipo creados"
echo ""

# ============================================
# ESTADO
# ============================================
echo "Creando labels de ESTADO..."

gh label create "status:in-progress" --color "1d76db" --description "🚧 En progreso actualmente" --repo $REPO --force
gh label create "status:blocked" --color "d73a4a" --description "⏸️ Bloqueado por dependencia" --repo $REPO --force
gh label create "status:ready" --color "0e8a16" --description "✅ Listo para trabajar" --repo $REPO --force
gh label create "status:wont-do" --color "6b7280" --description "❌ No se hará" --repo $REPO --force
gh label create "status:needs-review" --color "fbca04" --description "👀 Necesita revisión" --repo $REPO --force

echo "✅ Labels de estado creados"
echo ""

# ============================================
# ESFUERZO
# ============================================
echo "Creando labels de ESFUERZO..."

gh label create "effort:small" --color "cfd3d7" --description "⏱️ Esfuerzo pequeño (< 2 horas)" --repo $REPO --force
gh label create "effort:medium" --color "cfd3d7" --description "⏱️ Esfuerzo medio (2-6 horas)" --repo $REPO --force
gh label create "effort:large" --color "cfd3d7" --description "⏱️ Esfuerzo grande (> 6 horas)" --repo $REPO --force

echo "✅ Labels de esfuerzo creados"
echo ""

# ============================================
# ESPECIALES
# ============================================
echo "Creando labels ESPECIALES..."

gh label create "good-first-issue" --color "7057ff" --description "👍 Bueno para empezar" --repo $REPO --force
gh label create "help-wanted" --color "008672" --description "🆘 Se necesita ayuda" --repo $REPO --force
gh label create "question" --color "d876e3" --description "❓ Pregunta / Discusión" --repo $REPO --force
gh label create "breaking-change" --color "e99695" --description "💥 Cambio que rompe compatibilidad" --repo $REPO --force

echo "✅ Labels especiales creados"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ¡Todos los labels configurados exitosamente!"
echo ""
echo "📊 Total de labels creados: 28"
echo ""
echo "🔗 Ver en: https://github.com/$REPO/labels"
echo ""
echo "📝 Próximo paso: Volver a ejecutar create-github-issues.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


