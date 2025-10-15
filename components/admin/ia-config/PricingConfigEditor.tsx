"use client";

import { DollarSign, Edit2, Save, X } from "lucide-react";
import { useState } from "react";

interface Plan {
  name: string;
  price: number;
  currency: string;
  billing?: string;
  discount?: string;
  features: string[];
}

interface PricingConfig {
  plans: {
    free: Plan;
    pro_monthly: Plan;
    pro_yearly: Plan;
    lifetime: Plan;
  };
}

interface PricingConfigEditorProps {
  pricingConfig: PricingConfig;
  onChange: (config: PricingConfig) => void;
}

export default function PricingConfigEditor({ pricingConfig, onChange }: PricingConfigEditorProps) {
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const planKeys = Object.keys(pricingConfig.plans) as Array<keyof typeof pricingConfig.plans>;

  const handlePlanChange = (planKey: string, field: string, value: any) => {
    onChange({
      plans: {
        ...pricingConfig.plans,
        [planKey]: {
          ...pricingConfig.plans[planKey as keyof typeof pricingConfig.plans],
          [field]: value,
        },
      },
    });
  };

  const handleFeatureChange = (planKey: string, index: number, value: string) => {
    const plan = pricingConfig.plans[planKey as keyof typeof pricingConfig.plans];
    const newFeatures = [...plan.features];
    newFeatures[index] = value;
    handlePlanChange(planKey, 'features', newFeatures);
  };

  const addFeature = (planKey: string) => {
    const plan = pricingConfig.plans[planKey as keyof typeof pricingConfig.plans];
    handlePlanChange(planKey, 'features', [...plan.features, ""]);
  };

  const removeFeature = (planKey: string, index: number) => {
    const plan = pricingConfig.plans[planKey as keyof typeof pricingConfig.plans];
    const newFeatures = plan.features.filter((_, i) => i !== index);
    handlePlanChange(planKey, 'features', newFeatures);
  };

  const getPlanColor = (planKey: string) => {
    const colors: Record<string, string> = {
      free: 'gray',
      pro_monthly: 'blue',
      pro_yearly: 'purple',
      lifetime: 'green',
    };
    return colors[planKey] || 'gray';
  };

  const getPlanIcon = (planKey: string) => {
    const icons: Record<string, string> = {
      free: '🆓',
      pro_monthly: '📅',
      pro_yearly: '📆',
      lifetime: '♾️',
    };
    return icons[planKey] || '💎';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-500/10">
          <DollarSign className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Configuración de Precios</h3>
          <p className="text-sm text-gray-400">Define los planes y precios que el chatbot usará en sus respuestas</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {planKeys.map((planKey) => {
          const plan = pricingConfig.plans[planKey];
          const color = getPlanColor(planKey);
          const icon = getPlanIcon(planKey);
          const isEditing = editingPlan === planKey;

          return (
            <div
              key={planKey}
              className={`bg-${color}-500/5 border border-${color}-500/20 rounded-lg p-4 hover:border-${color}-500/40 transition-all`}
            >
              {/* Plan Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <span className={`text-lg font-bold text-${color}-400`}>
                    {plan.name}
                  </span>
                </div>
                <button
                  onClick={() => setEditingPlan(isEditing ? null : planKey)}
                  className={`p-2 rounded-lg ${
                    isEditing 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-700/50 text-gray-400 hover:text-white'
                  } transition-colors`}
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  {/* Nombre */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nombre del Plan</label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => handlePlanChange(planKey, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Precio */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Precio</label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => handlePlanChange(planKey, 'price', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Moneda</label>
                      <select
                        value={plan.currency}
                        onChange={(e) => handlePlanChange(planKey, 'currency', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  {/* Billing (si aplica) */}
                  {plan.billing && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tipo de Facturación</label>
                      <input
                        type="text"
                        value={plan.billing}
                        onChange={(e) => handlePlanChange(planKey, 'billing', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="monthly, yearly, one_time"
                      />
                    </div>
                  )}

                  {/* Discount (si aplica) */}
                  {planKey === 'pro_yearly' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Descuento Especial</label>
                      <input
                        type="text"
                        value={plan.discount || ''}
                        onChange={(e) => handlePlanChange(planKey, 'discount', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: 2 meses gratis"
                      />
                    </div>
                  )}

                  {/* Features */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Características</label>
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(planKey, index, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-gray-900/50 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Característica ${index + 1}`}
                          />
                          <button
                            onClick={() => removeFeature(planKey, index)}
                            className="px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addFeature(planKey)}
                        className="w-full px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors text-xs"
                      >
                        + Agregar Feature
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Vista Previa */}
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold text-${color}-400`}>
                      {plan.currency === 'USD' ? '$' : plan.currency === 'EUR' ? '€' : '£'}
                      {plan.price}
                    </span>
                    {plan.billing && (
                      <span className="text-sm text-gray-400">
                        /{plan.billing === 'monthly' ? 'mes' : plan.billing === 'yearly' ? 'año' : 'único'}
                      </span>
                    )}
                  </div>
                  {plan.discount && (
                    <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                      💰 {plan.discount}
                    </div>
                  )}
                  <ul className="space-y-1 mt-3">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className={`text-${color}-400`}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-gray-500 italic">
                        +{plan.features.length - 3} más...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          💡 <strong>Tip:</strong> Estos precios se usarán en las respuestas del chatbot cuando los usuarios pregunten sobre planes.
        </p>
      </div>
    </div>
  );
}

