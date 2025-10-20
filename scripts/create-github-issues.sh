#!/bin/bash

# Script para crear issues de GitHub basados en análisis del sistema
# Ejecutar: chmod +x scripts/create-github-issues.sh && ./scripts/create-github-issues.sh

echo "🚀 Creando issues de desarrollo para APIDevs..."
echo ""

# Verificar si gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    echo ""
    echo "Instalar con estos comandos:"
    echo "curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "sudo apt update && sudo apt install -y gh"
    echo ""
    echo "Luego autenticar: gh auth login"
    exit 1
fi

REPO="diazpolanco13/apidevs-react"
PROJECT_NUMBER="3"  # Tu proyecto es el #3

echo "📊 Configurando para repo: $REPO"
echo "📋 Proyecto: #$PROJECT_NUMBER"
echo ""

# ============================================
# PRIORIDAD CRÍTICA 🔴
# ============================================

echo "Creando issues CRÍTICOS..."

gh issue create \
  --title "🔴 Implementar Persistencia de Conversaciones" \
  --label "priority:critical,area:ia-asistente,type:feature" \
  --body "## Descripción
Sistema para guardar conversaciones del chatbot en base de datos.

## Objetivo
Permitir que usuarios y admins accedan al historial de conversaciones.

## Tareas
- [ ] Implementar guardado en \`chat_conversations\`
- [ ] Implementar guardado en \`chat_messages\`
- [ ] Auto-generar títulos con IA
- [ ] UI para ver historial en frontend
- [ ] Filtros por fecha, usuario, tipo

## Impacto
- ✅ Usuarios no pierden contexto
- ✅ Admin puede auditar conversaciones
- ✅ Base para analytics futuros

## Archivos afectados
- \`app/api/chat/route.ts\`
- \`components/chat-widget.tsx\`
- \`supabase/migrations/\`

## Estimación
⏱️ 6-8 horas

## Referencias
- Tablas ya creadas en BD
- Docs: \`docs/ia/SISTEMA-IA-COMPLETO.md\` línea 393-417"

gh issue create \
  --title "🔴 Tab Conversaciones en Admin Panel" \
  --label "priority:critical,area:admin-panel,type:feature" \
  --body "## Descripción
Interfaz administrativa para ver y gestionar todas las conversaciones del chatbot.

## Objetivo
Dashboard completo de conversaciones con filtros y analytics.

## Tareas
- [ ] Componente \`ConversacionesTab.tsx\`
- [ ] Lista de conversaciones con paginación
- [ ] Filtros: usuario, fecha, tipo, estado
- [ ] Ver conversación completa (modal)
- [ ] Export a CSV
- [ ] Búsqueda por contenido
- [ ] Stats: total, activas, promedio duración

## UI Mockup
\`\`\`
┌────────────────────────────────────────┐
│ 🔍 Buscar | Filtros | Export CSV      │
├────────────────────────────────────────┤
│ Usuario    | Inicio       | Mensajes  │
├────────────────────────────────────────┤
│ carlos@... | 20/10 15:30  | 12 ↔      │
│ maria@...  | 20/10 14:15  | 8 ↔       │
│ ...                                     │
└────────────────────────────────────────┘
\`\`\`

## Estimación
⏱️ 4-6 horas

## Referencias
- Ya existe placeholder en \`IAMainView.tsx\` línea 1149"

# ============================================
# PRIORIDAD ALTA 🟠
# ============================================

echo "Creando issues ALTOS..."

gh issue create \
  --title "🟠 Implementar Tools de Modificación (grantAccess, revokeAccess)" \
  --label "priority:high,area:ia-asistente,type:feature" \
  --body "## Descripción
Tools para que admin pueda modificar accesos desde el chat.

## Objetivo
Admin escribe: \"Concede RSI PRO a carlos@test.com por 30 días\"
IA ejecuta el tool y concede acceso automáticamente.

## Tareas
- [ ] Tool: \`grantIndicatorAccess\`
- [ ] Tool: \`revokeIndicatorAccess\`
- [ ] Tool: \`renewUserAccess\`
- [ ] Tool: \`bulkGrantAccess\` (bonus)
- [ ] Confirmación antes de ejecutar
- [ ] Logs de auditoría

## Ejemplo de uso
\`\`\`typescript
export const grantIndicatorAccess = tool({
  description: 'Concede acceso a un indicador',
  parameters: z.object({
    userEmail: z.string().email(),
    indicatorName: z.string(),
    duration: z.enum(['7D', '30D', '1Y', '1L'])
  }),
  execute: async ({ userEmail, indicatorName, duration }) => {
    // Implementación
  }
});
\`\`\`

## Estimación
⏱️ 8-10 horas

## Referencias
- \`lib/ai/tools/access-management-tools.ts\`
- Microservicio TradingView: \`http://185.218.124.241:5001\`"

gh issue create \
  --title "🟠 Analytics Reales de Conversaciones" \
  --label "priority:high,area:admin-panel,type:feature" \
  --body "## Descripción
Métricas reales en lugar de placeholders en EstadisticasTab.

## Objetivo
Dashboard con métricas reales de uso del chatbot.

## Tareas
- [ ] Query a \`chat_conversations\` para métricas
- [ ] Total conversaciones
- [ ] Usuarios activos (30 días)
- [ ] Mensajes intercambiados
- [ ] Tiempo promedio de respuesta
- [ ] Tasa de éxito/error
- [ ] Gráfico de uso diario (Chart.js)
- [ ] Temas más consultados

## Métricas a mostrar
\`\`\`typescript
interface Metrics {
  totalConversations: number;
  activeUsers: number;
  totalMessages: number;
  avgResponseTime: number; // ms
  successRate: number; // %
  topTopics: string[];
}
\`\`\`

## Estimación
⏱️ 4-6 horas

## Referencias
- \`components/admin/ia-config/ConversationMetrics.tsx\`
- Depende de: Persistencia de conversaciones"

# ============================================
# PRIORIDAD MEDIA 🟡
# ============================================

echo "Creando issues MEDIOS..."

gh issue create \
  --title "🟡 Context Memory entre Sesiones" \
  --label "priority:medium,area:ia-asistente,type:feature" \
  --body "## Descripción
Sistema para que IA recuerde conversaciones previas del usuario.

## Objetivo
Usuario: \"Recuerdas lo que me dijiste ayer sobre el plan PRO?\"
IA: \"Sí, te comenté que...\"

## Tareas
- [ ] Cargar últimas N conversaciones del usuario
- [ ] Inyectar en system prompt como contexto
- [ ] Limitar tokens (últimas 5-10 conversaciones)
- [ ] UI: Toggle \"Recordar conversaciones previas\"

## Implementación
\`\`\`typescript
const loadRecentContext = async (userId: string) => {
  const { data } = await supabase
    .from('chat_messages')
    .select('role, parts')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  return data.reverse(); // Más antigua primero
};
\`\`\`

## Estimación
⏱️ 3-4 horas

## Referencias
- Depende de: Persistencia de conversaciones"

gh issue create \
  --title "🟡 Rate Limiting Diferenciado por Tier" \
  --label "priority:medium,area:ia-asistente,type:improvement" \
  --body "## Descripción
Límites de mensajes diferentes según tipo de usuario.

## Objetivo Actual
Todos: 10 mensajes/minuto (excepto admin)

## Objetivo Nuevo
\`\`\`typescript
const rateLimits = {
  guest: 10,
  free: 15,
  pro: 30,
  lifetime: 50,
  admin: Infinity
};
\`\`\`

## Tareas
- [ ] Detectar tier del usuario
- [ ] Aplicar límite según tier
- [ ] Mensaje personalizado al exceder
- [ ] UI: Mostrar límite restante

## Estimación
⏱️ 2-3 horas

## Referencias
- \`app/api/chat/route.ts\` línea 594-616"

gh issue create \
  --title "🟡 Detección Automática de Idioma" \
  --label "priority:medium,area:ia-asistente,type:feature" \
  --body "## Descripción
Detectar idioma del usuario y adaptar respuestas.

## Objetivo
Usuario escribe en inglés → IA responde en inglés automáticamente

## Tareas
- [ ] Detectar idioma del primer mensaje
- [ ] Cargar system prompt en idioma correcto
- [ ] Crear \`system_prompt_en\` en BD
- [ ] UI: Selector manual de idioma (override)

## Opciones de detección
1. Librería \`franc\` (npm)
2. Preguntar a la IA
3. Preferencia en perfil usuario

## Estimación
⏱️ 3-4 horas

## Referencias
- \`lib/ai/prompt-builder.ts\`"

# ============================================
# PRIORIDAD BAJA 🟢
# ============================================

echo "Creando issues BAJOS..."

gh issue create \
  --title "🟢 Implementar Artifacts (Tablas, Gráficos)" \
  --label "priority:low,area:ia-asistente,type:feature" \
  --body "## Descripción
Componentes interactivos en respuestas (estilo Claude Artifacts).

## Objetivo
Usuario: \"Muestra mis indicadores en tabla\"
IA: [Genera artifact tipo 'table' con datos]

## Tipos de artifacts
- \`table\`: Tablas interactivas
- \`chart\`: Gráficos visuales
- \`code\`: Snippets de código
- \`document\`: Documentos formateados

## Tareas
- [ ] Definir tipos de artifacts
- [ ] Componente \`ArtifactRenderer\`
- [ ] Detectar cuando generar artifact
- [ ] UI: Panel lateral para artifacts

## Estimación
⏱️ 6-8 horas

## Referencias
- Inspiración: Claude Artifacts, ChatGPT Code Interpreter"

gh issue create \
  --title "🟢 Webhooks y Notificaciones Admin" \
  --label "priority:low,area:ia-asistente,type:feature" \
  --body "## Descripción
Notificar a admin cuando ocurren eventos importantes.

## Eventos a notificar
- Usuario solicita cancelación
- Usuario reporta problema crítico
- Usuario pregunta por reembolso
- Conversación con sentimiento negativo
- Error en el sistema

## Canales
- 📧 Email
- 💬 Slack
- 📱 Discord
- 🔔 Webhook custom

## Tareas
- [ ] Sistema de eventos
- [ ] Integración Slack
- [ ] Integración Discord (opcional)
- [ ] UI: Configurar notificaciones

## Estimación
⏱️ 4-6 horas"

gh issue create \
  --title "🟢 Integración con Linear/ClickUp (opcional)" \
  --label "priority:low,area:admin-panel,type:feature" \
  --body "## Descripción
Crear tareas en Linear/ClickUp desde el chat.

## Objetivo
Admin: \"Crea un ticket para investigar el error X\"
IA: [Crea issue en Linear automáticamente]

## Tareas
- [ ] Integración con Linear API
- [ ] Tool: \`createLinearIssue\`
- [ ] Mapeo de prioridades
- [ ] Link de vuelta en conversación

## Estimación
⏱️ 3-4 horas

## Referencias
- Linear API: https://developers.linear.app/"

echo ""
echo "✅ Issues creados exitosamente!"
echo ""
echo "🔗 Ver en: https://github.com/TU_USER/apidevs-react/issues"
echo ""
echo "📊 Próximo paso: Crear GitHub Project y agregar estos issues"

