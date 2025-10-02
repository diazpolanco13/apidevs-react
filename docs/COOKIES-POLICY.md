# 🍪 Política y Funcionamiento de Cookies - APIDevs

## 📋 ¿Qué son las Cookies?

Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web. Nos ayudan a recordar tu información y preferencias para mejorar tu experiencia.

---

## 🎯 Cookies que Utilizamos

### 1. **Cookies Esenciales (Necesarias)** 🔐
Estas cookies son **estrictamente necesarias** para el funcionamiento del sitio y **no requieren consentimiento**.

| Cookie | Propósito | Duración | Tipo |
|--------|-----------|----------|------|
| `sb-access-token` | Token de autenticación de Supabase | Session | HTTP-Only |
| `sb-refresh-token` | Token para refrescar sesión | 30 días | HTTP-Only |
| `activity_session_id` | ID de sesión para tracking | Session | LocalStorage |
| `session_start` | Timestamp de inicio de sesión | Session | LocalStorage |

**¿Por qué son necesarias?**
- Para mantener tu sesión activa
- Para recordar que has iniciado sesión
- Para proteger tu cuenta con autenticación segura

---

### 2. **Cookies de Analytics (Opcional)** 📊
Estas cookies nos ayudan a entender cómo usas la aplicación. **Requieren tu consentimiento**.

| Cookie | Propósito | Duración | Tipo |
|--------|-----------|----------|------|
| `cookies_consent` | Guarda tu preferencia de cookies | 365 días | LocalStorage |
| `analytics_enabled` | Si has aceptado analytics | 365 días | LocalStorage |

**¿Para qué las usamos?**
- Entender qué páginas visitas más
- Saber qué funciones usas
- Mejorar la experiencia basándonos en datos reales
- Detectar problemas y bugs

**¿Qué NO hacemos con estos datos?**
- ❌ NO vendemos tu información
- ❌ NO compartimos con terceros sin tu consentimiento
- ❌ NO rastreamos fuera de nuestro sitio
- ❌ NO guardamos información sensible

---

### 3. **Cookies de Marketing (Opcional)** 🎯
**ACTUALMENTE NO UTILIZAMOS COOKIES DE MARKETING**

En el futuro, podríamos usar cookies para:
- Mostrar anuncios relevantes
- Medir efectividad de campañas
- Retargeting

Si implementamos esto, **pediremos tu consentimiento explícito**.

---

## 🔧 Almacenamiento Técnico

### LocalStorage vs Cookies

#### **LocalStorage** (Usado para preferencias)
```javascript
// Ejemplo de lo que guardamos en LocalStorage
{
  "cookies_consent": "accepted",
  "analytics_enabled": true,
  "activity_session_id": "uuid-v4-here",
  "session_start": "1633027200000"
}
```

**Características:**
- ✅ No se envía automáticamente al servidor
- ✅ Mayor capacidad (5-10MB vs 4KB de cookies)
- ✅ Persistente hasta que se borra manualmente
- ⚠️ Accesible desde JavaScript (no usar para datos sensibles)

#### **HTTP-Only Cookies** (Usado para autenticación)
```
sb-access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Características:**
- ✅ No accesible desde JavaScript (más seguro)
- ✅ Se envía automáticamente en cada request
- ✅ Protegido contra ataques XSS
- ✅ Puede tener flag "Secure" (solo HTTPS)

---

## 📊 ¿Qué Datos Recopilamos?

### Con Cookies Esenciales (Siempre)
- ✅ Autenticación (email, user ID)
- ✅ Sesión activa (duración, última actividad)

### Con Cookies de Analytics (Si aceptas)
- ✅ Páginas visitadas
- ✅ Tiempo en cada página
- ✅ Clicks en botones importantes
- ✅ Flujo de navegación
- ✅ Dispositivo (móvil/desktop/tablet)
- ✅ Navegador y OS
- ✅ País/región (IP anónima)

### Datos que NO Recopilamos
- ❌ Contraseñas
- ❌ Información de pago (manejada por Stripe)
- ❌ Mensajes privados
- ❌ Historial de navegación fuera de APIDevs
- ❌ Datos de otros sitios web

---

## 🛡️ Seguridad y Privacidad

### Medidas de Seguridad

1. **Encriptación**
   - Todos los tokens están firmados y encriptados
   - HTTPS obligatorio en producción
   - Cookies con flag "Secure" y "SameSite"

2. **Expiración**
   - Tokens de acceso expiran en 1 hora
   - Refresh tokens expiran en 30 días
   - Limpieza automática de sesiones antiguas

3. **Row Level Security (RLS)**
   - Solo puedes ver tus propios datos
   - Los admins tienen acceso controlado
   - Logs de acceso administrativo

### Cumplimiento Legal

✅ **GDPR (Europa)**: Cumplimos con el Reglamento General de Protección de Datos
✅ **CCPA (California)**: Cumplimos con la Ley de Privacidad del Consumidor
✅ **LGPD (Brasil)**: Cumplimos con la Ley General de Protección de Datos

**Tus Derechos:**
- 📋 **Acceso**: Ver qué datos tenemos sobre ti
- ✏️ **Corrección**: Corregir datos incorrectos
- 🗑️ **Eliminación**: Solicitar borrado de tu cuenta
- 📤 **Portabilidad**: Exportar tus datos
- 🛑 **Objeción**: Rechazar procesamiento de datos
- ⚠️ **Restricción**: Limitar cómo usamos tus datos

---

## 🔄 Gestión de Cookies

### Cómo Gestionar tus Preferencias

1. **Desde el Banner de Cookies** (Primera visita)
   - Aceptar todas
   - Rechazar opcionales
   - Personalizar

2. **Desde Configuración** (Después)
   - Ve a "Mi Cuenta" → "Configuración"
   - Sección "Privacidad"
   - Cambia tus preferencias en cualquier momento

3. **Desde tu Navegador**
   - Chrome: Configuración → Privacidad y seguridad → Cookies
   - Firefox: Opciones → Privacidad y seguridad
   - Safari: Preferencias → Privacidad
   - Edge: Configuración → Cookies y permisos

### Borrar Cookies

```javascript
// Borrar todas las cookies de APIDevs
// Desde la consola del navegador:
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

---

## 📈 Retención de Datos

| Tipo de Dato | Duración |
|--------------|----------|
| **Logs de actividad** | 90 días |
| **Datos de cuenta** | Mientras tu cuenta esté activa |
| **Datos de pago** | 7 años (requerido legalmente) |
| **Sesiones antiguas** | 30 días |
| **Analytics** | 365 días |

### Limpieza Automática

Ejecutamos limpieza automática de datos antiguos:

```sql
-- Se ejecuta semanalmente
DELETE FROM user_activity_log 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Se ejecuta mensualmente
DELETE FROM sessions 
WHERE last_activity < NOW() - INTERVAL '30 days';
```

---

## 🎯 Ejemplos de Uso de Cookies

### Ejemplo 1: Mantener Sesión Activa

```javascript
// Cuando inicias sesión:
1. Servidor genera access_token (válido 1h)
2. Servidor genera refresh_token (válido 30d)
3. Tokens se guardan en HTTP-Only cookies
4. Cliente no puede acceder a estos tokens (seguridad)
5. Tokens se envían automáticamente en cada request

// Cuando expira el access_token:
1. Cliente detecta token expirado (401)
2. Cliente usa refresh_token automáticamente
3. Servidor valida refresh_token
4. Servidor genera nuevo access_token
5. Usuario sigue navegando sin interrupciones
```

### Ejemplo 2: Activity Tracking

```javascript
// Cuando visitas una página:
1. Hook useActivityTracker() se activa
2. Verifica si tienes analytics_enabled = true
3. Si NO tienes consentimiento → No trackea
4. Si SÍ tienes consentimiento → Registra evento
5. Evento se guarda en user_activity_log

// Datos guardados:
{
  event_type: "page_view",
  page_url: "/dashboard",
  device_type: "desktop",
  browser: "Chrome",
  session_id: "uuid",
  timestamp: "2025-10-01T12:00:00Z"
}
```

### Ejemplo 3: Session Tracking

```javascript
// Primera vez que visitas:
1. Se genera activity_session_id único
2. Se guarda session_start timestamp
3. Se asocian todos los eventos a esta sesión

// Al navegar:
1. Se calcula session_duration
2. Se agrupa actividad por sesión
3. Se detectan patrones de uso

// Cuando cierras el navegador:
1. Session termina automáticamente
2. Próxima visita = nueva sesión
```

---

## 🚀 Innovaciones Futuras

### Planeado para el Futuro

1. **Consentimiento Granular**
   - Elegir específicamente qué eventos trackear
   - Desactivar tracking de ciertas páginas
   - Modo "incógnito" temporal

2. **Dashboard de Privacidad**
   - Ver exactamente qué datos tenemos
   - Descargar todos tus datos
   - Eliminar datos específicos

3. **Cookies de Primera Parte**
   - Sin cookies de terceros
   - Todo bajo nuestro dominio
   - Mayor privacidad

---

## 📞 Contacto

¿Preguntas sobre cookies o privacidad?

- 📧 **Email**: privacy@apidevs.io
- 📋 **Política de Privacidad**: [apidevs.io/privacy](https://apidevs.io/privacy)
- 🍪 **Gestionar Cookies**: [apidevs.io/account/configuracion](https://apidevs.io/account/configuracion)

---

## 📅 Última Actualización

**Fecha**: 1 de octubre de 2025  
**Versión**: 1.0

Esta política puede actualizarse. Te notificaremos de cambios importantes.

---

## ✅ Resumen Rápido

| ❓ Pregunta | ✅ Respuesta |
|-------------|-------------|
| ¿Usamos cookies? | Sí, para funcionalidad y analytics |
| ¿Vendemos tus datos? | **NO, NUNCA** |
| ¿Compartimos con terceros? | Solo servicios esenciales (Supabase, Stripe) |
| ¿Puedes rechazar? | Sí, las opcionales |
| ¿Puedes cambiar preferencias? | Sí, en cualquier momento |
| ¿Puedes eliminar tus datos? | Sí, desde configuración |
| ¿Cumplimos GDPR? | ✅ Sí |
| ¿Cumplimos CCPA? | ✅ Sí |

---

**¡Tu privacidad es importante para nosotros!** 🛡️

Si tienes dudas, no dudes en contactarnos. Estamos aquí para ayudarte.

