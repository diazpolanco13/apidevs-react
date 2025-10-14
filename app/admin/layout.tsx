import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import { cache } from 'react';

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

  // 🔒 CONTROL DE ACCESO EXCLUSIVO PARA USUARIO MASTER
  const MASTER_EMAIL = 'api@apidevs.io';
  
  if (user.email !== MASTER_EMAIL) {
    const message = encodeURIComponent('Acceso denegado - Solo el administrador puede acceder al panel');
    return redirect(`/?message=${message}`);
  }

  const userName = user.email?.split('@')[0] || 'Admin';

  return (
    <AdminDashboardLayout userName={userName}>
      {children}
    </AdminDashboardLayout>
  );
}

export const metadata = {
  title: 'Admin Dashboard - APIDevs Trading',
  description: 'Panel administrativo para gestión de usuarios legacy y analytics de APIDevs Trading Platform',
};