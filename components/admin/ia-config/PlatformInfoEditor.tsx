"use client";

import { Info, Sparkles } from "lucide-react";

interface PlatformInfo {
  name: string;
  description: string;
  features: string[];
}

interface PlatformInfoEditorProps {
  platformInfo: PlatformInfo;
  onChange: (info: PlatformInfo) => void;
}

export default function PlatformInfoEditor({ platformInfo, onChange }: PlatformInfoEditorProps) {
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...platformInfo.features];
    newFeatures[index] = value;
    onChange({ ...platformInfo, features: newFeatures });
  };

  const addFeature = () => {
    onChange({ 
      ...platformInfo, 
      features: [...platformInfo.features, ""] 
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = platformInfo.features.filter((_, i) => i !== index);
    onChange({ ...platformInfo, features: newFeatures });
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Info className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Información de la Plataforma</h3>
          <p className="text-sm text-gray-400">Configura los datos generales que el chatbot conocerá sobre APIDevs</p>
        </div>
      </div>

      {/* Nombre de la plataforma */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nombre de la Plataforma
        </label>
        <input
          type="text"
          value={platformInfo.name}
          onChange={(e) => onChange({ ...platformInfo, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="APIDevs Trading Platform"
        />
      </div>

      {/* Descripción */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          value={platformInfo.description}
          onChange={(e) => onChange({ ...platformInfo, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Plataforma de indicadores premium para TradingView"
        />
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Características Principales
        </label>
        <div className="space-y-2">
          {platformInfo.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Característica ${index + 1}`}
              />
              <button
                onClick={() => removeFeature(index)}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addFeature}
          className="mt-3 w-full px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Agregar Característica
        </button>
      </div>
    </div>
  );
}

