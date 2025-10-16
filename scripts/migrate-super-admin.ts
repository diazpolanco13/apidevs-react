#!/usr/bin/env tsx
/**
 * Script para migrar api@apidevs.io como Super Admin inicial
 * Este script debe ejecutarse UNA SOLA VEZ después de crear las tablas admin
 * 
 * Ejecutar: npx tsx scripts/migrate-super-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzieiqxlxfydvexalbsr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMzkwMiwiaWF0IjoxNjY5NjMzOTAyfQ.gzSreMkoo77Wt0nj_30_x2VfAbx7-Yg64Opdo27GFY8';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno requeridas');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SUPER_ADMIN_EMAIL = 'api@apidevs.io';

async function migrateSuperAdmin() {
  console.log('\n🚀 Iniciando migración de Super Admin...\n');

  try {
    // 1. Verificar que el usuario existe en auth.users
    console.log('1️⃣  Verificando usuario en auth.users...');
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Error al listar usuarios: ${authError.message}`);
    }

    const superAdminAuthUser = authUser.users.find(u => u.email === SUPER_ADMIN_EMAIL);
    
    if (!superAdminAuthUser) {
      console.log(`⚠️  Usuario ${SUPER_ADMIN_EMAIL} no encontrado en auth.users`);
      console.log('   Creando usuario en auth.users...');
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        email_confirm: true,
        user_metadata: {
          full_name: 'API Admin Master',
          is_super_admin: true
        }
      });

      if (createError) {
        throw new Error(`Error al crear usuario: ${createError.message}`);
      }

      console.log(`   ✅ Usuario creado: ${newUser.user.id}`);
    } else {
      console.log(`   ✅ Usuario encontrado: ${superAdminAuthUser.id}`);
    }

    // Obtener el usuario actualizado
    const userId = superAdminAuthUser?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === SUPER_ADMIN_EMAIL)?.id;

    if (!userId) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    // 2. Verificar que el rol 'super-admin' existe
    console.log('\n2️⃣  Verificando rol Super Admin...');
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('slug', 'super-admin')
      .single();

    if (roleError || !role) {
      throw new Error('Rol super-admin no encontrado. ¿Ejecutaste la migración de BD?');
    }

    console.log(`   ✅ Rol encontrado: ${role.name} (${role.id})`);

    // 3. Verificar si ya existe en admin_users
    console.log('\n3️⃣  Verificando si ya está en admin_users...');
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingAdmin) {
      console.log('   ⚠️  El usuario ya existe en admin_users');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.full_name}`);
      console.log(`   Rol: ${existingAdmin.role_id}`);
      console.log(`   Estado: ${existingAdmin.status}`);
      
      // Actualizar por si acaso
      console.log('\n   🔄 Actualizando información...');
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          role_id: role.id,
          status: 'active',
          full_name: 'API Admin Master',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.warn(`   ⚠️  Error al actualizar: ${updateError.message}`);
      } else {
        console.log('   ✅ Información actualizada correctamente');
      }
    } else {
      // 4. Insertar en admin_users
      console.log('\n4️⃣  Insertando en admin_users...');
      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: SUPER_ADMIN_EMAIL,
          full_name: 'API Admin Master',
          role_id: role.id,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Error al insertar en admin_users: ${insertError.message}`);
      }

      console.log('   ✅ Super Admin insertado correctamente');
      console.log(`   ID: ${newAdmin.id}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Nombre: ${newAdmin.full_name}`);
    }

    // 5. Verificar permisos
    console.log('\n5️⃣  Verificando permisos...');
    const { data: adminWithRole } = await supabase
      .from('admin_users')
      .select('*, admin_roles(*)')
      .eq('id', userId)
      .single();

    if (adminWithRole) {
      console.log('   ✅ Permisos cargados correctamente');
      console.log(`   Rol: ${adminWithRole.admin_roles.name}`);
      console.log(`   Slug: ${adminWithRole.admin_roles.slug}`);
      console.log(`   Permisos:`, Object.keys(adminWithRole.admin_roles.permissions).filter(
        key => adminWithRole.admin_roles.permissions[key] === true
      ).length, 'activos');
    }

    console.log('\n✨ ¡Migración completada exitosamente!\n');
    console.log('🔐 El usuario api@apidevs.io ahora es Super Admin');
    console.log('🌐 Puede acceder al panel admin en: http://localhost:3000/admin\n');

  } catch (error: any) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateSuperAdmin();

