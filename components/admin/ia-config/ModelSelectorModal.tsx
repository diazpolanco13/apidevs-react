'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import ContentCreatorModelSelector from './ContentCreatorModelSelector';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onSave: (modelId: string) => Promise<void>;
}

export default function ModelSelectorModal({ isOpen, onClose, currentModel, onSave }: Props) {
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedModel);
      onClose();
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Error al guardar el modelo');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">Seleccionar Modelo de IA</h3>
            <p className="text-sm text-gray-400 mt-1">
              Elige el modelo para generar contenido de alta calidad
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <ContentCreatorModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Modelo seleccionado: <span className="text-white font-medium">{selectedModel}</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || selectedModel === currentModel}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar Modelo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

