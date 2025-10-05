# 🔧 Microservicio TradingView Access Management

## 📡 Información Crítica del Microservicio

### **Detalles de Producción**
- **URL Base:** `http://185.218.124.241:5001`
- **API Key:** `92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea`
- **Tecnología:** Python Flask + Selenium WebDriver
- **Estado:** ✅ Activo y funcional

### **Documentación Técnica**
- **Ubicación:** `/utils/bot-pinescript/ECOMMERCE_API_GUIDE.md`
- **Versión:** 1.0 (Octubre 2025)
- **Mantenimiento:** Automatizado, actualizado con cada cambio

---

## 🚀 Endpoints Principales

### **⚠️ REGLA CRÍTICA DE AUTENTICACIÓN**

> **Endpoints individuales** (`/api/access/:username`) → **NO requieren API key**
> **Endpoints bulk** (`/api/access/bulk`) → **SÍ requieren header** `X-API-Key`

### **1. Acceso Individual (SIN API Key)**

**Endpoint:** `POST /api/access/:username`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "pine_ids": ["PUB;xxxxx", "PUB;yyyyy"],
  "duration": "7D" | "30D" | "1Y" | "1L"
}
```

**Duraciones válidas:**
- `7D` → 7 días
- `30D` → 30 días (1 mes)
- `1Y` → 365 días (1 año)
- `1L` → Lifetime (permanente)

**Respuesta exitosa:**
```json
[
  {
    "pine_id": "PUB;xxxxx",
    "status": "Success",
    "expiration": "2025-11-04T10:30:00.000Z",
    "message": "Access granted successfully"
  }
]
```

**Respuesta de error:**
```json
[
  {
    "pine_id": "PUB;xxxxx",
    "status": "Failed",
    "error": "User not found or invalid pine_id",
    "message": "Failed to grant access"
  }
]
```

### **2. Acceso Bulk (CON API Key)**

**Endpoint:** `POST /api/access/bulk`

**Headers:**
```
Content-Type: application/json
X-API-Key: 92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea
```

**Body:**
```json
{
  "usernames": ["usuario1", "usuario2", "usuario3"],
  "pine_ids": ["PUB;xxxxx", "PUB;yyyyy"],
  "duration": "30D"
}
```

**Respuesta exitosa:**
```json
[
  {
    "username": "usuario1",
    "results": [
      {
        "pine_id": "PUB;xxxxx",
        "status": "Success",
        "expiration": "2025-11-04T10:30:00.000Z"
      },
      {
        "pine_id": "PUB;yyyyy",
        "status": "Success",
        "expiration": "2025-11-04T10:30:00.000Z"
      }
    ]
  }
]
```

### **3. Revocar Acceso**

**Endpoint:** `DELETE /api/access/:username`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "pine_ids": ["PUB;xxxxx"]
}
```

**Respuesta:**
```json
[
  {
    "pine_id": "PUB;xxxxx",
    "status": "Success",
    "message": "Access revoked successfully"
  }
]
```

### **4. Verificar Acceso**

**Endpoint:** `GET /api/access/:username/check?pine_id=PUB;xxxxx`

**Respuesta:**
```json
{
  "username": "usuario1",
  "pine_id": "PUB;xxxxx",
  "has_access": true,
  "expiration": "2025-11-04T10:30:00.000Z",
  "status": "active"
}
```

---

## 🔄 Flujo de Operación Detallado

### **Concesión de Acceso Individual**

```
1. Usuario solicita acceso
   ↓
2. Sistema valida tradingview_username
   ↓
3. POST /api/access/{username}
   Body: { pine_ids: [...], duration: "30D" }
   ↓
4. Microservicio recibe request
   ↓
5. Selenium abre navegador headless
   ↓
6. Login automático en TradingView
   ↓
7. Navega a sección "Invite-only scripts"
   ↓
8. Para cada pine_id:
   • Busca el indicador
   • Hace clic en "Add user"
   • Ingresa username del usuario
   • Selecciona duración
   • Confirma invitación
   ↓
9. TradingView procesa invitación
   ↓
10. Microservicio captura fecha de expiración
   ↓
11. Retorna JSON con resultados
```

### **Verificación de Respuesta**

**Código crítico de validación:**
```typescript
const isSuccess = Array.isArray(result) &&
                  result.length > 0 &&
                  result[0].status === 'Success';

if (isSuccess) {
  const expiration = new Date(result[0].expiration);
  // Guardar en BD con esta fecha exacta
}
```

---

## 🛠️ Implementación Técnica en Next.js

### **Endpoint de Concesión Individual**

**Archivo:** `app/api/admin/users/[id]/grant-access/route.ts`

```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Validar autenticación admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email !== 'api@apidevs.io') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Obtener datos del usuario
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, tradingview_username')
    .eq('id', params.id)
    .single();

  if (!userData?.tradingview_username) {
    return NextResponse.json({
      error: 'Usuario no tiene tradingview_username configurado'
    }, { status: 400 });
  }

  // 3. Obtener datos del indicador
  const { indicator_id, duration_type } = await request.json();

  const { data: indicator } = await supabase
    .from('indicators')
    .select('*')
    .eq('id', indicator_id)
    .single();

  // 4. Llamar al microservicio (SIN API key)
  const tvResponse = await fetch(
    `http://185.218.124.241:5001/api/access/${userData.tradingview_username}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pine_ids: [indicator.pine_id],
        duration: duration_type // '7D', '30D', '1Y', '1L'
      })
    }
  );

  const tvResult = await tvResponse.json();

  // 5. Validar respuesta
  if (!Array.isArray(tvResult) || tvResult[0]?.status !== 'Success') {
    return NextResponse.json({
      error: 'Error en TradingView',
      details: tvResult
    }, { status: 500 });
  }

  // 6. Calcular fechas usando respuesta de TradingView
  const grantedAt = new Date().toISOString();
  const expiresAt = tvResult[0].expiration; // ← Fecha EXACTA de TradingView

  // 7. Verificar si ya existe acceso (para evitar duplicados)
  const { data: existingAccess } = await supabase
    .from('indicator_access')
    .select('id')
    .eq('user_id', userData.id)
    .eq('indicator_id', indicator_id)
    .maybeSingle();

  // 8. Insertar o actualizar en indicator_access
  const accessData = {
    user_id: userData.id,
    indicator_id: indicator_id,
    tradingview_username: userData.tradingview_username,
    status: 'active',
    granted_at: grantedAt,
    expires_at: expiresAt,
    duration_type: duration_type,
    access_source: 'manual',
    granted_by: user.id,
    tradingview_response: tvResult[0]
  };

  if (existingAccess) {
    // UPDATE: Extender acceso existente
    await supabase
      .from('indicator_access')
      .update(accessData)
      .eq('id', existingAccess.id);
  } else {
    // INSERT: Nuevo acceso
    await supabase
      .from('indicator_access')
      .insert(accessData);
  }

  // 9. Registrar en log de auditoría
  await supabase.from('indicator_access_log').insert({
    ...accessData,
    operation_type: 'grant',
    indicator_access_id: existingAccess?.id || null
  });

  return NextResponse.json({
    success: true,
    message: 'Acceso concedido exitosamente',
    expires_at: expiresAt
  });
}
```

### **Endpoint de Operaciones Bulk**

**Archivo:** `app/api/admin/bulk-operations/execute/route.ts`

```typescript
export async function POST(request: Request) {
  const { user_ids, indicator_ids, duration, operation_type = 'grant' } = await request.json();

  // 1. Obtener usuarios válidos (con tradingview_username)
  const { data: validUsers } = await supabase
    .from('users')
    .select('id, email, tradingview_username')
    .in('id', user_ids)
    .not('tradingview_username', 'is', null);

  // 2. Obtener indicadores activos
  const { data: indicators } = await supabase
    .from('indicators')
    .select('*')
    .in('id', indicator_ids)
    .eq('status', 'activo');

  // 3. Para operaciones bulk, usar API key
  const apiKey = '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';

  // 4. Ejecutar operación bulk
  const tvResponse = await fetch('http://185.218.124.241:5001/api/access/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({
      usernames: validUsers.map(u => u.tradingview_username),
      pine_ids: indicators.map(i => i.pine_id),
      duration: duration
    })
  });

  // 5. Procesar resultados y guardar en BD
  // ... lógica de procesamiento batch
}
```

---

## 🔍 Troubleshooting del Microservicio

### **Errores Comunes**

#### **1. `Connection refused` o `timeout`**
**Causa:** Microservicio caído o red bloqueada
**Solución:**
```bash
# Verificar que esté corriendo
curl http://185.218.124.241:5001/
# Debe retornar: {"message":"TradingView Access Management API...","status":"running"}
```

#### **2. `Invalid API key`**
**Causa:** Falta header `X-API-Key` en requests bulk
**Solución:** Agregar header correcto

#### **3. `User not found`**
**Causa:** Username no existe en TradingView
**Solución:** Verificar que el usuario tenga cuenta válida en TradingView

#### **4. `Script not found`**
**Causa:** pine_id incorrecto o indicador no existe
**Solución:** Verificar pine_id en tabla `indicators`

#### **5. `Already has access`**
**Causa:** Usuario ya tiene acceso lifetime
**Nota:** TradingView no permite "degradar" de lifetime a duración menor

### **Logs de Debug**

Los logs del microservicio incluyen:
- Timestamp de cada operación
- Username y pine_id procesados
- Resultado de cada paso (login, navegación, invitación)
- Errores detallados con screenshots (opcional)

**Ver logs en producción:**
```bash
# Conectar por SSH al servidor del microservicio
ssh user@185.218.124.241
tail -f /var/log/tradingview-microservice.log
```

---

## 📊 Performance y Límites

### **Tiempos de Respuesta**
- **Individual:** 15-30 segundos
- **Bulk (10 usuarios):** 2-3 minutos
- **Bulk (100 usuarios):** 10-15 minutos

### **Rate Limits**
- **TradingView:** 100 operaciones/hora por IP
- **Microservicio:** Sin límite interno (controlado por TradingView)

### **Concurrencia**
- Máximo 5 operaciones simultáneas
- Queue interno para requests adicionales

---

## 🔐 Seguridad

### **Autenticación**
- API key solo para operaciones bulk
- IP whitelist para acceso al servidor
- Logs de todas las operaciones

### **Validaciones**
- Username sanitizado (solo alfanumérico + underscore)
- pine_id validado formato `PUB;xxxxx`
- Duración limitada a valores permitidos

### **Monitoreo**
- Health check endpoint: `GET /health`
- Métricas de uso disponibles
- Alertas automáticas por email

---

## 🚀 Próximos Pasos

### **Mejoras Inmediatas**
1. **Cache de sesiones** - Reutilizar sesiones de navegador para velocidad
2. **Queue distribuida** - Redis para manejar picos de carga
3. **Retry automático** - Reintentar operaciones fallidas
4. **Webhooks de confirmación** - Notificar cuando acceso es concedido

### **Mejoras Futuras**
1. **API GraphQL** - Más eficiente que REST
2. **Multi-tenancy** - Soporte para múltiples cuentas TradingView
3. **Analytics integrados** - Métricas de conversión
4. **Auto-scaling** - Escalado automático basado en carga

---

## 📞 Contacto y Soporte

**Desarrollador:** Equipo de Infraestructura APIDevs
**Documentación completa:** `/utils/bot-pinescript/ECOMMERCE_API_GUIDE.md`
**Issues:** Crear ticket en repositorio interno
**Monitoring:** Dashboard en `http://185.218.124.241:5001/metrics`

---

**Última actualización:** 4 de Octubre 2025
**Versión API:** 1.0
**Estado:** ✅ Producción
