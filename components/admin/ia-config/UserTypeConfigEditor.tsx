"use client";

import { Users, ChevronDown, ChevronUp, Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";

interface UserTypeConfig {
  label: string;
  greeting_template: string;
  capabilities: string[];
  restrictions: string[];
  tone: string;
  show_pricing: boolean;
  show_discounts: boolean;
  call_to_action: string | null;
  highlight_benefits?: boolean;
  priority_support?: boolean;
  vip_treatment?: boolean;
  calculate_discount?: boolean;
  emphasize_loyalty?: boolean;
  show_upgrade_lifetime?: boolean;
  early_access_features?: boolean;
}

interface UserTypeConfigs {
  visitor: UserTypeConfig;
  registered_no_purchase: UserTypeConfig;
  pro_active: UserTypeConfig;
  lifetime: UserTypeConfig;
  legacy: UserTypeConfig;
}

interface UserTypeConfigEditorProps {
  configs: UserTypeConfigs;
  onChange: (configs: UserTypeConfigs) => void;
}

export default function UserTypeConfigEditor({ configs, onChange }: UserTypeConfigEditorProps) {
  const [expandedType, setExpandedType] = useState<string | null>('visitor');
  const [previewType, setPreviewType] = useState<string | null>(null);

  const userTypes = [
    { 
      key: 'visitor', 
      icon: '👤', 
      label: 'Visitantes', 
      color: 'gray',
      description: 'Sin cuenta registrada'
    },
    { 
      key: 'registered_no_purchase', 
      icon: '📝', 
      label: 'Registrados sin compra', 
      color: 'blue',
      description: 'Cuenta creada, sin plan activo'
    },
    { 
      key: 'pro_active', 
      icon: '⭐', 
      label: 'Plan PRO', 
      color: 'purple',
      description: 'Suscripción PRO activa'
    },
    { 
      key: 'lifetime', 
      icon: '♾️', 
      label: 'Lifetime', 
      color: 'green',
      description: 'Acceso de por vida'
    },
    { 
      key: 'legacy', 
      icon: '🏆', 
      label: 'Clientes Legacy', 
      color: 'yellow',
      description: 'Clientes históricos de WordPress'
    },
  ];

  const handleConfigChange = (userType: string, field: string, value: any) => {
    onChange({
      ...configs,
      [userType]: {
        ...configs[userType as keyof UserTypeConfigs],
        [field]: value,
      },
    });
  };

  const handleArrayChange = (userType: string, field: 'capabilities' | 'restrictions', index: number, value: string) => {
    const config = configs[userType as keyof UserTypeConfigs];
    const newArray = [...config[field]];
    newArray[index] = value;
    handleConfigChange(userType, field, newArray);
  };

  const addArrayItem = (userType: string, field: 'capabilities' | 'restrictions') => {
    const config = configs[userType as keyof UserTypeConfigs];
    handleConfigChange(userType, field, [...config[field], ""]);
  };

  const removeArrayItem = (userType: string, field: 'capabilities' | 'restrictions', index: number) => {
    const config = configs[userType as keyof UserTypeConfigs];
    const newArray = config[field].filter((_, i) => i !== index);
    handleConfigChange(userType, field, newArray);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Configuración por Tipo de Usuario</h3>
            <p className="text-sm text-gray-400">Define cómo el chatbot trata a cada tipo de usuario</p>
          </div>
        </div>
      </div>

      {/* User Types List */}
      <div className="space-y-3">
        {userTypes.map(({ key, icon, label, color, description }) => {
          const isExpanded = expandedType === key;
          const config = configs[key as keyof UserTypeConfigs];
          const isPreview = previewType === key;

          return (
            <div
              key={key}
              className={`bg-${color}-500/5 border border-${color}-500/20 rounded-lg overflow-hidden transition-all ${
                isExpanded ? 'ring-2 ring-' + color + '-500/40' : ''
              }`}
            >
              {/* Header Click */}
              <button
                onClick={() => setExpandedType(isExpanded ? null : key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="text-left">
                    <div className={`font-bold text-${color}-400`}>{label}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPreview ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewType(null);
                      }}
                      className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 cursor-pointer transition-colors"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          setPreviewType(null);
                        }
                      }}
                    >
                      <EyeOff className="w-4 h-4" />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewType(key);
                      }}
                      className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          setPreviewType(key);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 text-${color}-400`} />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Preview Mode */}
              {isPreview && !isExpanded && (
                <div className="px-4 py-3 border-t border-white/10 bg-black/20">
                  <div className="text-xs text-gray-400 mb-2">Vista Previa del Saludo:</div>
                  <div className="p-3 bg-gray-900/50 rounded-lg text-sm text-white whitespace-pre-wrap">
                    {config.greeting_template}
                  </div>
                  {config.call_to_action && (
                    <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                      🎯 CTA: {config.call_to_action}
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Edit Mode */}
              {isExpanded && (
                <div className="px-4 py-4 border-t border-white/10 space-y-4">
                  {/* Label */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Etiqueta Interna
                    </label>
                    <input
                      type="text"
                      value={config.label}
                      onChange={(e) => handleConfigChange(key, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Greeting Template */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Plantilla de Saludo
                      <span className="ml-2 text-gray-500">(Soporta variables: {'{user_name}'}, {'{total_indicators}'}, {'{legacy_discount_percentage}'}, {'{customer_since}'})</span>
                    </label>
                    <textarea
                      value={config.greeting_template}
                      onChange={(e) => handleConfigChange(key, 'greeting_template', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono resize-none"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {config.greeting_template.length} caracteres
                    </div>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Tono de Conversación
                    </label>
                    <input
                      type="text"
                      value={config.tone}
                      onChange={(e) => handleConfigChange(key, 'tone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: amigable y motivador, profesional y técnico, exclusivo y premium"
                    />
                  </div>

                  {/* Capabilities */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Capacidades Habilitadas
                    </label>
                    <div className="space-y-2">
                      {config.capabilities.map((cap, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={cap}
                            onChange={(e) => handleArrayChange(key, 'capabilities', index, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Ej: info_general, pricing, account_info"
                          />
                          <button
                            onClick={() => removeArrayItem(key, 'capabilities', index)}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem(key, 'capabilities')}
                        className="w-full px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 hover:bg-green-500/20 text-xs"
                      >
                        + Agregar Capacidad
                      </button>
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Restricciones
                    </label>
                    <div className="space-y-2">
                      {config.restrictions.map((res, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={res}
                            onChange={(e) => handleArrayChange(key, 'restrictions', index, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Ej: no_personal_data, no_premium_indicators"
                          />
                          <button
                            onClick={() => removeArrayItem(key, 'restrictions', index)}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addArrayItem(key, 'restrictions')}
                        className="w-full px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 text-xs"
                      >
                        + Agregar Restricción
                      </button>
                    </div>
                  </div>

                  {/* Boolean Flags */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.show_pricing}
                        onChange={(e) => handleConfigChange(key, 'show_pricing', e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                      />
                      Mostrar Precios
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.show_discounts}
                        onChange={(e) => handleConfigChange(key, 'show_discounts', e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                      />
                      Mostrar Descuentos
                    </label>

                    {config.hasOwnProperty('highlight_benefits') && (
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.highlight_benefits || false}
                          onChange={(e) => handleConfigChange(key, 'highlight_benefits', e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        />
                        Destacar Beneficios
                      </label>
                    )}

                    {config.hasOwnProperty('priority_support') && (
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.priority_support || false}
                          onChange={(e) => handleConfigChange(key, 'priority_support', e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        />
                        Soporte Prioritario
                      </label>
                    )}

                    {config.hasOwnProperty('vip_treatment') && (
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.vip_treatment || false}
                          onChange={(e) => handleConfigChange(key, 'vip_treatment', e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        />
                        Tratamiento VIP
                      </label>
                    )}

                    {config.hasOwnProperty('calculate_discount') && (
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.calculate_discount || false}
                          onChange={(e) => handleConfigChange(key, 'calculate_discount', e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        />
                        Calcular Descuentos
                      </label>
                    )}

                    {config.hasOwnProperty('emphasize_loyalty') && (
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.emphasize_loyalty || false}
                          onChange={(e) => handleConfigChange(key, 'emphasize_loyalty', e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        />
                        Enfatizar Lealtad
                      </label>
                    )}

                    {config.hasOwnProperty('show_upgrade_lifetime') && (
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.show_upgrade_lifetime || false}
                          onChange={(e) => handleConfigChange(key, 'show_upgrade_lifetime', e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        />
                        Sugerir Upgrade a Lifetime
                      </label>
                    )}

                    {config.hasOwnProperty('early_access_features') && (
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.early_access_features || false}
                          onChange={(e) => handleConfigChange(key, 'early_access_features', e.target.checked)}
                          className="w-4 h-4 rounded bg-gray-900/50 border-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
                        />
                        Acceso Anticipado
                      </label>
                    )}
                  </div>

                  {/* Call to Action */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Call to Action (CTA)
                      <span className="ml-2 text-gray-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={config.call_to_action || ''}
                      onChange={(e) => handleConfigChange(key, 'call_to_action', e.target.value || null)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: ¿Te gustaría activar tu plan PRO?"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
        <p className="text-xs text-purple-400">
          💡 <strong>Variables disponibles:</strong> {'{user_name}'}, {'{total_indicators}'}, {'{legacy_discount_percentage}'}, {'{customer_since}'}
        </p>
      </div>
    </div>
  );
}

