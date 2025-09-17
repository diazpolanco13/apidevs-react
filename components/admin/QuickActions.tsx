import Link from 'next/link';
import {
  UserPlusIcon,
  EnvelopeIcon,
  ChartPieIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function QuickActions() {
  const actions = [
    {
      name: 'Añadir Usuario Manual',
      description: 'Registrar un nuevo usuario o cliente legacy.',
      icon: UserPlusIcon,
      href: '/admin/users/add'
    },
    {
      name: 'Enviar Campaña Email',
      description: 'Crear y enviar un email a un segmento de usuarios.',
      icon: EnvelopeIcon,
      href: '/admin/campaigns/email/new'
    },
    {
      name: 'Ver Reporte de Ingresos',
      description: 'Acceder a un análisis detallado de los ingresos.',
      icon: ChartPieIcon,
      href: '/admin/analytics/revenue'
    },
    {
      name: 'Sincronizar Datos Stripe',
      description: 'Forzar una sincronización manual de productos y precios.',
      icon: ArrowPathIcon,
      href: '/admin/settings/sync-stripe'
    }
  ];

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-apidevs-primary/20 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
      <div className="space-y-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-start p-4 bg-gray-800/50 rounded-md hover:bg-gray-700/50 transition-colors duration-200"
          >
            <action.icon className="h-6 w-6 text-apidevs-primary mr-4 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-white">{action.name}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}