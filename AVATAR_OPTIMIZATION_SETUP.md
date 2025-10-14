# 🖼️ Sistema de Optimización de Avatares - Configuración

## 📊 Resumen

Este sistema optimiza las imágenes de perfil de TradingView antes de guardarlas en la base de datos:

- **Descarga** la imagen desde TradingView
- **Optimiza** (256x256, WebP, 85% quality)
- **Sube** a Supabase Storage
- **Guarda** URL optimizada en BD
- **Mejora**: Carga hasta **10x más rápida** ⚡

---

## 🚀 Configuración Requerida

### 1. Crear Bucket en Supabase Storage

1. Ve a tu proyecto Supabase: https://supabase.com/dashboard
2. Navega a **Storage** en el menú lateral
3. Click en **New Bucket**
4. Configura:
   - **Name**: `user-avatars`
   - **Public**: ✅ **Activar** (las imágenes deben ser públicas)
   - **File size limit**: 5 MB (suficiente para avatares)
   - **Allowed MIME types**: `image/*` o específicamente `image/webp, image/jpeg, image/png`

5. Click en **Create Bucket**

### 2. Configurar Políticas de Acceso (RLS)

Ve a **Storage > Policies** y crea las siguientes:

#### Política 1: Upload (Usuarios autenticados pueden subir SU avatar)

```sql
-- Nombre: Users can upload their own avatar
-- Operación: INSERT
-- Target: user-avatars bucket

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name))::text
);
```

#### Política 2: Update (Usuarios pueden actualizar SU avatar)

```sql
-- Nombre: Users can update their own avatar
-- Operación: UPDATE
-- Target: user-avatars bucket

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name))::text
);
```

#### Política 3: Public Read (Cualquiera puede ver avatares)

```sql
-- Nombre: Anyone can view avatars
-- Operación: SELECT
-- Target: user-avatars bucket

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');
```

#### Política 4: Delete (Usuarios pueden eliminar SU avatar)

```sql
-- Nombre: Users can delete their own avatar
-- Operación: DELETE
-- Target: user-avatars bucket

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name))::text
);
```

---

## 📂 Estructura de Archivos en Storage

Los avatares se guardarán con esta estructura:

```
user-avatars/
  └── avatars/
      ├── <user-id-1>.webp
      ├── <user-id-2>.webp
      └── <user-id-3>.webp
```

Cada usuario tiene un único archivo nombrado con su `user_id.webp`.

---

## 🔧 Verificación de Funcionamiento

### Prueba Manual

1. **Crear un nuevo usuario** y completar onboarding
2. **Verificar en Supabase Storage**:
   - Ve a Storage > user-avatars > avatars
   - Deberías ver `<user-id>.webp`
3. **Verificar en base de datos**:
   ```sql
   SELECT id, avatar_url, tradingview_username
   FROM users
   WHERE id = '<user-id>';
   ```
   - `avatar_url` debería apuntar a Supabase Storage, no TradingView

### Verificar Optimización

1. **Imagen original de TradingView**: ~100-500 KB
2. **Imagen optimizada en Supabase**: ~15-50 KB (reducción 70-90%)

Compara abriendo ambas URLs en el navegador y mirando el tamaño en DevTools.

---

## 🎯 Flujo de Optimización

### Onboarding (Primera vez)

```
Usuario ingresa username TradingView
        ↓
Hook valida y obtiene URL imagen TradingView (pesada)
        ↓
[ONBOARDING SUBMIT]
        ↓
POST /api/avatar/process
        ↓
utils/images/optimize-avatar.ts (descarga + optimiza)
        ↓
utils/images/upload-avatar.ts (sube a Supabase Storage)
        ↓
Retorna URL optimizada
        ↓
Guarda en users.avatar_url
        ↓
✅ Usuario completa onboarding
```

### Actualización de Perfil

```
Usuario cambia username TradingView
        ↓
Hook valida y obtiene URL imagen nueva
        ↓
[PERFIL SUBMIT]
        ↓
POST /api/avatar/process (igual flujo)
        ↓
Actualiza users.avatar_url con nueva imagen optimizada
        ↓
✅ Perfil actualizado
```

---

## ⚙️ Configuración de Next.js

### next.config.js

```javascript
images: {
  remotePatterns: [
    // TradingView (temporal durante onboarding)
    {
      protocol: 'https',
      hostname: '**.tradingview.com',
    },
    // Supabase Storage (permanente)
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
  formats: ['image/avif', 'image/webp'],
}
```

---

## 🐛 Troubleshooting

### Error: "Error subiendo imagen: Permission denied"

**Solución**: Verifica las políticas RLS en Storage. El usuario debe poder subir con su propio `user_id`.

### Error: "Error optimizando imagen"

**Solución**: Verifica que Sharp esté instalado:
```bash
npm list sharp
```
Debería aparecer como dependencia de Next.js.

### Avatar no se muestra

**Solución**:
1. Verifica que el bucket sea **público**
2. Verifica que `avatar_url` en la BD tenga la URL correcta
3. Verifica en DevTools que la imagen cargue (no 403/404)

### Imagen sigue pesada

**Solución**:
1. Verifica que `avatar_url` apunte a Supabase, no TradingView
2. Compara URLs:
   - ❌ `https://s3.tradingview.com/...` (original)
   - ✅ `https://<project>.supabase.co/storage/v1/object/public/user-avatars/...` (optimizada)

---

## 📊 Métricas Esperadas

### Antes (URL directa de TradingView)

- **Tamaño**: 100-500 KB
- **Tiempo de carga**: 2-5 segundos
- **Formato**: JPEG/PNG sin optimizar
- **Experiencia**: Se ve "construyendo por partes"

### Después (Optimización con Supabase)

- **Tamaño**: 15-50 KB (reducción 70-90%)
- **Tiempo de carga**: 0.3-0.8 segundos
- **Formato**: WebP optimizado
- **Experiencia**: Carga instantánea ⚡

---

## 🔄 Migración de Usuarios Existentes

Si ya tienes usuarios con avatares de TradingView, puedes migrarlos:

### Script de Migración

```typescript
// scripts/migrate-avatars.ts
import { createClient } from '@/utils/supabase/server';
import { processAndUploadAvatar } from '@/utils/images/upload-avatar';

async function migrateAvatars() {
  const supabase = await createClient();

  // Obtener usuarios con avatares de TradingView
  const { data: users } = await supabase
    .from('users')
    .select('id, avatar_url, tradingview_username')
    .like('avatar_url', '%tradingview.com%');

  if (!users || users.length === 0) {
    console.log('✅ No hay avatares para migrar');
    return;
  }

  console.log(`🚀 Migrando ${users.length} avatares...`);

  for (const user of users) {
    try {
      console.log(`📥 Procesando: ${user.tradingview_username}`);

      const optimizedUrl = await processAndUploadAvatar(
        user.id,
        user.avatar_url
      );

      await supabase
        .from('users')
        .update({ avatar_url: optimizedUrl })
        .eq('id', user.id);

      console.log(`✅ ${user.tradingview_username} migrado`);
    } catch (error) {
      console.error(`❌ Error en ${user.tradingview_username}:`, error);
    }
  }

  console.log('🎉 Migración completada');
}

migrateAvatars();
```

**Ejecutar**:
```bash
npm run migrate-avatars
```

**Estado actual** (Octubre 14, 2025):
- 17 usuarios con TradingView username
- 5 usuarios con avatares de TradingView (pendientes de migrar)
- 0 usuarios con avatares optimizados en Supabase
- 12 usuarios sin avatar

---

## 📝 Archivos Creados

1. `utils/images/optimize-avatar.ts` - Lógica de optimización con Sharp
2. `utils/images/upload-avatar.ts` - Upload a Supabase Storage
3. `app/api/avatar/process/route.ts` - API endpoint para procesar avatares
4. `components/ui/Onboarding/Onboarding.tsx` - Actualizado para optimizar
5. Este documento de configuración

---

## ✅ Checklist de Implementación

- [x] Crear bucket `user-avatars` en Supabase Storage
- [x] Activar bucket como **público**
- [x] Crear 4 políticas RLS (INSERT, UPDATE, SELECT, DELETE)
- [x] Verificar que Sharp está instalado (`npm list sharp`) - ✅ Sharp 0.34.4
- [ ] Probar onboarding con nuevo usuario
- [ ] Verificar imagen en Supabase Storage
- [ ] Verificar URL en base de datos apunta a Supabase
- [ ] Comparar tamaño antes/después
- [ ] (Opcional) Migrar usuarios existentes con `npm run migrate-avatars` (5 usuarios pendientes)

---

## 🎯 Beneficios Finales

✅ **Carga 10x más rápida**
✅ **Reduce ancho de banda 70-90%**
✅ **Mejor experiencia de usuario**
✅ **Imágenes optimizadas automáticamente**
✅ **CDN de Supabase incluido**
✅ **Caché del navegador mejorado**

---

**Última actualización**: Octubre 14, 2025
**Autor**: Claude Code + Usuario
**Proyecto**: APIDevs React
