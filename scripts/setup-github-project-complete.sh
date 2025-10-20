#!/bin/bash

# Script MAESTRO para configurar GitHub Project completo
# Ejecuta: chmod +x scripts/setup-github-project-complete.sh && ./scripts/setup-github-project-complete.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 SETUP COMPLETO DE GITHUB PROJECT - APIDevs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REPO="diazpolanco13/apidevs-react"
PROJECT_NUMBER="3"

# ============================================
# PASO 1: Crear Labels
# ============================================
echo "📍 PASO 1/3: Creando labels en GitHub..."
echo ""

# PRIORIDADES
echo "Creando labels de PRIORIDAD..."
gh label create "priority:critical" --color "d73a4a" --description "🔴 Prioridad crítica" --repo $REPO --force 2>/dev/null
gh label create "priority:high" --color "ff6b35" --description "🟠 Prioridad alta" --repo $REPO --force 2>/dev/null
gh label create "priority:medium" --color "fbca04" --description "🟡 Prioridad media" --repo $REPO --force 2>/dev/null
gh label create "priority:low" --color "0e8a16" --description "🟢 Prioridad baja" --repo $REPO --force 2>/dev/null

# ÁREAS
echo "Creando labels de ÁREA..."
gh label create "area:ia-asistente" --color "8b5cf6" --description "🤖 IA Asistente" --repo $REPO --force 2>/dev/null
gh label create "area:content-creator" --color "06b6d4" --description "✍️ Content Creator" --repo $REPO --force 2>/dev/null
gh label create "area:admin-panel" --color "8b5cf6" --description "📊 Admin Panel" --repo $REPO --force 2>/dev/null
gh label create "area:frontend" --color "3b82f6" --description "🎨 Frontend" --repo $REPO --force 2>/dev/null
gh label create "area:backend" --color "10b981" --description "⚙️ Backend" --repo $REPO --force 2>/dev/null
gh label create "area:docs" --color "6b7280" --description "📚 Docs" --repo $REPO --force 2>/dev/null

# TIPOS
echo "Creando labels de TIPO..."
gh label create "type:bug" --color "d73a4a" --description "🐛 Bug" --repo $REPO --force 2>/dev/null
gh label create "type:feature" --color "a371f7" --description "✨ Feature" --repo $REPO --force 2>/dev/null
gh label create "type:improvement" --color "0075ca" --description "🔧 Improvement" --repo $REPO --force 2>/dev/null
gh label create "type:docs" --color "0075ca" --description "📝 Docs" --repo $REPO --force 2>/dev/null

# ESFUERZO
echo "Creando labels de ESFUERZO..."
gh label create "effort:small" --color "cfd3d7" --description "⏱️ < 2h" --repo $REPO --force 2>/dev/null
gh label create "effort:medium" --color "cfd3d7" --description "⏱️ 2-6h" --repo $REPO --force 2>/dev/null
gh label create "effort:large" --color "cfd3d7" --description "⏱️ > 6h" --repo $REPO --force 2>/dev/null

echo "✅ Labels creados!"
echo ""

# ============================================
# PASO 2: Crear Issues
# ============================================
echo "📍 PASO 2/3: Creando issues prioritarios..."
echo ""

# CRÍTICO 1
echo "Creando issue CRÍTICO #1..."
ISSUE1=$(gh issue create \
  --repo $REPO \
  --title "🔴 Implementar Persistencia de Conversaciones del Chatbot" \
  --label "priority:critical,area:ia-asistente,type:feature,effort:large" \
  --body "## 🎯 Descripción
Sistema para guardar conversaciones del chatbot en base de datos.

## 💡 Objetivo
Permitir que usuarios y admins accedan al historial de conversaciones.

## ✅ Tareas
- [ ] Implementar guardado en \`chat_conversations\`
- [ ] Implementar guardado en \`chat_messages\`
- [ ] Auto-generar títulos con IA
- [ ] UI para ver historial en frontend
- [ ] Cargar conversación anterior al reabrir
- [ ] Testing completo

## 📊 Impacto
- ✅ Usuarios no pierden contexto
- ✅ Admin puede auditar conversaciones
- ✅ Base para analytics futuros
- ✅ Context memory entre sesiones

## 📁 Archivos afectados
- \`app/api/chat/route.ts\`
- \`components/chat-widget.tsx\`
- \`lib/ai/conversation-manager.ts\` (nuevo)

## ⏱️ Estimación
6-8 horas

## 🔗 Referencias
- Tablas ya creadas en BD (\`chat_conversations\`, \`chat_messages\`)
- Docs: \`docs/ia/SISTEMA-IA-COMPLETO.md\` línea 393-417" \
  --assignee @me | grep -oP 'https://github.com[^ ]*')

echo "✅ Issue #1 creado: $ISSUE1"

# CRÍTICO 2
echo "Creando issue CRÍTICO #2..."
ISSUE2=$(gh issue create \
  --repo $REPO \
  --title "🔴 Tab Conversaciones en Admin Panel" \
  --label "priority:critical,area:admin-panel,type:feature,effort:medium" \
  --body "## 🎯 Descripción
Interfaz administrativa para ver y gestionar todas las conversaciones del chatbot.

## 💡 Objetivo
Dashboard completo de conversaciones con filtros y analytics.

## ✅ Tareas
- [ ] Componente \`ConversacionesTab.tsx\`
- [ ] Lista de conversaciones con paginación
- [ ] Filtros: usuario, fecha, tipo, estado
- [ ] Ver conversación completa (modal)
- [ ] Export a CSV
- [ ] Búsqueda por contenido
- [ ] Stats: total, activas, promedio duración

## 📊 UI Mockup
\`\`\`
┌────────────────────────────────────────┐
│ 🔍 Buscar | Filtros | Export CSV      │
├────────────────────────────────────────┤
│ Usuario    | Inicio       | Mensajes  │
├────────────────────────────────────────┤
│ carlos@... | 20/10 15:30  | 12 ↔      │
│ maria@...  | 20/10 14:15  | 8 ↔       │
└────────────────────────────────────────┘
\`\`\`

## ⏱️ Estimación
4-6 horas

## 🔗 Referencias
- Ya existe placeholder en \`components/admin/ia-config/IAMainView.tsx\` línea 1149

## 🔗 Depende de
- Issue #1 (Persistencia de conversaciones)" \
  --assignee @me | grep -oP 'https://github.com[^ ]*')

echo "✅ Issue #2 creado: $ISSUE2"

# ALTO 1
echo "Creando issue ALTO #1..."
ISSUE3=$(gh issue create \
  --repo $REPO \
  --title "🟠 Implementar Tools de Modificación (grant/revoke access)" \
  --label "priority:high,area:ia-asistente,type:feature,effort:large" \
  --body "## 🎯 Descripción
Tools para que admin pueda modificar accesos desde el chat.

## 💡 Objetivo
Admin escribe: \"Concede RSI PRO a carlos@test.com por 30 días\"
IA ejecuta el tool y concede acceso automáticamente.

## ✅ Tareas
- [ ] Tool: \`grantIndicatorAccess\`
- [ ] Tool: \`revokeIndicatorAccess\`
- [ ] Tool: \`renewUserAccess\`
- [ ] Confirmación antes de ejecutar
- [ ] Logs de auditoría
- [ ] Testing con microservicio TradingView

## 📝 Ejemplo de Implementación
\`\`\`typescript
export const grantIndicatorAccess = tool({
  description: 'Concede acceso a un indicador',
  parameters: z.object({
    userEmail: z.string().email(),
    indicatorName: z.string(),
    duration: z.enum(['7D', '30D', '1Y', '1L'])
  }),
  execute: async ({ userEmail, indicatorName, duration }) => {
    // 1. Buscar usuario
    // 2. Buscar indicador
    // 3. Calcular expiración
    // 4. Insertar en indicator_access
    // 5. Llamar microservicio TradingView
    return { success: true, message: 'Acceso concedido' };
  }
});
\`\`\`

## ⏱️ Estimación
8-10 horas

## 🔗 Referencias
- \`lib/ai/tools/access-management-tools.ts\` (ya existe getUserAccessDetails)
- Microservicio: \`http://185.218.124.241:5001\`" \
  --assignee @me | grep -oP 'https://github.com[^ ]*')

echo "✅ Issue #3 creado: $ISSUE3"

# ALTO 2
echo "Creando issue ALTO #2..."
ISSUE4=$(gh issue create \
  --repo $REPO \
  --title "🟠 Analytics Reales de Conversaciones" \
  --label "priority:high,area:admin-panel,type:feature,effort:medium" \
  --body "## 🎯 Descripción
Métricas reales en lugar de placeholders en EstadisticasTab.

## 💡 Objetivo
Dashboard con métricas reales de uso del chatbot.

## ✅ Tareas
- [ ] Query a \`chat_conversations\` para métricas
- [ ] Total conversaciones
- [ ] Usuarios activos (30 días)
- [ ] Mensajes intercambiados
- [ ] Tiempo promedio de respuesta
- [ ] Gráfico de uso diario (Chart.js)
- [ ] Temas más consultados (NLP básico)

## 📊 Métricas a Mostrar
\`\`\`typescript
interface Metrics {
  totalConversations: number;
  activeUsers: number;
  totalMessages: number;
  avgResponseTime: number; // ms
  avgMessagesPerConv: number;
  topTopics: string[];
  peakHours: number[];
}
\`\`\`

## ⏱️ Estimación
4-6 horas

## 🔗 Referencias
- \`components/admin/ia-config/ConversationMetrics.tsx\` (actualmente placeholders)

## 🔗 Depende de
- Issue #1 (Persistencia de conversaciones)" \
  --assignee @me | grep -oP 'https://github.com[^ ]*')

echo "✅ Issue #4 creado: $ISSUE4"

# MEDIO 1
echo "Creando issue MEDIO #1..."
ISSUE5=$(gh issue create \
  --repo $REPO \
  --title "🟡 Context Memory entre Sesiones" \
  --label "priority:medium,area:ia-asistente,type:feature,effort:small" \
  --body "## 🎯 Descripción
Sistema para que IA recuerde conversaciones previas del usuario.

## 💡 Objetivo
Usuario: \"Recuerdas lo que me dijiste ayer sobre el plan PRO?\"
IA: \"Sí, te comenté que...\"

## ✅ Tareas
- [ ] Cargar últimas N conversaciones del usuario
- [ ] Inyectar en system prompt como contexto
- [ ] Limitar tokens (últimas 5-10 conversaciones)
- [ ] UI: Toggle \"Recordar conversaciones previas\"

## 📝 Implementación
\`\`\`typescript
const loadRecentContext = async (userId: string) => {
  const { data } = await supabase
    .from('chat_messages')
    .select('role, parts')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  // Inyectar en system prompt
  return contextString;
};
\`\`\`

## ⏱️ Estimación
3-4 horas

## 🔗 Depende de
- Issue #1 (Persistencia de conversaciones)" \
  --assignee @me | grep -oP 'https://github.com[^ ]*')

echo "✅ Issue #5 creado: $ISSUE5"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ¡Issues creados exitosamente!"
echo ""
echo "📊 Resumen:"
echo "   🔴 Críticos: 2"
echo "   🟠 Altos: 2"
echo "   🟡 Medios: 1"
echo "   📝 Total: 5 issues principales"
echo ""
echo "🔗 Ver issues: https://github.com/$REPO/issues"
echo "📋 Ver proyecto: https://github.com/users/diazpolanco13/projects/$PROJECT_NUMBER"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 PRÓXIMO PASO:"
echo "Ve a tu proyecto en GitHub y los issues aparecerán automáticamente!"
echo ""


