'use client';

import { useState } from 'react';
import { X, Plus, FileText, BookOpen, BarChart3, Loader2, Upload, CheckCircle, Image, Wand2 } from 'lucide-react';
import { useSanityIntegration } from '@/hooks/useSanityIntegration';
import GrokImageGenerator from './GrokImageGenerator';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateContentModal({ isOpen, onClose, onSuccess }: CreateContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'blog' as 'blog' | 'docs' | 'indicators',
    language: 'es' as 'es' | 'en',
    user_prompt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sanityResult, setSanityResult] = useState<any>(null);
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const { createContent, config, loading: sanityLoading } = useSanityIntegration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Primero crear en la cola local
      const queueResponse = await fetch('/api/admin/content-creator/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const queueResult = await queueResponse.json();

      if (!queueResponse.ok) {
        throw new Error(queueResult.error || 'Error creating content in queue');
      }

      // Luego crear en Sanity si está configurado
      if (config?.isConfigured) {
        const sanityResult = await createContent({
          ...formData,
          queueItemId: queueResult.queueItem?.id
        });

        if (sanityResult.success) {
          setSanityResult(sanityResult);
          setSuccess(true);
          
          // Mostrar éxito por 2 segundos antes de cerrar
          setTimeout(() => {
            // Reset form
            setFormData({
              title: '',
              content: '',
              type: 'blog',
              language: 'es',
              user_prompt: '',
            });
            setSuccess(false);
            setSanityResult(null);
            onSuccess();
            onClose();
          }, 2000);
        } else {
          throw new Error(sanityResult.error || 'Error creating content in Sanity');
        }
      } else {
        // Si Sanity no está configurado, solo crear en cola
        setSuccess(true);
        setTimeout(() => {
          setFormData({
            title: '',
            content: '',
            type: 'blog',
            language: 'es',
            user_prompt: '',
          });
          setSuccess(false);
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImageUrl(imageUrl);
    setIsImageGeneratorOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-apidevs-primary" />
            Crear Contenido
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Estado de Sanity */}
          {config && (
            <div className={`p-3 rounded-lg border ${
              config.isConfigured 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-yellow-900/20 border-yellow-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {config.isConfigured ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Upload className="h-4 w-4 text-yellow-400" />
                )}
                <span className={`text-sm ${
                  config.isConfigured ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  Sanity: {config.isConfigured ? 'Configurado' : 'No configurado'}
                </span>
              </div>
              {!config.isConfigured && (
                <p className="text-xs text-yellow-300 mt-1">
                  El contenido se creará solo en la cola local hasta que configures Sanity
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <p className="text-green-400 text-sm font-medium">¡Contenido creado exitosamente!</p>
              </div>
              {sanityResult && (
                <div className="text-xs text-green-300">
                  <p>Documento ID: {sanityResult.documentId}</p>
                  <p>Estado: {config?.isConfigured ? 'Creado en Sanity' : 'Creado en cola local'}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Contenido
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                required
              >
                <option value="blog">📝 Blog Post</option>
                <option value="docs">📚 Documentación</option>
                <option value="indicators">📊 Indicadores</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Idioma
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
                required
              >
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título del contenido..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt del Usuario (Opcional)
            </label>
            <textarea
              name="user_prompt"
              value={formData.user_prompt}
              onChange={handleChange}
              placeholder="Describe qué tipo de contenido quieres crear..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contenido
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Escribe el contenido aquí..."
              rows={8}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apidevs-primary/50 resize-none"
              required
            />
          </div>

          {/* Generación de imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Imagen (Opcional)
            </label>
            
            {generatedImageUrl ? (
              <div className="space-y-3">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated content image" 
                  className="w-full max-w-md mx-auto rounded-lg border border-white/10"
                />
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImageGeneratorOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generar Nueva Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneratedImageUrl(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Quitar Imagen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsImageGeneratorOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:from-purple-600/30 hover:to-blue-600/30 transition-all"
              >
                <Image className="h-5 w-5" />
                Generar Imagen con Grok AI
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-apidevs-primary to-purple-600 hover:from-apidevs-primary/90 hover:to-purple-600/90 text-white rounded-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isSubmitting ? 'Creando...' : success ? '¡Creado!' : 'Crear Contenido'}
            </button>
          </div>
        </form>
      </div>

      {/* Generador de imágenes con Grok */}
      <GrokImageGenerator
        isOpen={isImageGeneratorOpen}
        onClose={() => setIsImageGeneratorOpen(false)}
        onImageGenerated={handleImageGenerated}
        contentTitle={formData.title}
        contentType={formData.type}
      />
    </div>
  );
}
