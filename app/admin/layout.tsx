import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from '@/components/ui/Toasts/toaster';

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
    <div className="fixed inset-0 z-50 flex bg-apidevs-dark">
      {/* Sidebar Fijo */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export const metadata = {
  title: 'Admin Dashboard - APIDevs Trading',
  description: 'Panel administrativo para gestión de usuarios legacy y analytics de APIDevs Trading Platform',
};