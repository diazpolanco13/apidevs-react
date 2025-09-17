import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardLayoutFull from '@/components/admin/AdminDashboardLayoutFull';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin?message=Acceso%20restringido%20-%20Inicia%20sesión%20para%20continuar');
  }

  // 🔒 CONTROL DE ACCESO EXCLUSIVO PARA USUARIO MASTER
  const MASTER_EMAIL = 'api@apidevs.io';
  
  if (user.email !== MASTER_EMAIL) {
    return redirect('/?message=Acceso%20denegado%20-%20Solo%20el%20administrador%20puede%20acceder%20al%20panel');
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      <AdminDashboardLayoutFull user={user}>{children}</AdminDashboardLayoutFull>
    </div>
  );
}

export const metadata = {
  title: 'Admin Dashboard - APIDevs Trading',
  description: 'Panel administrativo para gestión de usuarios legacy y analytics de APIDevs Trading Platform',
};