'use client';

import { useState } from 'react';
import { FileText, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { AIConfig } from './AIConfigurationClient';

interface Props {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
}

const DEFAULT_PROMPT = `Eres el asistente virtual de APIDevs Trading Platform.

INFORMACIÓN SOBRE APIDEVS:
- Somos una plataforma de indicadores de TradingView
- Tenemos 4 planes: FREE (gratis), PRO Mensual ($39/mes), PRO Anual ($390/año), Lifetime ($999)
- Los usuarios obtienen acceso a indicadores premium y free

TU ROL:
- Responde preguntas sobre planes, precios, indicadores
- Ayuda con consultas sobre el perfil del usuario
- Gestiona accesos si el usuario es administrador
- Tono profesional pero amigable`;

export default function SystemPromptEditor({ config, updateConfig }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const currentPrompt = config.system_prompt || DEFAULT_PROMPT;

  const handleReset = () => {
    if (confirm('¿Estás seguro de restaurar el prompt por defecto? Se perderán los cambios actuales.')) {
      updateConfig({ system_prompt: DEFAULT_PROMPT });
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <FileText className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">System Prompt</h3>
            <p className="text-sm text-gray-400">Personaliza la personalidad y comportamiento de la IA</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Ocultar' : 'Preview'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg text-sm text-orange-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-4">
        <textarea
          value={currentPrompt}
          onChange={(e) => updateConfig({ system_prompt: e.target.value })}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          rows={12}
          className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-sm text-gray-200 font-mono resize-y focus:outline-none transition-all ${
            isEditing 
              ? 'border-green-500 ring-2 ring-green-500/20' 
              : 'border-white/10'
          }`}
          placeholder="Escribe el system prompt aquí..."
        />

        {/* Character Count */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{currentPrompt.length} caracteres</span>
          <span>{Math.ceil(currentPrompt.length / 4)} tokens aprox.</span>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <Eye className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-300 mb-1">Vista Previa del Prompt</h4>
                <p className="text-xs text-blue-300/70">Así verá la IA las instrucciones:</p>
              </div>
            </div>
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs text-gray-300 bg-black/30 p-3 rounded">
                {currentPrompt}
              </pre>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <h4 className="text-sm font-bold text-purple-300 mb-2">💡 Tips para un buen System Prompt:</h4>
          <ul className="space-y-1 text-xs text-purple-300/80">
            <li>• Define claramente el rol y propósito del asistente</li>
            <li>• Especifica el tono de comunicación deseado</li>
            <li>• Incluye información contextual sobre APIDevs</li>
            <li>• Menciona qué debe hacer y qué NO debe hacer</li>
            <li>• Añade ejemplos de interacciones deseadas</li>
            <li>• Mantén las instrucciones claras y concisas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

