import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import { cache } from 'react';
import { getAdminUser } from '@/utils/admin/permissions';

// 🔧 FIX: Cachear la función de autenticación para evitar rate limiting
// Esto previene múltiples llamadas a getUser() en el mismo request
const getAuthUser = cache(async () => {
  const supabase = await createClient();
  return await supabase.auth.getUser();
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { user },
  } = await getAuthUser(); // ← Ahora usa versión cacheada

  if (!user) {
    const message = encodeURIComponent('Acceso restringido - Inicia sesión para continuar');
    return redirect(`/signin?message=${message}`);
  }

  // 🔒 NUEVO SISTEMA: Verificar si es administrador activo en la BD
  const adminUser = await getAdminUser(user.id);
  
  if (!adminUser) {
    const message = encodeURIComponent('Acceso denegado - Solo administradores pueden acceder al panel');
    return redirect(`/?message=${message}`);
  }

  // Actualizar last_login_at
  const supabase = await createClient();
  await (supabase as any)
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  const userName = adminUser.full_name || adminUser.email.split('@')[0];

  return (
    <AdminDashboardLayout 
      userName={userName}
      userRole={adminUser.admin_roles.name}
      userEmail={adminUser.email}
    >
      {children}
    </AdminDashboardLayout>
  );
}

export const metadata = {
  title: 'Admin Dashboard - APIDevs Trading',
  description: 'Panel administrativo para gestión de usuarios legacy y analytics de APIDevs Trading Platform',
};