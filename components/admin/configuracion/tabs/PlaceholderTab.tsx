'use client';

import { LucideIcon } from 'lucide-react';

interface PlaceholderTabProps {
  tabName: string;
  icon: LucideIcon;
}

export default function PlaceholderTab({ tabName, icon: Icon }: PlaceholderTabProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-6 p-4 bg-purple-500/10 rounded-full border border-purple-500/20">
          <Icon className="w-16 h-16 text-purple-400" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {tabName}
        </h3>

        {/* Description */}
        <p className="text-gray-400 mb-6">
          Esta sección estará disponible próximamente. Estamos trabajando en implementar todas las funcionalidades de configuración del sistema.
        </p>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium border border-purple-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          En desarrollo
        </div>

        {/* Features Preview */}
        <div className="mt-8 w-full">
          <div className="text-left">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Próximas funcionalidades:
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">▸</span>
                <span>Gestión completa de configuraciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">▸</span>
                <span>Interfaz intuitiva y fácil de usar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">▸</span>
                <span>Validaciones y controles de seguridad</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

