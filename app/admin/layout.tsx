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

  // TEMPORAL: Sin verificación de admin para debugging
  // TODO: Implementar role checking en producción

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export const metadata = {
  title: 'Admin Dashboard - APIDevs Trading',
  description: 'Panel administrativo para gestión de usuarios legacy y analytics de APIDevs Trading Platform',
};