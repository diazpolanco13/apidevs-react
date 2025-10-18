'use client';

import { useState } from 'react';
import { Settings, FileText, Palette, Users, Save, RefreshCw, TestTube } from 'lucide-react';

interface Props {
  config: any;
  setConfig: (config: any) => void;
}

export default function CreadorContenidoTab({ config, setConfig }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'configuracion' | 'cola' | 'templates'>('configuracion');
  const [isLoading, setIsLoading] = useState(false);

  const subTabs = [
    {
      id: 'configuracion' as const,
      name: 'Configuración Creator',
      description: 'Modo de publicación, imágenes, SEO',
      icon: Settings,
    },
    {
      id: 'cola' as const,
      name: 'Cola de Contenido',
      description: 'Pendientes de revisión',
      icon: FileText,
    },
    {
      id: 'templates' as const,
      name: 'Templates',
      description: 'Plantillas de contenido',
      icon: Palette,
    },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Implementar guardado de configuración
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-1 -mb-px">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  group relative flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all
                  ${
                    isActive
                      ? 'border-apidevs-primary text-apidevs-primary'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }
                `}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-apidevs-primary' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{tab.name}</span>
                  <span
                    className={`text-[10px] leading-tight ${
                      isActive ? 'text-apidevs-primary/70' : 'text-gray-500'
                    }`}
                  >
                    {tab.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sub-tab Content */}
      <div className="mt-6">
        {activeSubTab === 'configuracion' && (
          <div className="space-y-6">
            {/* Modo de Publicación */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-apidevs-primary" />
                Modo de Publicación
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="publishMode"
                      value="draft"
                      defaultChecked
                      className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600 bg-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Modo Borrador (Recomendado)</span>
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Guarda como draft, requiere aprobación manual
                </p>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="publishMode"
                      value="auto"
                      className="h-4 w-4 text-apidevs-primary focus:ring-apidevs-primary border-gray-600 bg-gray-700"
                    />
                    <span className="ml-2 text-gray-300">Modo Automático</span>
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Publica directamente en status "published" ⚠️ Sin revisión humana
                </p>
              </div>
            </div>

            {/* Generación de Imágenes */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-apidevs-primary" />
                Generación de Imágenes con Grok
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Habilitar generación automática</label>
                    <p className="text-xs text-gray-400">Genera imágenes para posts de blog automáticamente</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apidevs-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apidevs-primary"></div>
                  </label>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    API Key de Grok
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Ingresa tu API key de Grok..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 focus:border-transparent"
                    />
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                      Test
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Límites de Seguridad */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-apidevs-primary" />
                Límites de Seguridad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Máximo posts por día
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Máximo tokens por día
                  </label>
                  <input
                    type="number"
                    defaultValue={100000}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  <span className="text-apidevs-primary">Usados hoy:</span> 3/10 posts | 12,450 tokens
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'cola' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-apidevs-primary" />
                Cola de Contenido
              </h3>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay contenido pendiente de revisión</p>
                <p className="text-sm text-gray-500 mt-2">
                  El contenido generado aparecerá aquí para revisión
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-apidevs-primary" />
                Templates de Contenido
              </h3>
              <div className="text-center py-12">
                <Palette className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Templates personalizados</p>
                <p className="text-sm text-gray-500 mt-2">
                  Configura plantillas para diferentes tipos de contenido
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Recargar
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
