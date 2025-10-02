# 🍪 Guía de Integración del Banner de Cookies

## 📋 Archivos Creados

1. ✅ **`contexts/CookieConsentContext.tsx`** - Contexto de React para gestionar consentimiento
2. ✅ **`components/CookieBanner.tsx`** - Componente visual del banner
3. ✅ **`hooks/useActivityTracker.ts`** - Actualizado para respetar consentimiento
4. ✅ **`docs/COOKIES-POLICY.md`** - Documentación completa sobre cookies

---

## 🚀 Pasos para Activar el Banner

### 1️⃣ Envolver tu App con el Provider

En tu archivo `app/layout.tsx` o el layout raíz:

```tsx
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import CookieBanner from '@/components/CookieBanner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <CookieConsentProvider>
          {children}
          <CookieBanner />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
```

---

### 2️⃣ Usar el Hook en tus Componentes

#### Ejemplo: Verificar consentimiento antes de trackear

```tsx
'use client';

import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { useActivityTracker } from '@/hooks/useActivityTracker';

export default function MyComponent() {
  const { preferences } = useCookieConsent();
  const { trackPageView } = useActivityTracker();

  useEffect(() => {
    // El hook ya verifica consentimiento automáticamente
    // pero puedes verificarlo manualmente si lo necesitas
    if (preferences.analytics) {
      trackPageView('Mi Página');
    }
  }, [preferences.analytics]);

  return <div>...</div>;
}
```

---

### 3️⃣ Agregar Página de Configuración de Cookies

En `app/account/configuracion/page.tsx` o donde prefieras:

```tsx
'use client';

import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Shield, BarChart3, Target, RefreshCw } from 'lucide-react';

export default function PrivacySettingsPage() {
  const { preferences, setCustomPreferences, resetConsent } = useCookieConsent();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Privacidad y Cookies</h1>

      {/* Sección de Cookies */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Gestión de Cookies</h2>
        
        {/* Essential */}
        <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl mb-3">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-white font-medium">Cookies Esenciales</div>
              <div className="text-gray-400 text-sm">Necesarias para el funcionamiento</div>
            </div>
          </div>
          <span className="text-green-400 text-sm font-medium">Siempre activo</span>
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl mb-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-white font-medium">Analytics</div>
              <div className="text-gray-400 text-sm">Nos ayuda a mejorar tu experiencia</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setCustomPreferences({ analytics: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-checked:bg-blue-500 rounded-full peer transition-colors"></div>
          </label>
        </div>

        {/* Marketing */}
        <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-white font-medium">Marketing</div>
              <div className="text-gray-400 text-sm">Contenido personalizado (futuro)</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setCustomPreferences({ marketing: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-checked:bg-purple-500 rounded-full peer transition-colors"></div>
          </label>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetConsent}
          className="mt-4 w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Restablecer Preferencias
        </button>
      </div>
    </div>
  );
}
```

---

### 4️⃣ Crear Página de Política de Cookies

En `app/cookies/page.tsx`:

```tsx
import fs from 'fs';
import path from 'path';
import { marked } from 'marked'; // npm install marked

export default async function CookiePolicyPage() {
  const filePath = path.join(process.cwd(), 'docs', 'COOKIES-POLICY.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const htmlContent = marked(fileContent);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article 
        className="prose prose-invert prose-lg"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
```

---

## 🎨 Personalización del Banner

### Cambiar Colores

En `components/CookieBanner.tsx`, busca las clases de Tailwind y cámbialas:

```tsx
// Cambiar color principal del botón "Aceptar Todas"
className="bg-gradient-to-r from-blue-500 to-cyan-500" // Tu color

// Cambiar color del borde
className="border border-blue-500/30" // Tu color
```

### Cambiar Posición

```tsx
// Banner en la parte superior
<div className="fixed top-0 left-0 right-0 z-[9999]...">

// Banner a la derecha
<div className="fixed bottom-4 right-4 z-[9999] max-w-md...">
```

### Cambiar Animación

```tsx
// Desde abajo (actual)
className="animate-in slide-in-from-bottom"

// Desde arriba
className="animate-in slide-in-from-top"

// Fade in
className="animate-in fade-in"
```

---

## 🔧 Características Incluidas

### ✅ Funcionalidades

- [x] Banner responsive (móvil y desktop)
- [x] Modal de configuración detallada
- [x] Tres opciones: Aceptar todas, Solo esenciales, Personalizar
- [x] Persistencia en LocalStorage
- [x] Integración con Activity Tracker
- [x] Respeta preferencias de usuario
- [x] No molesta después de aceptar
- [x] Se puede resetear desde configuración
- [x] Animaciones suaves
- [x] Diseño moderno y profesional

### ✅ Cumplimiento Legal

- [x] GDPR compliant (Europa)
- [x] CCPA compliant (California)
- [x] LGPD compliant (Brasil)
- [x] Consentimiento explícito
- [x] Cookies no esenciales desactivadas por defecto
- [x] Opción de rechazar
- [x] Información clara y transparente

---

## 📊 Verificar Funcionamiento

### 1. Primera Visita

1. Abre tu app en incógnito
2. Deberías ver el banner después de 1 segundo
3. Intenta las 3 opciones:
   - ✅ "Aceptar Todas" → Guarda todo como true
   - ✅ "Solo Esenciales" → Solo esenciales true
   - ✅ "Personalizar" → Modal con opciones detalladas

### 2. Verificar LocalStorage

Abre DevTools → Application → Local Storage:

```javascript
// Deberías ver:
cookies_consent: "accepted"
cookie_preferences: {"essential":true,"analytics":true,"marketing":false}
analytics_enabled: "true"
marketing_enabled: "false"
```

### 3. Verificar que NO trackea sin consentimiento

```javascript
// En la consola, con analytics desactivado:
localStorage.setItem('analytics_enabled', 'false');

// Intenta trackear algo:
// Deberías ver: "🍪 Analytics tracking disabled - no consent"
```

---

## 🚨 Troubleshooting

### El banner no aparece

1. Verifica que el Provider esté en el layout raíz
2. Verifica que `<CookieBanner />` esté dentro del Provider
3. Limpia LocalStorage y recarga

### El tracking sigue funcionando aunque rechacé

1. Verifica que `useActivityTracker` tenga la actualización de consentimiento
2. Verifica que `hasAnalyticsConsent()` esté funcionando
3. Limpia LocalStorage y prueba de nuevo

### El modal no cierra

1. Verifica que los botones tengan `onClick` correcto
2. Verifica que `setShowSettings(false)` se llame
3. Revisa la consola por errores

---

## 🎯 Próximos Pasos

1. [ ] **Aplicar migración** de `user_activity_log` a Supabase
2. [ ] **Integrar Provider** en el layout raíz
3. [ ] **Agregar CookieBanner** al layout
4. [ ] **Crear página** de política de cookies (`/cookies`)
5. [ ] **Agregar sección** de cookies en configuración
6. [ ] **Probar en localhost** con diferentes escenarios
7. [ ] **Desplegar a producción** y verificar

---

## 📞 Soporte

Si tienes problemas con la integración:

1. Revisa esta guía
2. Revisa los comentarios en el código
3. Consulta `docs/COOKIES-POLICY.md`
4. Verifica la consola del navegador

---

## ✨ Resultado Final

Una vez integrado, tendrás:

✅ **Banner de Cookies Profesional**
- Diseño moderno y atractivo
- Responsive para móvil y desktop
- Animaciones suaves

✅ **Cumplimiento Legal**
- GDPR, CCPA, LGPD compliant
- Consentimiento explícito
- Información transparente

✅ **UX Excelente**
- No intrusivo
- Fácil de entender
- Opciones claras
- Persistencia de preferencias

✅ **Integración Completa**
- Activity Tracker respeta consentimiento
- Configuración desde el perfil
- Política de cookies detallada

**¡Tu aplicación estará lista para producción con cookies bien implementadas!** 🎉

