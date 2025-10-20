# 🎯 Prioridades de Desarrollo - APIDevs

**Última actualización**: 20 de Octubre de 2025

---

## 🔴 **PRIORIDAD CRÍTICA** (Esta semana)

### **1. Persistencia de Conversaciones del Chatbot**
**Tiempo estimado**: 6-8 horas  
**Área**: IA Asistente  
**Issue**: #TBD

**Por qué es crítico**:
- ❌ Usuarios pierden todo el contexto al cerrar chat
- ❌ No hay auditoría de conversaciones
- ❌ No se pueden calcular métricas reales
- ❌ No hay base para features futuras (context memory, analytics)

**Tareas**:
- [ ] Modificar `/api/chat/route.ts` para guardar mensajes
- [ ] Implementar guardado en `chat_conversations`
- [ ] Implementar guardado en `chat_messages`
- [ ] Auto-generar títulos con IA (primer mensaje resumido)
- [ ] UI: Botón "Ver historial" en chat
- [ ] Cargar conversación anterior al reabrir

**Archivos a modificar**:
```
app/api/chat/route.ts
components/chat-widget.tsx
lib/ai/conversation-manager.ts (nuevo)
```

**Dependencias**: Ninguna (tablas ya creadas en BD)

---

### **2. Tab "Conversaciones" en Admin Panel**
**Tiempo estimado**: 4-6 horas  
**Área**: Admin Panel  
**Issue**: #TBD

**Por qué es crítico**:
- ❌ Admin no puede ver conversaciones de usuarios
- ❌ No hay forma de auditar uso del chatbot
- ❌ No se puede identificar problemas comunes

**Tareas**:
- [ ] Crear `ConversacionesTab.tsx`
- [ ] Lista de conversaciones con paginación
- [ ] Filtros: usuario, fecha, estado
- [ ] Modal para ver conversación completa
- [ ] Export a CSV
- [ ] Búsqueda por contenido
- [ ] Stats: total, mensajes promedio, duración

**UI Mockup**:
```
┌───────────────────────────────────────────────────┐
│ 🔍 Buscar | 📅 Fecha | 👤 Usuario | 📊 Export    │
├───────────────────────────────────────────────────┤
│ Usuario           Inicio        Msgs   Estado     │
├───────────────────────────────────────────────────┤
│ carlos@test.com   20/10 15:30   12    ✅ Útil    │
│ maria@test.com    20/10 14:15    8    ⚠️ Dudosa  │
│ juan@test.com     20/10 13:00   25    ✅ Útil    │
│ ...                                                │
└───────────────────────────────────────────────────┘
```

**Archivos**:
```
components/admin/ia-config/ConversacionesTab.tsx (nuevo)
components/admin/ia-config/ConversationViewer.tsx (nuevo)
app/api/admin/conversations/route.ts (nuevo)
```

**Dependencias**: Persistencia de conversaciones

---

## 🟠 **PRIORIDAD ALTA** (Próximas 2 semanas)

### **3. Tools de Modificación (Grant/Revoke Access)**
**Tiempo estimado**: 8-10 horas  
**Área**: IA Asistente  
**Issue**: #TBD

**Por qué es importante**:
- Admin podría gestionar accesos desde el chat
- Ahorraría tiempo vs usar panel admin
- Experiencia más fluida

**Tareas**:
- [ ] Tool: `grantIndicatorAccess`
- [ ] Tool: `revokeIndicatorAccess`
- [ ] Tool: `renewUserAccess`
- [ ] Confirmación antes de ejecutar cambios críticos
- [ ] Logs de auditoría en BD
- [ ] Testing exhaustivo

**Ejemplo de uso**:
```
Admin: "Concede acceso al RSI PRO para carlos@test.com por 30 días"
IA: [Ejecuta grantIndicatorAccess]
    ✅ Acceso concedido a RSI PRO+ OVERLAY [APIDEVS]
    Válido hasta: 19 de Noviembre de 2025
    Usuario notificado por email.
```

**Archivos**:
```
lib/ai/tools/grant-indicator-access.ts (nuevo)
lib/ai/tools/revoke-indicator-access.ts (nuevo)
lib/ai/tools/renew-user-access.ts (nuevo)
```

**Dependencias**: Microservicio TradingView funcionando (ya está ✅)

---

### **4. Analytics Reales de Conversaciones**
**Tiempo estimado**: 4-6 horas  
**Área**: Admin Panel  
**Issue**: #TBD

**Por qué es importante**:
- Actualmente son solo placeholders
- No se puede medir éxito del chatbot
- No hay datos para optimizar

**Métricas a implementar**:
```typescript
interface ConversationMetrics {
  totalConversations: number;
  activeUsers: number;           // Últimos 30 días
  totalMessages: number;
  avgMessagesPerConv: number;
  avgResponseTime: number;        // ms
  successRate: number;            // % conversaciones útiles
  topTopics: string[];            // Temas más consultados
  peakHours: number[];            // Horas con más uso
  userTypes: {                    // Distribución
    guest: number;
    free: number;
    pro: number;
    lifetime: number;
  };
}
```

**Visualizaciones**:
- Gráfico línea: Conversaciones por día (30 días)
- Gráfico barras: Temas más consultados
- Gráfico pie: Distribución por tipo de usuario
- Heatmap: Horas de mayor uso

**Archivos**:
```
components/admin/ia-config/ConversationMetrics.tsx (actualizar)
app/api/admin/analytics/conversations/route.ts (nuevo)
```

**Dependencias**: Persistencia de conversaciones

---

### **5. Context Memory entre Sesiones**
**Tiempo estimado**: 3-4 horas  
**Área**: IA Asistente  
**Issue**: #TBD

**Por qué es importante**:
- Mejora experiencia de usuario
- Conversaciones más naturales
- No repetir información

**Implementación**:
```typescript
// Cargar últimas 5 conversaciones del usuario
const loadContextMemory = async (userId: string) => {
  const { data: recentMessages } = await supabase
    .from('chat_messages')
    .select('role, parts, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20); // Últimos 10 intercambios

  // Inyectar en system prompt
  let context = '\n\n--- CONTEXTO DE CONVERSACIONES PREVIAS ---\n';
  recentMessages.reverse().forEach(msg => {
    const date = new Date(msg.created_at).toLocaleDateString('es-ES');
    context += `[${date}] ${msg.role}: ${msg.parts.content}\n`;
  });

  return context;
};
```

**UI**:
- Toggle en configuración: "Recordar conversaciones previas"
- Indicador visual cuando hay contexto cargado

**Archivos**:
```
lib/ai/context-memory.ts (nuevo)
app/api/chat/route.ts (modificar)
```

**Dependencias**: Persistencia de conversaciones

---

## 🟡 **PRIORIDAD MEDIA** (Próximo mes)

### **6. Rate Limiting Diferenciado por Tier**
**Tiempo estimado**: 2-3 horas  
**Área**: IA Asistente  
**Issue**: #TBD

**Cambio propuesto**:
```typescript
// ACTUAL: Todos 10 msg/min
const maxRequests = 10;

// PROPUESTO: Diferenciado
const rateLimits = {
  guest: 10,
  free: 15,
  pro: 30,
  lifetime: 50,
  admin: Infinity
};
```

**Por qué es útil**:
- Incentiva upgrades
- Mejor experiencia para usuarios de pago
- Protección contra abuso mantenida

---

### **7. Detección Automática de Idioma**
**Tiempo estimado**: 3-4 horas  
**Área**: IA Asistente  
**Issue**: #TBD

**Implementación**:
```typescript
import { franc } from 'franc';

const detectLanguage = (text: string): 'es' | 'en' => {
  const detected = franc(text);
  return detected === 'eng' ? 'en' : 'es';
};

// Cargar prompt correcto
const systemPrompt = language === 'en' 
  ? aiConfig.system_prompt_en 
  : aiConfig.system_prompt;
```

**Tareas**:
- [ ] Instalar librería `franc`
- [ ] Crear campo `system_prompt_en` en BD
- [ ] Traducir system prompt a inglés
- [ ] Detectar idioma del primer mensaje
- [ ] UI: Selector manual de idioma (override)

---

### **8. Webhooks y Notificaciones Admin**
**Tiempo estimado**: 4-6 horas  
**Área**: IA Asistente  
**Issue**: #TBD

**Eventos a notificar**:
- 🚨 Usuario solicita cancelación
- ⚠️ Usuario reporta problema crítico
- 💰 Usuario pregunta por reembolso
- 😡 Conversación con sentimiento negativo
- ❌ Error en el sistema

**Canales**:
- Email (Resend/SendGrid)
- Slack (webhook)
- Discord (webhook) - opcional

**Implementación**:
```typescript
const notifyAdmin = async (event: string, data: any) => {
  // Slack
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `⚠️ ${event}`,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: data.message }
        }
      ]
    })
  });
};
```

---

## 🟢 **PRIORIDAD BAJA** (Futuro)

### **9. Artifacts (Tablas, Gráficos Interactivos)**
**Tiempo estimado**: 6-8 horas  
**Área**: IA Asistente

**Tipos de artifacts**:
- `table`: Tablas interactivas con sort/filter
- `chart`: Gráficos con Chart.js
- `code`: Snippets con syntax highlighting
- `document`: Documentos formateados

**Ejemplo**:
```
Usuario: "Muestra todos mis indicadores en tabla"
IA: [Genera artifact tipo 'table']
    └─ Componente TableArtifact renderiza datos
```

---

### **10. Integración con Linear**
**Tiempo estimado**: 3-4 horas  
**Área**: Admin Panel

**Feature**:
- Admin puede crear issues desde el chat
- IA crea issue en Linear automáticamente
- Link de vuelta en conversación

---

## 📊 MATRIZ DE PRIORIZACIÓN

| Feature | Impacto | Esfuerzo | Prioridad | Cuándo |
|---------|---------|----------|-----------|--------|
| Persistencia conversaciones | 🔴 Alto | 6-8h | 🔴 Crítico | Esta semana |
| Tab conversaciones admin | 🔴 Alto | 4-6h | 🔴 Crítico | Esta semana |
| Tools modificación | 🟠 Medio | 8-10h | 🟠 Alto | Próximas 2 sem |
| Analytics reales | 🟠 Medio | 4-6h | 🟠 Alto | Próximas 2 sem |
| Context memory | 🟡 Medio | 3-4h | 🟡 Medio | Próximo mes |
| Rate limit por tier | 🟡 Bajo | 2-3h | 🟡 Medio | Próximo mes |
| Detección idioma | 🟡 Bajo | 3-4h | 🟡 Medio | Próximo mes |
| Webhooks | 🟡 Bajo | 4-6h | 🟡 Medio | Próximo mes |
| Artifacts | 🟢 Bajo | 6-8h | 🟢 Bajo | Futuro |
| Integración Linear | 🟢 Bajo | 3-4h | 🟢 Bajo | Futuro |

---

## 📝 NOTAS

**Criterios de priorización**:
1. **Crítico** 🔴: Bloquea otras features o afecta UX severamente
2. **Alto** 🟠: Muy útil, mejora significativa
3. **Medio** 🟡: Útil, mejora moderada
4. **Bajo** 🟢: Nice to have, no urgente

**Estimaciones**:
- Basadas en complejidad técnica
- Incluyen tiempo de testing
- No incluyen documentación (añadir 20%)

---

**Mantenido por**: Carlos Diaz  
**Última revisión**: 20 de Octubre de 2025

