# 🚀 Setup de Sanity CMS - Instrucciones

## Paso 1: Crear Proyecto en Sanity

1. **Ir a Sanity Management Console**
   - Abrir: https://www.sanity.io/manage
   - Iniciar sesión con Google o GitHub

2. **Crear Nuevo Proyecto**
   - Click en "Create project"
   - Nombre: `APIDevs Indicators`
   - Seleccionar: "Clean project" (sin template)
   - Click "Create"

3. **Anotar el Project ID**
   - Después de crear, verás el **Project ID** (ejemplo: `abc123xyz`)
   - ⚠️ **IMPORTANTE**: Copia este ID

4. **Configurar Dataset**
   - Por defecto se crea el dataset `production`
   - Si no existe, ir a "Datasets" y crear `production`

## Paso 2: Crear API Token

1. En tu proyecto, ir a **Settings** → **API** → **Tokens**

2. Click en **"Add API token"**

3. Configurar:
   - **Name**: `Next.js Frontend`
   - **Permissions**: Seleccionar **"Viewer"** (solo lectura)
   - Click "Save"

4. **⚠️ COPIAR EL TOKEN INMEDIATAMENTE**
   - Solo se muestra una vez
   - Ejemplo: `skAbC123...xyz`

## Paso 3: Configurar Variables de Entorno

1. **Crear archivo `.env.local`** en la raíz del proyecto (si no existe)

2. **Agregar estas líneas** con tus valores:

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz  # ← Tu Project ID
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skAbC123...xyz          # ← Tu API Token
```

## Paso 4: Verificar Instalación

Una vez hayas configurado las variables de entorno:

1. **Reiniciar el servidor** (si está corriendo)
   ```bash
   # Detener con Ctrl+C
   npm run dev
   ```

2. **Ir a Sanity Studio**
   - Abrir: http://localhost:3000/studio
   - Deberías ver la pantalla de login de Sanity

3. **Iniciar sesión**
   - Login con la misma cuenta de Sanity
   - Deberías ver el Studio con la opción "Indicador"

## ✅ Verificación

Si todo está correcto, verás:
- ✅ Sanity Studio cargando en `/studio`
- ✅ Opción "Indicador" en el menú lateral
- ✅ Sin errores en la consola

## 🐛 Problemas Comunes

### Error: "Project ID is required"
- Verifica que `.env.local` tenga `NEXT_PUBLIC_SANITY_PROJECT_ID`
- Reinicia el servidor

### Error: "Failed to fetch"
- Verifica el API Token en `.env.local`
- Asegúrate que el token tiene permisos de "Viewer"

### No aparece el Studio
- Verifica que la ruta sea exactamente `/studio` (no `/sanity`)
- Revisa la consola del navegador para errores

## 📞 Soporte

Si tienes problemas:
1. Verifica que todas las variables estén en `.env.local`
2. Revisa que no haya espacios extra en las variables
3. Asegúrate de haber reiniciado el servidor después de agregar variables

---

**Siguiente paso**: Una vez que veas el Studio funcionando, ejecutaremos el script de migración para traer los indicadores de Supabase.

