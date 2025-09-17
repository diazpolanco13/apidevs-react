# 🚀 Migración de Usuarios APIDevs

## 📊 Resumen
Migración de **6,478 usuarios** de WordPress a Supabase para APIDevs Trading Platform.

## 🔧 Instalación

```bash
cd data/migration
npm install
```

## ⚡ Ejecución

```bash
# Migrar todos los usuarios
npm run migrate
```

## 📋 Características

- ✅ **Migración por lotes** (100 usuarios por vez)
- ✅ **Validación de emails** automática
- ✅ **Manejo de duplicados** con upsert
- ✅ **Logs detallados** del progreso
- ✅ **Pausa entre lotes** para no sobrecargar DB
- ✅ **Estadísticas finales** de éxito/errores

## 🎯 Campos Migrados

### **📊 Datos Básicos:**
- `email` - Email principal (único)
- `full_name` - Nombre completo
- `country` - País (VE, CO, US, etc.)
- `city` - Ciudad
- `phone` - Teléfono en formato internacional
- `postal_code` - Código postal
- `address` - Dirección completa
- `wordpress_username` - Username original
- `billing_email` - Email de facturación
- `wordpress_created_at` - Fecha registro original

### **🏆 Identificación Legacy:**
- `customer_type` - 'legacy' (clientes antiguos)
- `legacy_customer` - true (identificador booleano)
- `legacy_benefits` - JSON con beneficios especiales
- `legacy_discount_percentage` - 50% descuento
- `wordpress_customer_id` - ID original de WordPress

### **📋 Control de Migración:**
- `migration_status` - Estado: 'imported'
- `migrated_at` - Timestamp de migración

## 📈 Resultado Esperado

- **6,478 usuarios** migrados exitosamente
- **Base completa** para dashboard administrativo
- **Datos listos** para campañas de re-engagement
