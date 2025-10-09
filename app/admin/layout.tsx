import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import { cache } from 'react';

// 🔧 FIX: Cachear la función de autenticación para evitar rate limiting
// Esto previene múltiples llamadas a getUser() en el mismo request
const getAuthUser = cache(async () => {
  const supabase = createClient();
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
    return redirect('/signin?message=Acceso%20restringido%20-%20Inicia%20sesión%20para%20continuar');
  }

  // 🔒 CONTROL DE ACCESO EXCLUSIVO PARA USUARIO MASTER
  const MASTER_EMAIL = 'api@apidevs.io';
  
  if (user.email !== MASTER_EMAIL) {
    return redirect('/?message=Acceso%20denegado%20-%20Solo%20el%20administrador%20puede%20acceder%20al%20panel');
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